const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { processChatReply } = require('../../services/chat/automationService');
const { takeover, release } = require('../../services/chat/handoffService');
const { publish } = require('../../services/realtime/eventPublisher');
const { subscribe } = require('../../services/realtime/sseHub');
const { createStreamTicket, verifyStreamTicket } = require('../../services/realtime/streamTicketService');

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
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      data: messages.map(toLegacyEntity),
    });
  } catch (err) {
    return next(err);
  }
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

exports.sendMessage = async (req, res, next) => {
  try {
    const session = await prisma.chatSession.findFirst({ where: { id: req.params.id, mode: 'human', OR: [{ assignedAdminId: req.user._id }, { assignedAdminId: null }] } });
    if (!session) return res.status(409).json({ success: false, error: { code: 'HUMAN_MODE_REQUIRED', message: 'Admin chưa tiếp quản phiên' } });
    const message = await prisma.$transaction(async (tx) => {
      if (!session.assignedAdminId) await tx.chatSession.update({ where: { id: session.id }, data: { assignedAdminId: req.user._id } });
      const created = await tx.chatMessage.create({ data: { id: createEntityId(), sessionId: session.id, sender: 'admin', content: String(req.body.content || '').trim(), attachments: Array.isArray(req.body.attachments) ? req.body.attachments : [], status: 'sent' } });
      await tx.chatSession.update({ where: { id: session.id }, data: { lastMessageAt: new Date(), lastReplyAt: new Date() } });
      return created;
    });
    const data = toLegacyEntity(message);
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
