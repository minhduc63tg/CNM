const multer = require("multer");

// Sử dụng memoryStorage để lưu file trên RAM, phục vụ upload lên S3
const storage = multer.memoryStorage();

// Middleware upload 1 file với field name là "image"
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}).single("image");

module.exports = upload;
