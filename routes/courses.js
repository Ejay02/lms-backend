const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { courseValidation, validate } = require("../middleware/validator");

router.post(
  "/",
  [auth, roleAuth(["instructor", "admin"]), courseValidation.create, validate],
  courseController.createCourse
);
router.get("/", auth, courseController.getCourses);
router.get("/:id", auth, courseController.getCourseById);
router.put(
  "/:id",
  [auth, roleAuth(["instructor", "admin"]), courseValidation.update, validate],
  courseController.updateCourse
);
router.delete(
  "/:id",
  [auth, roleAuth(["instructor", "admin"])],
  courseController.deleteCourse
);

module.exports = router;
