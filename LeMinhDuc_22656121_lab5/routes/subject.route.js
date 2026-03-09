const Router = require("express").Router;
const router = Router();

const ProductController = require("../controllers");
const upload = require("../middleware/upload");

// GET /subjects
router.get("/", ProductController.get);

// GET /subjects/:id
// GET /subjects/:id
router.get("/:id", ProductController.getOne);

// POST /subjects
router.post("/", upload, ProductController.create);

// POST /subjects/update/:id
router.post("/update/:id", upload, ProductController.update);

// POST /subjects/delete/:id
router.post("/delete/:id", ProductController.delete);

module.exports = router;