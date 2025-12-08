const express = require("express");
const cookieParser = require("cookie-parser"); // Add this import
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
const userRoutes = require("./routes/user.route");
const blogRoutes = require("./routes/blog.route");
const codeRoutes = require("./routes/code.route");
const dbConnect = require("./db/db");
app.get("/", (req, res) => {
  return res.status(200);
});
dbConnect();
// Enable user routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is working" });
});
app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);
app.use("/code", codeRoutes);
module.exports = app;
// app.listen(process.env.PORT, () => {
//   console.log(`Server is running on Port ${process.env.PORT}`);
// });
