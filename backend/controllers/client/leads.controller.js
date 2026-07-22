const Lead = require('../../models/Lead.model');

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

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};
