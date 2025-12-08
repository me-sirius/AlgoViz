const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoutes = require("./routes/user.route");
const blogRoutes = require("./routes/blog.route");
const codeRoutes = require("./routes/code.route");
dotenv.config();
const dbConnect = require("./db/db");

const app = express();

// Database Connection
dbConnect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // Replace * with your frontend URL in production for security
    origin: "*",
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);
app.use("/code", codeRoutes);

// Local Server Setup
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
  });
}

// Vercel Export (Express is a function that takes req, res)
module.exports = app;
