import express from "express";
import { translateText } from "../services/translationService.js";
import validateTranslationInput from "../middleware/validator.js";

const router = express.Router();

router.post("/translate", validateTranslationInput, async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const translatedText = await translateText(text, targetLang);

    return res.status(200).json({
      success: true,
      data: {
        originalText: text,
        translatedText,
        targetLang,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error during translation.",
    });
  }
});

export default router;