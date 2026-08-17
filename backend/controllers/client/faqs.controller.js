const { prisma } = require('../../config/prisma');
const { paginate, buildPaginationResponse } = require('../../helpers/format');

const legacyFaq = ({ id, categoryId, ...faq }) => ({ _id: id, id, ...faq, category: categoryId });

exports.getFaqs = async (req, res, next) => {
  try {
    const { page, limit, search, category, serviceDetail, pageType } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });
    const where = {
      ...(pageType ? { page: pageType } : {}),
      ...(category ? { categoryId: category } : {}),
      ...(serviceDetail ? { serviceDetail } : {}),
      ...(search ? { question: { contains: search } } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.faq.findMany({ where, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], skip, take: l }),
      prisma.faq.count({ where }),
    ]);
    return res.json(buildPaginationResponse(rows.map(legacyFaq), total, p, l));
  } catch (err) { return next(err); }
};
