const multer = require("multer");

// // Sử dụng memoryStorage để lưu file trên RAM, phục vụ upload lên S3
// const storage = multer.memoryStorage();

// // Middleware upload 1 file với field name là "image"
// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 1024 * 1024 * 5,
//   },
// }).single("image");

// module.exports = upload;


const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads"); // Thư mục lưu file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });
module.exports = upload;