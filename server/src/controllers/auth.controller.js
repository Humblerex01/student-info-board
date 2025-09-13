import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

function signToken(admin) {
  return jwt.sign(
    { sub: admin._id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "2d" }
  );
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await admin.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(admin);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2
    });
    res.json({ message: "Logged in" });
  } catch (e) { next(e); }
}

export async function logout(_req, res) {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
}

export async function me(req, res) {
  res.json({ user: { id: req.user.sub, username: req.user.username } });
}