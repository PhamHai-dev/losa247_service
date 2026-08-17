const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity, toLegacyUser } = require('../../repositories/core/legacyMapper');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { getIo } = require('../../config/socket');
const { processChatReply } = require('../../services/chat/automationService');

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
    const existing = await prisma.chatSession.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy phiên',
        },
      });
    }

    const session = await prisma.chatSession.update({
      where: { id: req.params.id },
      data: {
        mode: 'human',
        assignedAdminId: req.user._id,
      },
      include: {
        assignedAdmin: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    getIo().of('/chat').to(session.id).emit('session_mode_changed', {
      mode: 'human',
      adminId: req.user._id,
    });

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
    const existing = await prisma.chatSession.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy phiên',
        },
      });
    }

    const session = await prisma.chatSession.update({
      where: { id: req.params.id },
      data: {
        mode: 'bot',
        assignedAdminId: null,
      },
    });

    getIo().of('/chat').to(session.id).emit('session_mode_changed', { mode: 'bot' });

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
      getIo().of('/chat').to(command.sessionId).emit('bot_reply', toLegacyEntity(responseMessage));
    }

    return res.json(response);
  } catch (err) {
    return next(err);
  }
};
