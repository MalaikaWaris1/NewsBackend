const validateSeoInput = (req, res, next) => {
  const { text, lang } = req.body;

  // Text presence and type check
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Article 'text' is required and must be a non-empty string.",
    });
  }

  // Length check for proper keyword analysis
  if (text.trim().length < 50) {
    return res.status(400).json({
      success: false,
      message: "Article text is too short for SEO analysis. Minimum 50 characters required.",
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

export default validateSeoInput;