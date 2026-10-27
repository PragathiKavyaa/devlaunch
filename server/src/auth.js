import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Please sign in first." });

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid or expired. Sign in again." });
  }
}
