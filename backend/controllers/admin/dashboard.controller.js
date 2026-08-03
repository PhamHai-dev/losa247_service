const Lead = require('../../models/Lead.model');
const Service = require('../../models/Service.model');
const Blog = require('../../models/Blog.model');
const ChatSession = require('../../models/ChatSession.model');

exports.getKpis = async (req, res, next) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    // 1. New Leads this month
    const newLeads = await Lead.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // 2. Total active Services
    const totalServices = await Service.countDocuments({ status: 'visible' });

    // 3. Total published Blogs
    const totalBlogs = await Blog.countDocuments({ status: 'published' });

    // 4. Pending Tasks: New leads + Open chat sessions
    const unhandledLeadsCount = await Lead.countDocuments({ status: 'new' });
    const openChatsCount = await ChatSession.countDocuments({ status: 'open' });
    const pendingTasks = unhandledLeadsCount + openChatsCount;

    res.json({
      success: true,
      data: {
        newLeads,
        totalServices,
        totalBlogs,
        pendingTasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeadsChart = async (req, res, next) => {
  try {
    const { range = '30d' } = req.query;
    let startDate = new Date();
    let format = "%Y-%m-%d";

    if (range === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (range === '1y') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      format = "%Y-%m"; // Group by month if 1 year
    } else {
      startDate.setDate(startDate.getDate() - 30); // Default to 30d
    }

    const chartData = await Lead.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: format, date: "$createdAt" } },
          leads: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: chartData,
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeadStatus = async (req, res, next) => {
  try {
    const statuses = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: statuses,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecentLeads = async (req, res, next) => {
  try {
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('serviceInterested', 'name')
      .select('name phone serviceInterested status createdAt');
      
    res.json({
      success: true,
      data: recentLeads,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPopularContent = async (req, res, next) => {
  try {
    const popularBlogs = await Blog.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title views slug createdAt');

    res.json({
      success: true,
      data: popularBlogs,
    });
  } catch (err) {
    next(err);
  }
};
