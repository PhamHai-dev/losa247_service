const multer = require('multer');

// 1. Cấu hình multer để lưu file vào memory (sau đó upload lên cloudinary)
const storage = multer.memoryStorage();

// 2. Giới hạn tài nguyên và chỉ cho phép định dạng cần thiết.
const allowedTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf', 'text/plain',
]);
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) return callback(new Error('Định dạng file không được hỗ trợ'));
    return callback(null, true);
  },
});

module.exports = upload;
