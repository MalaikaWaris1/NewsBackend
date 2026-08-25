import { SUPPORTED_PLATFORMS, SUPPORTED_LANGUAGES } from "../config/contentMaker.config.js";

const validateContentRequest = (req, res, next) => {
  const { transcript, platform, target_language, custom_guidelines } = req.body;

  // Transcript validation (10 to 10,000 characters)
  if (!transcript || typeof transcript !== "string" || transcript.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: 'transcript' is required and must be at least 10 characters long.",
    });
  }

  if (transcript.length > 10000) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: 'transcript' maximum limit is 10,000 characters.",
    });
  }

  // Platform validation
  if (!platform || typeof platform !== "string" || !SUPPORTED_PLATFORMS.includes(platform.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Validation Error: Unsupported platform '${platform}'. Supported options: ${SUPPORTED_PLATFORMS.join(", ")}`,
    });
  }

  // Target Language validation
  const lang = (target_language || "auto").toLowerCase();
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    return res.status(400).json({
      success: false,
      message: `Validation Error: Unsupported target_language '${target_language}'. Supported options: ${SUPPORTED_LANGUAGES.join(", ")}`,
    });
  }

  // Custom Guidelines length check
  if (custom_guidelines && typeof custom_guidelines === "string" && custom_guidelines.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: 'custom_guidelines' maximum limit is 2000 characters.",
    });
  }

  next();
};

export default validateContentRequest;