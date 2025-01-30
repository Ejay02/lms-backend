const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const auth = require("../middleware/auth");

router.post("/:courseId", auth, feedbackController.submitFeedback);
router.get("/:courseId", auth, feedbackController.getFeedback);

module.exports = router;
