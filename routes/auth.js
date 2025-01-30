const express = require("express");
const router = express.Router();
const { authValidation, validate } = require("../middleware/validator");
const authController = require("../controllers/authController");

router.post("/signup", authValidation.signup, validate, authController.signup);
router.post("/login", authValidation.login, validate, authController.login);

module.exports = router;
