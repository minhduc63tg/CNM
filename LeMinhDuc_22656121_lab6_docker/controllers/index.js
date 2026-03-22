const fs = require("fs");
const path = require("path");
const ProductModel = require("../models");

const Controller = {};

Controller.get = async (req, res) => {
  try {
    const products = (await ProductModel.getProducts()) || [];
    return res.render("index", { products });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách product:", error);
    res.status(500).send("Có lỗi xảy ra khi tải danh sách product.");
  }
};

Controller.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.getOneProduct(id);
    if (product) {
      return res.render("edit", { product }); // Sửa 'products: product' thành 'product' cho logic
    } else {
      return res.status(404).send("Không tìm thấy sản phẩm yêu cầu.");
    }
  } catch (error) {
    console.error(`Lỗi khi lấy product id ${req.params.id}:`, error);
    res.status(500).send("Lỗi hệ thống khi truy xuất thông tin product.");
  }
};

Controller.create = async (req, res) => {
  try {
    // Đã đổi quantity thành unit_in_stock
    const { name, price, unit_in_stock } = req.body;
    const errors = [];

    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      errors.push("Tên sản phẩm phải từ 3-100 ký tự");
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 1000) {
      errors.push("Giá phải là số dương từ 1,000 VNĐ trở lên");
    }

    const quantityNum = parseInt(unit_in_stock);
    if (
      isNaN(quantityNum) ||
      quantityNum < 0 ||
      !Number.isInteger(quantityNum)
    ) {
      errors.push("Số lượng tồn phải là số nguyên không âm");
    }

    if (!req.file) {
      errors.push("Vui lòng chọn file hình ảnh");
    }

    if (errors.length > 0) {
      return res
        .status(400)
        .send(
          `<h3>Dữ liệu không hợp lệ:</h3><ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul><br/><a href="/products">Quay lại</a>`,
        );
    }

    // LƯU CỤC BỘ: Lấy tên file do multer tạo ra
    const imageUrl = `/uploads/${req.file.filename}`;

    await ProductModel.createProduct({
      name: name.trim(),
      price: priceNum,
      unit_in_stock: quantityNum,
      url_image: imageUrl,
    });
    return res.redirect("/products");
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm mới:", error);
    res.status(500).send("Có lỗi xảy ra khi tạo sản phẩm mới.");
  }
};

Controller.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, unit_in_stock } = req.body;
    const errors = [];

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 1000) {
      errors.push("Giá phải là số dương từ 1,000 VNĐ trở lên");
    }

    const quantityNum = parseInt(unit_in_stock);
    if (
      isNaN(quantityNum) ||
      quantityNum < 0 ||
      !Number.isInteger(quantityNum)
    ) {
      errors.push("Số lượng tồn phải là số nguyên không âm");
    }

    if (errors.length > 0) {
      return res
        .status(400)
        .send(
          `<h3>Dữ liệu không hợp lệ:</h3><ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul><br/><a href="/products">Quay lại</a>`,
        );
    }

    let imageUrl;

    if (req.file) {
      // NẾU CÓ UPLOAD ẢNH MỚI
      imageUrl = `/uploads/${req.file.filename}`;
    } else {
      // GIỮ LẠI ẢNH CŨ
      const oldProduct = await ProductModel.getOneProduct(id);
      if (!oldProduct) return res.status(404).send("Không tìm thấy product.");
      imageUrl = oldProduct.url_image;
    }

    await ProductModel.updateProduct(id, {
      price: priceNum,
      unit_in_stock: quantityNum,
      url_image: imageUrl,
    });
    return res.redirect("/products");
  } catch (error) {
    console.error(`Lỗi khi cập nhật sản phẩm ${req.params.id}:`, error);
    res.status(500).send("Có lỗi xảy ra khi cập nhật sản phẩm.");
  }
};

Controller.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm sản phẩm trước khi xóa để lấy đường dẫn hình ảnh
    const product = await ProductModel.getOneProduct(id);
    if (product && product.url_image) {
      // url_image có dạng '/uploads/filename.ext', ta cần map nó với thư mục public
      const imagePath = path.join(__dirname, "../public", product.url_image);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error(`Lỗi khi xóa file ảnh ${imagePath}:`, err);
        }
      });
    }

    await ProductModel.deleteProduct(id);
    return res.redirect("/products");
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm ${req.params.id}:`, error);
    res.status(500).send("Có lỗi xảy ra khi xóa sản phẩm.");
  }
};

module.exports = Controller;
