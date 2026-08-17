const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');
const { verifyToken } = require('../../helpers/token');
const uploadHelper = require('../../helpers/upload');

exports.startSession = async (req, res, next) => {
  try {
    const { customerName, customerPhone } = req.body;
    let customerId = null;
    if (req.headers.authorization?.startsWith('Bearer')) {
      try {
        customerId = verifyToken(req.headers.authorization.split(' ')[1], 'client', 'access').id;
      } catch {
        /* Khách chưa đăng nhập vẫn có thể bắt đầu phiên chat ẩn danh. */
      }
    }
    if (customerId) {
      let existing = await prisma.chatSession.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        if (customerName || customerPhone)
          existing = await prisma.chatSession.update({
            where: { id: existing.id },
            data: {
              ...(customerName ? { customerName } : {}),
              ...(customerPhone ? { customerPhone } : {}),
            },
          });
        return res.status(200).json({ success: true, data: toLegacyEntity(existing) });
      }
    }
    const session = await prisma.chatSession.create({
      data: {
        id: createEntityId(),
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        customerId,
        mode: 'bot',
        status: 'open',
      },
    });
    return res.status(201).json({ success: true, data: toLegacyEntity(session) });
  } catch (err) {
    return next(err);
  }
};

exports.getSessionMessages = async (req, res, next) => {
  try {
    const rows = await prisma.chatMessage.findMany({
      where: { sessionId: req.params.sessionId },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ success: true, data: rows.map(toLegacyEntity) });
  } catch (err) {
    return next(err);
  }
};
exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, error: { code: 'NO_FILE', message: 'Vui lòng chọn file' } });
    const secureUrl = await uploadHelper.uploadToCloudinary(req.file);
    return res.json({ success: true, data: { url: secureUrl } });
  } catch (err) {
    return next(err);
  }
};
