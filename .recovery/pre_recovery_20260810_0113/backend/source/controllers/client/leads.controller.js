const Lead = require('../../models/Lead.model');
const Notification = require('../../models/Notification.model');
const { getIo } = require('../../config/socket');

exports.createLead = async (req, res, next) => {
  try {
    const { name, phone, email, description, serviceId } = req.body;
    
    // Create lead
    const lead = new Lead({
      name,
      phone,
      email,
      source: 'form',
      serviceInterested: serviceId || null,
      status: 'new',
      notes: description ? [{ content: description }] : []
    });

    await lead.save();

    // Create and emit notification
    const notif = new Notification({
      title: 'Lead mới',
      message: `${lead.name} vừa đăng ký tư vấn.`,
      type: 'lead',
      link: '/admin/leads'
    });
    await notif.save();

    const io = getIo();
    io.of('/notifications').to('admin_notifications').emit('new_notification', notif);

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};
