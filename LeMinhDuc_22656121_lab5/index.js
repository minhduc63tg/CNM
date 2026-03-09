require("dotenv").config();
const express = require("express");
const app = express(); // khởi tạo hệ thống bằng express

app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// Render giao diện
app.use(express.static("./views")); // render giao diện từ thư mục views
app.set("view engine", "ejs"); // sử dụng ejs làm view engine cho express
app.set("views", "./views"); // thư mục chứa các file ejs

// Router cho ứng dụng
app.use("/", require("./routes/index"));

// tạo server lắng nghe port 3000
app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000/`);
});
