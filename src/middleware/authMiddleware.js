import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

/**
 * Protects a route: requires a valid Bearer JWT, attaches req.user.
 * Every history route (and any future per-user route) should use this.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    req.user = user; // downstream routes read req.user._id / req.user.role
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid or missing authentication token.";
    return res.status(401).json({ success: false, message });
  }
};
