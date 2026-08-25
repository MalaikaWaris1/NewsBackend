const validateSummarizeInput = (req, res, next) => {
  const { text, lang } = req.body;

  // Text validation
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Text is required and must be a non-empty string.",
    });
  }

  // Length check (At least 100 characters so summary makes sense)
  if (text.trim().length < 50) {
    return res.status(400).json({
      success: false,
      message: "Text is too short to summarize. Provide at least 50 characters.",
    });
  }

  // Optional language check
  if (lang && !["ur", "en"].includes(lang.toLowerCase().trim())) {
    return res.status(400).json({
      success: false,
      message: "Language ('lang') must be either 'ur' (Urdu) or 'en' (English).",
    });
  }

  next();
};

export default validateSummarizeInput;