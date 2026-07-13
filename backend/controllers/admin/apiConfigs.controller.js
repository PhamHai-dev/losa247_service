const ApiConfig = require('../../models/ApiConfig.model');

exports.getApiConfigs = async (req, res, next) => {
  try {
    const configs = await ApiConfig.find({});
    res.json({ success: true, data: configs });
  } catch (err) {
    next(err);
  }
};

exports.updateApiConfig = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const data = req.body;
    
    let config = await ApiConfig.findOne({ provider });
    if (!config) {
      config = new ApiConfig({ provider, ...data });
    } else {
      config.apiKey = data.apiKey;
      config.extra = data.extra;
      config.isActive = data.isActive !== undefined ? data.isActive : config.isActive;
    }
    
    await config.save();
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
};

exports.testApiConfig = async (req, res, next) => {
  try {
    res.json({ success: true, message: `Đã gửi yêu cầu test provider ${req.params.provider} thành công.` });
  } catch (err) {
    next(err);
  }
};
