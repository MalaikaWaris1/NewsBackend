const validateHeadlineInput = (req, res, next) => {
  const { text, lang } = req.body;

  // Text validation
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "News article 'text' is required and must be a non-empty string.",
    });
  }

  // Length check (At least 30 characters for a headline context)
  if (text.trim().length < 30) {
    return res.status(400).json({
      success: false,
      message: "Article text is too short. Provide at least 30 characters.",
    });
  }

  // Language check
  if (lang && !["ur", "en"].includes(lang.toLowerCase().trim())) {
    return res.status(400).json({
      success: false,
      message: "Language ('lang') must be either 'ur' (Urdu) or 'en' (English).",
    });
  }

  next();
};

export default validateHeadlineInput;