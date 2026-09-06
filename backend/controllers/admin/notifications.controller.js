const { prisma } = require('../../config/prisma');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');
const { subscribe } = require('../../services/realtime/sseHub');
const { createStreamTicket, verifyStreamTicket } = require('../../services/realtime/streamTicketService');

const visibleWhere = (req) => ({ OR: [{ recipientId: null }, { recipientId: String(req.user._id) }] });

exports.getNotifications = async (req, res, next) => {
  try {
    const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || 20);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const where = visibleWhere(req);
    const [rows, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { AND: [where, { isRead: false }] } }),
    ]);
    return res.status(200).json({ success: true, data: rows.map(toLegacyEntity), total, unreadCount });
  } catch (err) { return next(err); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const where = visibleWhere(req);
    if (req.params.id === 'all') await prisma.notification.updateMany({ where: { AND: [where, { isRead: false }] }, data: { isRead: true } });
    else await prisma.notification.updateMany({ where: { AND: [where, { id: req.params.id }] }, data: { isRead: true } });
    return res.status(200).json({ success: true, message: 'Updated successfully' });
  } catch (err) { return next(err); }
};

exports.createStreamTicket = (req, res) => res.json({
  success: true,
  data: { ticket: createStreamTicket({ principalId: String(req.user._id), scope: 'admin' }) },
});

exports.streamEvents = (req, res) => {
  const ticket = verifyStreamTicket(req.query.ticket, 'admin');
  if (!ticket) return res.status(401).json({ success: false, error: { code: 'INVALID_STREAM_TICKET', message: 'Stream ticket không hợp lệ hoặc đã hết hạn' } });
  return subscribe({ req, res, scope: 'notification', principalIds: ['all', ticket.principalId] });
};
