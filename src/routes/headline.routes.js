import express from "express";
import { generateHeadlines } from "../services/headlineService.js";
import validateHeadlineInput from "../middleware/headlineValidator.js";

const router = express.Router();

router.post("/generate", validateHeadlineInput, async (req, res) => {
  try {
    const { text, lang } = req.body;
    const headlines = await generateHeadlines(text, lang || "en");

    return res.status(200).json({
      success: true,
      data: {
        language: lang || "en",
        totalHeadlines: headlines.length,
        headlines,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error during headline generation.",
    });
  }
});

export default router;