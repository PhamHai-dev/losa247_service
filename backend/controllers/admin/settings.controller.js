const { prisma } = require('../../config/prisma');
const { createEntityId } = require('../../repositories/core/entityId');
const uploadHelper = require('../../helpers/upload');
const { leadFormConfigSchema, normalizeLeadFormConfig } = require('../../validators/leadForm.validator');

const serialize = (settings) => ({
  appearance: { themeMode: settings.themeMode, accentColor: settings.accentColor },
  siteInfo: {
    name: settings.siteName, slogan: settings.slogan, logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl, hotline: settings.hotline, email: settings.email,
    address: settings.address,
    socialLinks: { facebook: settings.facebookUrl, zalo: settings.zaloUrl },
  },
});
const getSettings = async () => {
  const existing = await prisma.settings.findFirst();
  return existing || prisma.settings.create({ data: { id: createEntityId() } });
};

exports.getLeadForm = async (_req, res, next) => {
  try { return res.json({ success: true, data: normalizeLeadFormConfig((await getSettings()).leadFormConfig) }); }
  catch (err) { return next(err); }
};
exports.updateLeadForm = async (req, res, next) => {
  try {
    const config = leadFormConfigSchema.parse({ ...req.body, version: Number(req.body.version || 0) + 1 });
    const current = await getSettings();
    await prisma.settings.update({ where: { id: current.id }, data: { leadFormConfig: config } });
    return res.json({ success: true, data: config });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.errors?.[0]?.message } });
    return next(err);
  }
};

exports.getAppearance = async (_req, res, next) => {
  try { return res.json({ success: true, data: serialize(await getSettings()).appearance }); }
  catch (err) { return next(err); }
};

exports.updateAppearance = async (req, res, next) => {
  try {
    const current = await getSettings();
    const settings = await prisma.settings.update({ where: { id: current.id }, data: {
      ...(req.body.themeMode ? { themeMode: req.body.themeMode } : {}),
      ...(req.body.accentColor ? { accentColor: req.body.accentColor } : {}),
    } });
    return res.json({ success: true, data: serialize(settings).appearance });
  } catch (err) { return next(err); }
};

exports.getSiteInfo = async (_req, res, next) => {
  try { return res.json({ success: true, data: serialize(await getSettings()).siteInfo }); }
  catch (err) { return next(err); }
};

exports.updateSiteInfo = async (req, res, next) => {
  try {
    const current = await getSettings();
    const fieldMap = { name: 'siteName', slogan: 'slogan', logoUrl: 'logoUrl', faviconUrl: 'faviconUrl', hotline: 'hotline', email: 'email', address: 'address' };
    const data = {};
    Object.entries(fieldMap).forEach(([apiField, dbField]) => { if (req.body[apiField] !== undefined) data[dbField] = req.body[apiField]; });
    if (req.body.socialLinks?.facebook !== undefined) data.facebookUrl = req.body.socialLinks.facebook;
    if (req.body.socialLinks?.zalo !== undefined) data.zaloUrl = req.body.socialLinks.zalo;
    const settings = await prisma.settings.update({ where: { id: current.id }, data });
    return res.json({ success: true, data: serialize(settings).siteInfo });
  } catch (err) { return next(err); }
};

exports.uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Vui lòng upload file' } });
    const secureUrl = await uploadHelper.uploadToCloudinary(req.file);
    return res.json({ success: true, data: { url: secureUrl } });
  } catch (err) { return next(err); }
};
