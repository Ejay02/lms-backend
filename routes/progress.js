const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

router.post(
  "/:courseId",
  [auth, roleAuth(["student"])],
  progressController.updateProgress
);
router.get("/:courseId", auth, progressController.getProgress);

module.exports = router;
