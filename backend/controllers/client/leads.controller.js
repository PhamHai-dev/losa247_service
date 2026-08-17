const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const { toLegacyEntity } = require('../../repositories/core/legacyMapper');
const { getIo } = require('../../config/socket');
const { normalizeLeadFormConfig, validateSubmission } = require('../../validators/leadForm.validator');

exports.createLead = async (req, res, next) => {
  try {
    const settings = await prisma.settings.findFirst({ select: { leadFormConfig: true } });
    const config = normalizeLeadFormConfig(settings?.leadFormConfig);
    let values;
    try { values = validateSubmission(config, req.body.values || req.body); }
    catch (error) { return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } }); }
    const name = values.name || values.fullName || null;
    const phoneField = config.fields.find((field) => field.type === 'phone' && values[field.key] !== undefined);
    const emailField = config.fields.find((field) => field.type === 'email' && values[field.key] !== undefined);
    const phone = values.phone || (phoneField ? String(values[phoneField.key]) : null);
    const email = values.email || (emailField ? String(values[emailField.key]) : null);
    const { lead, notification } = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({ data: { id: createEntityId(), name, phone, email, source: 'form', status: 'new', notes: [], customFields: { formVersion: config.version, values } } });
      const notification = await tx.notification.create({ data: { id: createEntityId(), title: 'Lead mới', message: `${lead.name || lead.phone || lead.email || 'Một khách hàng'} vừa đăng ký tư vấn.`, type: 'lead', link: '/admin/leads' } });
      return { lead, notification };
    });
    const legacyNotification = toLegacyEntity(notification);
    getIo().of('/notifications').to('admin_notifications').emit('new_notification', legacyNotification);
    return res.status(201).json({ success: true, data: toLegacyEntity(lead) });
  } catch (err) { return next(err); }
};
