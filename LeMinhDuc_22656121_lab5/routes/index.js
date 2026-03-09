const Router = require("express").Router;
const router = Router();

const productRoute = require("./subject.route");
const ProductController = require("../controllers");

// /subjects
router.use("/products", productRoute);

// GET / - Trang chủ hiển thị danh sách môn học
router.get("/", ProductController.get);

module.exports = router;