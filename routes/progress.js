const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

router.get("/:courseId", auth, progressController.getProgress);

router.post(
  "/:courseId",
  [auth, roleAuth(["student"])],
  progressController.updateProgress
);

router.post(
  "/:courseId/uncheck",
  [auth, roleAuth(["student"])],
  progressController.uncheckProgress
);

module.exports = router;
