import express from "express";
import { registerUser, loginUser } from "../controllers/authService.js";
import { validateRegisterInput, validateLoginInput } from "../middleware/authValidator.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register New User
router.post("/register", validateRegisterInput, async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);
    return res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Login User
router.post("/login", validateLoginInput, async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);
    return res.status(200).json({ success: true, data: { user, token } });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Get Current User Profile (Protected)
router.get("/me", requireAuth, async (req, res) => {
  return res.status(200).json({ success: true, data: { user: req.user } });
});

export default router;