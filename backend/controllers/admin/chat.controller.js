const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { processChatReply } = require('../../services/chat/automationService');
const { takeover, release } = require('../../services/chat/handoffService');
const { publish } = require('../../services/realtime/eventPublisher');
const { subscribe } = require('../../services/realtime/sseHub');
const { createStreamTicket, verifyStreamTicket } = require('../../services/realtime/streamTicketService');
const uploadHelper = require('../../helpers/upload');

const mapAdminMessage = (message) => ({
  ...toLegacyEntity(message),
  attachmentRows: undefined,
  attachments: (message.attachmentRows || []).map((item) => ({ id: item.id, mimeType: item.mimeType })),
});

const mapSession = ({ customer, assignedAdmin, assignedAdminId, ...session }) => ({
  ...toLegacyEntity(session),
  customerEmail: customer?.email || null,
  assignedAdmin: assignedAdmin ? toLegacyUser(assignedAdmin) : assignedAdminId,
});

exports.getSessions = async (req, res, next) => {
  try {
    const { search, status, mode } = req.query;
    const { skip, limit, page } = paginate(req.query, req.query);
    const where = {
      ...(status ? { status } : {}),
      ...(mode ? { mode } : {}),
      ...(search
        ? {
          OR: [
            { customerName: { contains: search } },
            { customer: { email: { contains: search } } },
          ],
        }
        : {}),
    };

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where,
        include: {
          customer: {
            select: {
              email: true,
            },
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chatSession.count({ where }),
    ]);

    return res.json(buildPaginationResponse(sessions.map(mapSession), total, page, limit));
  } catch (err) {
    return next(err);
  }
};

