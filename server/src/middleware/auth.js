import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id; // attach admin id to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}