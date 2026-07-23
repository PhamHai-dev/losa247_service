const PricingPlan = require('../../models/PricingPlan.model');
const PricingComparison = require('../../models/PricingComparison.model');

// ==================== Pricing Plans ====================
exports.getPlans = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    const items = await PricingPlan.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const item = await PricingPlan.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const item = new PricingPlan(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const item = await PricingPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const item = await PricingPlan.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== Pricing Comparisons ====================
exports.getComparisons = async (req, res) => {
  try {
    const items = await PricingComparison.find().sort({ order: 1, createdAt: 1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComparisonById = async (req, res) => {
  try {
    const item = await PricingComparison.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createComparison = async (req, res) => {
  try {
    const item = new PricingComparison(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateComparison = async (req, res) => {
  try {
    const item = await PricingComparison.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteComparison = async (req, res) => {
  try {
    const item = await PricingComparison.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
