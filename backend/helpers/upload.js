const cloudinary = require('../config/cloudinary');

const upload = (file, options) => new Promise((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
    if (error) return reject(error);
    return resolve(result);
  });
  uploadStream.end(file.buffer);
});

exports.uploadToCloudinary = async (file) => {
  const result = await upload(file, { folder: 'losa247' });
  return result.secure_url;
};

exports.uploadChatAttachment = (file, { sessionId, attachmentId }) => upload(file, {
  folder: `losa247/chat/${sessionId}`,
  public_id: attachmentId,
  type: 'authenticated',
  resource_type: 'image',
  overwrite: false,
});

exports.createAuthenticatedUrl = ({ publicId, resourceType = 'image', format }) => cloudinary.url(publicId, {
  resource_type: resourceType,
  type: 'authenticated',
  sign_url: true,
  secure: true,
  format: format || undefined,
  transformation: [{ width: 2048, height: 2048, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
});

exports.deleteChatAttachment = ({ publicId, resourceType = 'image' }) => cloudinary.uploader.destroy(publicId, { resource_type: resourceType, type: 'authenticated', invalidate: true });
