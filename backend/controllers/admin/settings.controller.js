const Settings = require('../../models/Settings.model');
const uploadHelper = require('../../helpers/upload');

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
    await settings.save();
  }
  return settings;
};

exports.getAppearance = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings.appearance });
  } catch (err) {
    next(err);
  }
};

exports.updateAppearance = async (req, res, next) => {
  try {
    const { themeMode, accentColor } = req.body;
    const settings = await getSettings();
    
    settings.appearance.themeMode = themeMode || settings.appearance.themeMode;
    settings.appearance.accentColor = accentColor || settings.appearance.accentColor;
    await settings.save();

    res.json({ success: true, data: settings.appearance });
  } catch (err) {
    next(err);
  }
};

exports.getSiteInfo = async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings.siteInfo });
  } catch (err) {
    next(err);
  }
};

exports.updateSiteInfo = async (req, res, next) => {
  try {
    const data = req.body;
    const settings = await getSettings();
    
    settings.siteInfo = { ...settings.siteInfo.toObject(), ...data };
    await settings.save();

    res.json({ success: true, data: settings.siteInfo });
  } catch (err) {
    next(err);
  }
};

exports.uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Vui lòng upload file' } });
    }

    const secureUrl = await uploadHelper.uploadToCloudinary(req.file);
    res.json({ success: true, data: { url: secureUrl } });
  } catch (err) {
    next(err);
  }
};
