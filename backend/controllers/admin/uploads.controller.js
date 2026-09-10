const uploadHelper = require('../../helpers/upload');

const uploadAsset = (type) => async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'Vui lòng chọn ảnh' } });
    const result = await uploadHelper.savePublicImage(req.file, type);
    return res.status(201).json({ success: true, data: result });
  } catch (error) { return next(error); }
};

exports.uploadBlogImage = uploadAsset('blog');
exports.uploadLogoImage = uploadAsset('logo');
exports.uploadFaviconImage = uploadAsset('favicon');
