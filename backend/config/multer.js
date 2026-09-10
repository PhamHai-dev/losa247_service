const multer = require('multer');

// Giữ file trong RAM để kiểm tra và xác thực quyền trước khi ghi xuống storage.
const storage = multer.memoryStorage();
const allowedTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon',
]);
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) return callback(Object.assign(new Error('Định dạng ảnh không được hỗ trợ'), { statusCode: 400, code: 'UNSUPPORTED_FILE_TYPE' }));
    return callback(null, true);
  },
});

module.exports = upload;

