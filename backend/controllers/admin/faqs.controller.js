const Faq = require('../../models/Faq.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');
const { faqSchema } = require('../../validators/admin/faqs.validator');

exports.getFaqs = async (req, res, next) => {
  try {
    const { page, limit, search, category, relatedService } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = {};
    if (category) filter.category = category;
    if (relatedService) filter.relatedService = relatedService;
    if (search) {
      filter.question = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      Faq.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(l),
      Faq.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) {
    next(err);
  }
};

exports.createFaq = async (req, res, next) => {
  try {
    const data = faqSchema.parse(req.body);
    const faq = new Faq(data);
    await faq.save();
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.updateFaq = async (req, res, next) => {
  try {
    const data = faqSchema.parse(req.body);
    const faq = await Faq.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!faq) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy FAQ' } });
    res.json({ success: true, data: faq });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } });
    next(err);
  }
};

exports.deleteFaq = async (req, res, next) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xoá FAQ' });
  } catch (err) {
    next(err);
  }
};

exports.reorderFaqs = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds phải là một mảng' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index },
      },
    }));

    await Faq.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Đã cập nhật thứ tự FAQ' });
  } catch (err) {
    next(err);
  }
};

exports.searchSuggestions = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (!search) return res.json({ success: true, data: [] });

    const faqs = await Faq.find({ question: { $regex: search, $options: 'i' } })
      .select('question')
      .limit(5);

    res.json({ success: true, data: faqs });
  } catch (err) {
    next(err);
  }
};
