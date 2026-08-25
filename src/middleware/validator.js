const validateTranslationInput = (req, res, next) => {
  const { text, targetLang } = req.body;

  // 1. Text presence aur String type check
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Text is required and must be a non-empty string.",
    });
  }

  // 2. Character limit check
  if (text.length > 3000) {
    return res.status(400).json({
      success: false,
      message: "Text length cannot exceed 3000 characters.",
    });
  }

  // 3. Target language validation ('ur' ya 'en')
  if (!targetLang || typeof targetLang !== "string" || !["ur", "en"].includes(targetLang.toLowerCase().trim())) {
    return res.status(400).json({
      success: false,
      message: "Target language ('targetLang') is required and must be either 'ur' (Urdu) or 'en' (English).",
    });
  }

  next();
};

export default validateTranslationInput;