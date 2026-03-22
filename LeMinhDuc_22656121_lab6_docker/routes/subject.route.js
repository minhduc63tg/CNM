const Router = require("express").Router;
const router = Router();

const ProductController = require("../controllers");
const upload = require("../middleware/upload"); // File multer cấu hình ổ đĩa local

router.get("/", ProductController.get);
router.get("/:id", ProductController.getOne);

// Bổ sung .single("image") để Multer biết cần xử lý field nào
router.post("/", upload.single("image"), ProductController.create);
router.post("/update/:id", upload.single("image"), ProductController.update);

router.post("/delete/:id", ProductController.delete);

module.exports = router;