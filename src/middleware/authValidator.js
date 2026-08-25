const EMAIL_RE = /^\S+@\S+\.\S+$/;

export const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: 'name' is required and must be at least 2 characters.",
    });
  }

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: a valid 'email' is required.",
    });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: 'password' must be at least 8 characters.",
    });
  }

  // next();
};

export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: a valid 'email' is required.",
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Validation Error: 'password' is required.",
    });
  }

  next();
};
