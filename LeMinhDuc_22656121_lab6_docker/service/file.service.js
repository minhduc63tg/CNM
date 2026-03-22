// Các loại file cho phép
const FILE_TYPE_MATCH = [
    "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"
];

const uploadFile = async(file) => {
    if (!file) {
        throw new Error("Không có file được tải lên!");
    }

    if (!FILE_TYPE_MATCH.includes(file.mimetype)) {
        throw new Error(`Định dạng file ${file.originalname} không hợp lệ!`);
    }

    // Vì Multer đã lo việc lưu file vật lý vào thư mục public/uploads/
    // Ta chỉ cần trả về đường dẫn ảo để lưu vào database
    const fileUrl = `/uploads/${file.filename}`;

    return fileUrl;
};

module.exports = {
    uploadFile,
};