import express from "express";
import { summarizeText } from "../services/summarizerService.js";
import validateSummarizeInput from "../middleware/summarizerValidator.js";

const router = express.Router();

router.post("/summarize", validateSummarizeInput, async (req, res) => {
  try {
    const { text, lang } = req.body;
    const summary = await summarizeText(text, lang || "en");

    return res.status(200).json({
      success: true,
      data: {
        originalLength: text.length,
        summaryLength: summary.length,
        language: lang || "en",
        summary,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error during text summarization.",
    });
  }
});

export default router;