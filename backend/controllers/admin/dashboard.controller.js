const Lead = require('../../models/Lead.model');
const Order = require('../../models/Order.model');

exports.getKpis = async (req, res, next) => {
  try {
    // 1. Tính tổng số lead mới trong tháng này
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newLeads = await Lead.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // 2. Tính tổng số đơn hàng
    const totalOrders = await Order.countDocuments({});

    // 3. Tính tổng doanh thu từ các đơn hàng đã thanh toán hoặc hoàn thành
    const revenueDocs = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'active', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueDocs.length > 0 ? revenueDocs[0].totalRevenue : 0;

    // 4. Trả kết quả
    res.json({
      success: true,
      data: {
        newLeads,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueChart = async (req, res, next) => {
  try {
    // 1. Nhóm doanh thu theo ngày trong 30 ngày gần nhất
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const chartData = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['paid', 'active', 'completed'] },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Trả kết quả
    res.json({
      success: true,
      data: chartData,
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeadSources = async (req, res, next) => {
  try {
    // 1. Thống kê số lượng lead theo từng nguồn
    const sources = await Lead.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
        }
      }
    ]);

    // 2. Trả kết quả
    res.json({
      success: true,
      data: sources,
    });
  } catch (err) {
    next(err);
  }
};
