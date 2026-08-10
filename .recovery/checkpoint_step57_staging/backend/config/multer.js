const multer = require('multer');

// 1. Cấu hình multer để lưu file vào memory (sau đó upload lên cloudinary)
const storage = multer.memoryStorage();

// 2. Khởi tạo middleware multer
const upload = multer({ storage });

module.exports = upload;
