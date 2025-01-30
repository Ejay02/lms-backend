const { authValidation, validate } = require("../middleware/validator");

router.post("/signup", authValidation.signup, validate, authController.signup);
router.post("/login", authValidation.login, validate, authController.login);
