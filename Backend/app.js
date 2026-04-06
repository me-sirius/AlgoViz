const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
dotenv.config();
const userRoutes = require("./routes/user.route");
const blogRoutes = require("./routes/blog.route");
const codeRoutes = require("./routes/code.route");
const questionRoutes = require("./routes/question.route");
const interviewRoutes = require("./routes/interview.route");
const adminRoutes = require("./routes/admin.route");
const mcqRoutes = require("./routes/mcq.route");
const mentorRoutes = require("./routes/mentor.route");
const bugRoutes = require("./routes/bug.route");
const analyticsRoutes = require("./routes/analytics.route");
const contactRoutes = require("./routes/contact.routes");
const paymentRoutes = require("./routes/payment.route");
const uploadRoutes = require("./routes/upload.routes");
const testRoutes = require("./routes/test.route");
const queueRoutes = require("./routes/queue.route");
const notificationRoutes = require("./routes/notification.route");
const dbConnect = require("./db/db");

const app = express();

// Database Connection
dbConnect();

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:5174", // Vite dev server (alt port)
      "http://localhost:5175", // Vite dev server (alt port)
      "http://localhost:4173", // Vite preview server
      "https://www.algoviz.live", // Production (www)
      "https://algoviz.live", // Production (non-www)
      "https://dorthey-unshort-concealingly.ngrok-free.dev", // ngrok tunnel
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-admin-secret"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);
app.use("/code", codeRoutes);
app.use("/questions", questionRoutes);
app.use("/interviews", interviewRoutes);
app.use("/admin", adminRoutes);
app.use("/mcq", mcqRoutes);
app.use("/mentor", mentorRoutes);
app.use("/bug", bugRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/contact", contactRoutes);
app.use("/payment", paymentRoutes);
app.use("/upload", uploadRoutes);
app.use("/test", testRoutes);
app.use("/queue", queueRoutes);
app.use("/notifications", notificationRoutes);
// Local Server Setup
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
  });
}

// Vercel Export (Express is a function that takes req, res)
module.exports = app;
