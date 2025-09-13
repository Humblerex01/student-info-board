import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

// Models
import Admin from "./src/models/Admin.js";

// Routes
import postRoutes from "./src/routes/postRoutes.js";

// Load environment variables
dotenv.config();
console.log("Mongo URI:", process.env.MONGO_URI);

// Initialize app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded files (static)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/posts", postRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Admin Login Route
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 3. Create JWT
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);