const crypto = require('crypto');
const fs = require('fs');
const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');
const { verifyToken } = require('../../helpers/token');
const uploadHelper = require('../../helpers/upload');
const { createCustomerMessage } = require('../../services/chat/messageService');
const { takeover } = require('../../services/chat/handoffService');
const { publish } = require('../../services/realtime/eventPublisher');
const { subscribe } = require('../../services/realtime/sseHub');
const { createSessionToken, hashSessionToken, matchesSessionToken } = require('../../services/realtime/streamTicketService');

const resolveCustomerId = (req) => {
  if (!req.headers.authorization?.startsWith('Bearer ')) return null;
  try { return verifyToken(req.headers.authorization.slice(7), 'client', 'access').id; } catch { return null; }
};
const sessionToken = (req) => req.get('x-chat-session-token') || req.query.token;
const getAuthorizedSession = async (req, sessionId) => {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) return null;
  const customerId = resolveCustomerId(req);
  if ((customerId && session.customerId === customerId) || matchesSessionToken(sessionToken(req), session.sessionTokenHash)) return session;
  return null;
};
const deny = (res) => res.status(403).json({ success: false, error: { code: 'SESSION_FORBIDDEN', message: 'Không có quyền truy cập phiên chat' } });
const mapClientMessage = (message, token) => ({
  ...toLegacyEntity(message),
  attachmentRows: undefined,
  attachments: (message.attachmentRows || []).filter((item) => item.scanStatus === 'clean').map((item) => ({
    id: item.id,
    url: item.storagePath ? uploadHelper.chatContentUrl(item.id, token) : null,
    mimeType: item.mimeType,
  })).filter((item) => item.url),
});

exports.startSession = async (req, res, next) => {
  try {
    const { customerName, customerPhone } = req.body;
    const customerId = resolveCustomerId(req);
    if (customerId) {
      const existing = await prisma.chatSession.findFirst({ where: { customerId, status: 'open' }, orderBy: { createdAt: 'desc' } });
      if (existing) {
        const token = createSessionToken();
        const secured = await prisma.chatSession.update({ where: { id: existing.id }, data: { sessionTokenHash: hashSessionToken(token), ...(customerName ? { customerName } : {}), ...(customerPhone ? { customerPhone } : {}) } });
        return res.json({ success: true, data: { ...toLegacyEntity(secured), sessionToken: token } });
      }
    }
    const token = createSessionToken();
    const session = await prisma.chatSession.create({ data: { id: createEntityId(), customerName: customerName || null, customerPhone: customerPhone || null, customerId, sessionTokenHash: hashSessionToken(token), mode: 'bot', status: 'open' } });
    return res.status(201).json({ success: true, data: { ...toLegacyEntity(session), sessionToken: token } });
  } catch (err) { return next(err); }
};

exports.getSessionMessages = async (req, res, next) => {
  try {
    if (!await getAuthorizedSession(req, req.params.sessionId)) return deny(res);
    const after = req.query.after ? new Date(req.query.after) : null;
    const rows = await prisma.chatMessage.findMany({ where: { sessionId: req.params.sessionId, ...(after && !Number.isNaN(after.valueOf()) ? { createdAt: { gt: after } } : {}) }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: 200, include: { attachmentRows: true } });
    return res.json({ success: true, data: rows.map((row) => mapClientMessage(row, sessionToken(req))) });
  } catch (err) { return next(err); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const session = await getAuthorizedSession(req, req.params.sessionId);
    if (!session) return deny(res);
    const result = await createCustomerMessage({ sessionId: session.id, clientMessageId: req.body.clientMessageId || crypto.randomUUID(), content: String(req.body.content || '').trim(), attachmentIds: Array.isArray(req.body.attachmentIds) ? req.body.attachmentIds : [] });
    const message = mapClientMessage(result.message, sessionToken(req));
    if (!result.duplicate) await publish({ type: 'message.created', sessionId: session.id, data: message });
    if (result.limitReached) {
      await publish({ type: 'session.mode_changed', sessionId: session.id, data: { mode: 'human', version: result.session.version, reason: 'context_limit' } });
    }
    return res.status(result.duplicate ? 200 : 201).json({ success: true, duplicate: result.duplicate, data: message, meta: { mode: result.session?.mode || session.mode, limitReached: Boolean(result.limitReached) } });
  } catch (err) { return next(err); }
};

exports.requestHuman = async (req, res, next) => {
  try {
    const current = await getAuthorizedSession(req, req.params.sessionId);
    if (!current) return deny(res);
    const session = current.mode === 'human' ? current : await takeover({ sessionId: current.id, expectedVersion: current.version, adminId: null, reason: 'customer_request' });
    await publish({ type: 'session.mode_changed', sessionId: session.id, data: { mode: 'human', version: session.version } });
    return res.json({ success: true, data: toLegacyEntity(session) });
  } catch (err) { return next(err); }
};

exports.streamEvents = async (req, res, next) => {
  try {
    const session = await getAuthorizedSession(req, req.params.sessionId);
    if (!session) return deny(res);
    return subscribe({ req, res, scope: 'session', principalId: session.id });
  } catch (err) { return next(err); }
};

exports.getAttachmentContent = async (req, res, next) => {
  try {
    const attachment = await prisma.chatAttachment.findUnique({ where: { id: req.params.attachmentId } });
    if (!attachment || !attachment.storagePath) return res.status(404).json({ success: false, error: { code: 'ATTACHMENT_NOT_FOUND', message: 'Không tìm thấy ảnh' } });
    const session = await getAuthorizedSession(req, attachment.sessionId);
    const signedAutomationRequest = uploadHelper.hasValidAutomationSignature(attachment.id, req.query.expires, req.query.signature);
    if (!session && !signedAutomationRequest) return deny(res);
    const absolutePath = uploadHelper.safeResolve(uploadHelper.PRIVATE_ROOT, attachment.storagePath);
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ success: false, error: { code: 'ATTACHMENT_FILE_NOT_FOUND', message: 'File ảnh không còn tồn tại' } });
    res.type(attachment.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.sendFile(absolutePath);
  } catch (err) { return next(err); }
};

exports.uploadAttachment = async (req, res, next) => {
  let stored;
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Vui lòng chọn file' } });
    const session = await getAuthorizedSession(req, req.body.sessionId);
    if (!session) return deny(res);
    const id = createEntityId();
    stored = await uploadHelper.saveChatAttachment(req.file, { sessionId: session.id, attachmentId: id });
    const row = await prisma.chatAttachment.create({ data: { id, sessionId: session.id, provider: 'local', publicId: null, storagePath: stored.relativePath, resourceType: 'image', deliveryType: 'private', format: stored.format, originalName: req.file.originalname, mimeType: req.file.mimetype, size: BigInt(req.file.size), sha256: crypto.createHash('sha256').update(req.file.buffer).digest('hex'), scanStatus: 'clean' } });
    return res.status(201).json({ success: true, data: { id: row.id, url: uploadHelper.chatContentUrl(row.id, sessionToken(req)), mimeType: row.mimeType } });
  } catch (err) {
    if (stored?.relativePath) await uploadHelper.deleteChatAttachment(stored.relativePath).catch(() => {});
    return next(err);
  }
};

