import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  listHistoryForUser,
  deleteHistoryEntry,
  clearHistoryForUser,
} from "../controllers/historyService.js";

const router = express.Router();

// Require Auth for all History Routes
router.use(requireAuth);

// Get User History
router.get("/", async (req, res) => {
  try {
    const { module, search, page, limit } = req.query;
    const data = await listHistoryForUser(req.user._id, { module, search, page, limit });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Clear All History
router.delete("/clear", async (req, res) => {
  try {
    await clearHistoryForUser(req.user._id);
    return res.status(200).json({ success: true, message: "History cleared successfully." });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

// Delete Single History Entry
router.delete("/:id", async (req, res) => {
  try {
    await deleteHistoryEntry(req.user._id, req.params.id);
    return res.status(200).json({ success: true, message: "Entry deleted successfully." });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

export default router;