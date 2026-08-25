import express from "express";
import { generateSocialMediaContent } from "../services/contentMakerService.js";
import validateContentRequest from "../middleware/contentMakerValidator.js";

const router = express.Router();

router.post("/generate", validateContentRequest, async (req, res) => {
  try {
    const { transcript, platform, target_language, custom_guidelines } = req.body;

    const result = await generateSocialMediaContent({
      transcriptText: transcript,
      platform,
      targetLanguage: target_language || "auto",
      customGuidelines: custom_guidelines || null,
    });

    return res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Internal SaaS Server Error.",
    });
  }
});

export default router;