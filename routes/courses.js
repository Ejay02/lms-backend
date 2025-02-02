const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { courseValidation, validate } = require("../middleware/validator");
const { cache } = require("../middleware/cache");

router.post(
  "/",
  [auth, roleAuth(["instructor", "admin"]), courseValidation.create, validate],
  courseController.createCourse
);
router.get("/", [auth, cache(180)], courseController.getCourses); // Cache for 24h
router.get("/my-courses", [auth, cache(180)], courseController.getMyCourses);
router.get(
  "/instructor-courses",
  [auth],
  courseController.getInstructorCourses
);
router.get("/:id", [auth, cache(180)], courseController.getCourseById);

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

router.post("/:id/enroll", [auth], courseController.addCourse);
router.post("/:id/unenroll", [auth], courseController.unenroll);

module.exports = router;
