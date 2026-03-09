require("dotenv").config();
const { s3 } = require("../utils/aws-helper");

// Hàm random chuỗi
const randomString = (numberCharacter) => {
  return Math.random()
    .toString(36)
    .substring(2, numberCharacter + 2);
};

// Các loại file cho phép
const FILE_TYPE_MATCH = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "video/mp3",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.rar",
  "application/zip",
];

// Upload file lên S3
const uploadFile = async (file) => {
  const filePath = `${randomString(4)}-${Date.now()}-${file.originalname}`;

  if (!FILE_TYPE_MATCH.includes(file.mimetype)) {
    throw new Error(`${file.originalname} is invalid!`);
  }

  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: filePath,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(uploadParams).promise();

    console.log("File uploaded successfully to S3:", filePath);

    // OPTION 1: Dùng public URL (yêu cầu bucket phải public hoặc có Bucket Policy)
    // return `https://${process.env.BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${filePath}`;

    // OPTION 2: Dùng Signed URL (không cần bucket public, URL hết hạn sau 1 năm)
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.BUCKET_NAME,
      Key: filePath,
      Expires: 31536000, // URL hết hạn sau 365 ngày (1 năm)
    });

    return signedUrl;
  } catch (err) {
    console.error("Error uploading file to AWS S3:", err);
    console.error("Error details:", err.message);
    console.error("Bucket:", process.env.BUCKET_NAME);
    console.error("Region:", process.env.REGION);
    throw new Error(`Upload file to AWS S3 failed: ${err.message}`);
  }
};

module.exports = {
  uploadFile,
};
