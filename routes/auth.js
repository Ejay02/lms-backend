const express = require("express");
const router = express.Router();
const { authValidation, validate } = require("../middleware/validator");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/signup", authValidation.signup, validate, authController.signup);
router.post("/admin-signup", authValidation.signup, validate, authController.adminSignup);
router.post("/instructor-signup", authValidation.signup, validate, authController.instructorSignup);
router.post("/login", authValidation.login, validate, authController.login);
router.post(
  "/reset-password",
  authValidation.resetPassword,
  validate,
  authController.resetPassword
);
router.put(
  "/update-profile",
  authValidation.updateProfile,
  validate,
  authController.updateProfile
);

router.get(
  "/user",
  auth,
  authValidation.getUser,
  validate,
  authController.getUser
);

module.exports = router;
