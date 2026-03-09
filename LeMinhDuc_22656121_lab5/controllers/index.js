const ProductModel = require("../models");
const { uploadFile } = require("../service/file.service");

const Controller = {};

// Sửa lỗi: Biến truyền vào render phải khớp với biến khai báo
Controller.get = async (req, res) => {
  try {
    const products = (await ProductModel.getProducts()) || []; // Đổi từ subjects thành products
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
      return res.render("edit", { products: product });
    } else {
      return res.status(404).send("Không tìm thấy sản phẩm yêu cầu.");
    }
  } catch (error) {
    console.error(`Lỗi khi lấy productid ${req.params.id}:`, error);
    res.status(500).send("Lỗi hệ thống khi truy xuất thông tin product.");
  }
};

Controller.create = async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Validate dữ liệu đầu vào
    const errors = [];

    // Validate tên sản phẩm
    if (!name || name.trim().length < 3 || name.trim().length > 100) {
      errors.push("Tên sản phẩm phải từ 3-100 ký tự");
    }

    // Validate giá
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 1000) {
      errors.push("Giá phải là số dương từ 1,000 VNĐ trở lên");
    }

    // Validate số lượng
    const quantityNum = parseInt(quantity);
    if (
      isNaN(quantityNum) ||
      quantityNum < 0 ||
      !Number.isInteger(quantityNum)
    ) {
      errors.push("Số lượng tồn phải là số nguyên không âm");
    }

    // Validate file ảnh
    if (!req.file) {
      errors.push("Vui lòng chọn file hình ảnh");
    } else {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        errors.push("Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF, WEBP");
      }
      if (req.file.size > 5 * 1024 * 1024) {
        // 5MB
        errors.push("Kích thước file ảnh không được vượt quá 5MB");
      }
    }

    // Nếu có lỗi, trả về thông báo
    if (errors.length > 0) {
      return res
        .status(400)
        .send(
          `<h3>Dữ liệu không hợp lệ:</h3><ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul><br/><a href="/products">Quay lại</a>`,
        );
    }

    const imageUrl = await uploadFile(req.file);

    // Kiểm tra lại ProductModel xem là createProduct hay createSubject
    await ProductModel.createProduct({
      name: name.trim(),
      price: priceNum,
      quantity: quantityNum,
      image: imageUrl,
    });
    return res.redirect("/products"); // Đồng nhất redirect về /products
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm mới:", error);
    res.status(500).send("Có lỗi xảy ra khi tạo sản phẩm mới.");
  }
};

Controller.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, quantity } = req.body;

    // Validate dữ liệu đầu vào
    const errors = [];

    // Validate giá
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 1000) {
      errors.push("Giá phải là số dương từ 1,000 VNĐ trở lên");
    }

    // Validate số lượng
    const quantityNum = parseInt(quantity);
    if (
      isNaN(quantityNum) ||
      quantityNum < 0 ||
      !Number.isInteger(quantityNum)
    ) {
      errors.push("Số lượng tồn phải là số nguyên không âm");
    }

    // Validate file ảnh (nếu có upload file mới)
    if (req.file) {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        errors.push("Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF, WEBP");
      }
      if (req.file.size > 5 * 1024 * 1024) {
        // 5MB
        errors.push("Kích thước file ảnh không được vượt quá 5MB");
      }
    }

    // Nếu có lỗi, trả về thông báo
    if (errors.length > 0) {
      return res
        .status(400)
        .send(
          `<h3>Dữ liệu không hợp lệ:</h3><ul>${errors.map((e) => `<li>${e}</li>`).join("")}</ul><br/><a href="/products">Quay lại</a>`,
        );
    }

    let imageUrl;

    if (req.file) {
      imageUrl = await uploadFile(req.file);
    } else {
      // Sửa lỗi: Tên hàm phải là getOneProduct để đồng nhất
      const oldProduct = await ProductModel.getOneProduct(id);
      if (!oldProduct) return res.status(404).send("Không tìm thấy product.");
      imageUrl = oldProduct.image;
    }

    await ProductModel.updateProduct(id, {
      price: priceNum,
      quantity: quantityNum,
      image: imageUrl,
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
    await ProductModel.deleteProduct(id);
    return res.redirect("/products");
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm ${req.params.id}:`, error);
    res.status(500).send("Có lỗi xảy ra khi xóa sản phẩm.");
  }
};

module.exports = Controller;
