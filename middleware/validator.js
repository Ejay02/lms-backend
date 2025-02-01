const { validationResult, body, param, header } = require("express-validator");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validation rules
const authValidation = {
  signup: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional() // optional because not always provided (default role is student)
      .isIn(["student", "instructor", "admin"])
      .withMessage("Role must be one of 'student', 'instructor', or 'admin'"),
  ],
  login: [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  getUser: [
    // Since this endpoint doesn't accept any body parameters,
    // we can add header validation to ensure the token is present
    header("Authorization")
      .notEmpty()
      .withMessage("Authorization header is required"),
  ],

  resetPassword: [
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  updateProfile: [
    body("name").optional().trim().notEmpty().withMessage("Name is required"), // Optional, if provided, must not be empty
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email"), // Optional, if provided, must be a valid email
    body("profileImage").optional().isURL().withMessage("Invalid image URL"), // Optional, if provided, must be a valid URL
  ],
};

// Course validation rules
const courseValidation = {
  create: [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("coverImage").isURL().withMessage("Cover image must be a valid URL"),
    body("content").isArray().withMessage("Content must be an array"),
    body("content.*.title")
      .trim()
      .notEmpty()
      .withMessage("Content title is required"),
    body("content.*.type")
      .isIn(["video", "document", "quiz", "image"])
      .withMessage("Invalid content type"),
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid course ID"),
    body("title").optional().trim().notEmpty(),
    body("coverImage")
      .optional()
      .isURL()
      .withMessage("Cover image must be a valid URL"),
    body("description").optional().trim().notEmpty(),
  ],
};

// Progress validation rules
const progressValidation = {
  update: [
    param("courseId").isMongoId().withMessage("Invalid course ID"),
    body("contentId").isMongoId().withMessage("Invalid content ID"),
  ],
};

// Feedback validation rules
const feedbackValidation = {
  submit: [
    param("courseId").isMongoId().withMessage("Invalid course ID"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment").optional().trim().notEmpty(),
  ],
};

module.exports = {
  validate,
  authValidation,
  courseValidation,
  progressValidation,
  feedbackValidation,
};
