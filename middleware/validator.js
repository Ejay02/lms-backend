const { validationResult, body, param } = require("express-validator");

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
  ],
  login: [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
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
    body("content").isArray().withMessage("Content must be an array"),
    body("content.*.title")
      .trim()
      .notEmpty()
      .withMessage("Content title is required"),
    body("content.*.type")
      .isIn(["video", "document", "quiz"])
      .withMessage("Invalid content type"),
  ],
  update: [
    param("id").isMongoId().withMessage("Invalid course ID"),
    body("title").optional().trim().notEmpty(),
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