exports.getSessionMessages = async (req, res, next) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: req.params.id },
      include: { attachmentRows: true },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      data: messages.map(mapAdminMessage),
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAttachmentContent = async (req, res, next) => {
  try {
    const attachment = await prisma.chatAttachment.findUnique({ where: { id: req.params.attachmentId } });
    if (!attachment || !attachment.storagePath) return res.status(404).json({ success: false, error: { code: 'ATTACHMENT_NOT_FOUND', message: 'Không tìm thấy ảnh' } });
    const absolutePath = uploadHelper.safeResolve(uploadHelper.PRIVATE_ROOT, attachment.storagePath);
    res.type(attachment.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.sendFile(absolutePath);
  } catch (err) { return next(err); }
};

exports.takeoverSession = async (req, res, next) => {
  try {
    const current = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phiên' } });
    const session = current.mode === 'human'
      ? current
      : await takeover({ sessionId: current.id, expectedVersion: current.version, adminId: req.user._id, reason: 'admin_takeover' });

    await publish({ type: 'session.mode_changed', sessionId: session.id, data: { mode: 'human', adminId: req.user._id, version: session.version } });

    return res.json({
      success: true,
      data: mapSession(session),
    });
  } catch (err) {
    return next(err);
  }
};

exports.releaseSession = async (req, res, next) => {
  try {
    const current = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phiên' } });
    const session = current.mode === 'bot'
      ? current
      : await release({ sessionId: current.id, expectedVersion: current.version, adminId: req.user._id, reason: 'manual_release' });

    await publish({ type: 'session.mode_changed', sessionId: session.id, data: { mode: 'bot', version: session.version } });

    return res.json({
      success: true,
      data: toLegacyEntity(session),
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateMessageFeedback = async (req, res, next) => {
  try {
    const existing = await prisma.chatMessage.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy tin nhắn',
        },
      });
    }

    const message = await prisma.chatMessage.update({
      where: { id: req.params.id },
      data: { feedback: req.body.feedback },
    });

    return res.json({
      success: true,
      data: toLegacyEntity(message),
    });
  } catch (err) {
    return next(err);
  }
};

exports.uploadAttachment = async (req, res, next) => {
  let stored;
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Vui lòng chọn ảnh' } });
    const session = await prisma.chatSession.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy phiên' } });
    const id = createEntityId();
    stored = await uploadHelper.saveChatAttachment(req.file, { sessionId: session.id, attachmentId: id });
    const row = await prisma.chatAttachment.create({ data: { id, sessionId: session.id, provider: 'local', storagePath: stored.relativePath, resourceType: 'image', deliveryType: 'private', format: stored.format, originalName: req.file.originalname, mimeType: req.file.mimetype, size: BigInt(req.file.size), sha256: require('crypto').createHash('sha256').update(req.file.buffer).digest('hex'), scanStatus: 'clean' } });
    return res.status(201).json({ success: true, data: { id: row.id, mimeType: row.mimeType } });
  } catch (err) {
    if (stored?.relativePath) await uploadHelper.deleteChatAttachment(stored.relativePath).catch(() => {});
    return next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const session = await prisma.chatSession.findFirst({ where: { id: req.params.id, mode: 'human', OR: [{ assignedAdminId: req.user._id }, { assignedAdminId: null }] } });
    if (!session) return res.status(409).json({ success: false, error: { code: 'HUMAN_MODE_REQUIRED', message: 'Admin chưa tiếp quản phiên' } });
    const attachmentIds = Array.isArray(req.body.attachmentIds) ? req.body.attachmentIds : [];
    const message = await prisma.$transaction(async (tx) => {
      if (attachmentIds.length) {
        const count = await tx.chatAttachment.count({ where: { id: { in: attachmentIds }, sessionId: session.id, messageId: null } });
        if (count !== attachmentIds.length) throw Object.assign(new Error('Attachment không hợp lệ'), { statusCode: 400, code: 'INVALID_ATTACHMENT' });
      }
      if (!session.assignedAdminId) await tx.chatSession.update({ where: { id: session.id }, data: { assignedAdminId: req.user._id } });
      const created = await tx.chatMessage.create({ data: { id: createEntityId(), sessionId: session.id, sender: 'admin', content: String(req.body.content || '').trim(), attachments: [], messageType: attachmentIds.length ? (req.body.content ? 'mixed' : 'image') : 'text', status: 'sent' } });
      if (attachmentIds.length) await tx.chatAttachment.updateMany({ where: { id: { in: attachmentIds } }, data: { messageId: created.id } });
      await tx.chatSession.update({ where: { id: session.id }, data: { lastMessageAt: new Date(), lastReplyAt: new Date() } });
      return tx.chatMessage.findUnique({ where: { id: created.id }, include: { attachmentRows: true } });
    });
    const data = mapAdminMessage(message);
    await publish({ type: 'message.created', sessionId: session.id, data });
    return res.status(201).json({ success: true, data });
  } catch (err) { return next(err); }
};

exports.createStreamTicket = (req, res) => res.json({ success: true, data: { ticket: createStreamTicket({ principalId: req.user._id, scope: 'admin' }) } });
exports.streamEvents = (req, res) => {
  const ticket = verifyStreamTicket(req.query.ticket, 'admin');
  if (!ticket) return res.status(401).json({ success: false, error: { code: 'INVALID_STREAM_TICKET', message: 'Stream ticket không hợp lệ hoặc đã hết hạn' } });
  return subscribe({ req, res, scope: 'admin', principalId: 'all' });
};

// Webhook từ n8n trả lời chat
exports.n8nChatReplyWebhook = async (req, res, next) => {
  try {
    const command = req.body;
    if (
      command?.command !== 'chat.reply' ||
      !command.eventId ||
      !command.sessionId ||
      !command.payload?.content ||
      !Number.isInteger(command.expectedVersion)
    ) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COMMAND', message: 'Callback n8n không đúng định dạng chat.reply' },
      });
    }

    const result = await processChatReply(command);
    const response = result.duplicate ? result.response : result;
    const responseMessage = response?.data;

    if (responseMessage) {
      const message = toLegacyEntity(responseMessage);
      if (!result.duplicate) await publish({ type: 'message.created', sessionId: command.sessionId, data: message });
    }

    return res.json(response);
  } catch (err) {
    return next(err);
  }
};
