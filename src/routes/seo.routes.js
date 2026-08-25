import express from "express";
import { extractSeoData } from "../services/seoService.js";
import validateSeoInput from "../middleware/seoValidator.js";

const router = express.Router();

router.post("/extract", validateSeoInput, async (req, res) => {
  try {
    const { text, lang } = req.body;
    const seoMetadata = await extractSeoData(text, lang || "en");

    return res.status(200).json({
      success: true,
      data: {
        language: lang || "en",
        seo: seoMetadata,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error during SEO extraction.",
    });
  }
});

export default router;