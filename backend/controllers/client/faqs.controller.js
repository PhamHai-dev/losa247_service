const Faq = require('../../models/Faq.model');
const { paginate, buildPaginationResponse } = require('../../helpers/format');

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
