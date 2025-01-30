const Course = require("../models/Course");
const Progress = require("../models/Progress");
const paginateResults = require("../utils/pagination");
const { cache, invalidateCache } = require("../middleware/cache");

exports.createCourse = async (req, res) => {
  try {
    const course = new Course({
      title: req.body.title,
      description: req.body.description,
      instructor: req.user.id,
      content: req.body.content,
    });

    await course.save();
    await invalidateCache("cache:/api/courses*");
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const results = await paginateResults(
      Course,
      query,
      parseInt(page),
      parseInt(limit),
      "instructor"
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "name email"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If student, fetch their progress
    if (req.user.role === "student") {
      const progress = await Progress.findOne({
        user: req.user.id,
        course: course._id,
      });

      return res.json({ course, progress });
    }

    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is instructor of the course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, content } = req.body;
    course.title = title || course.title;
    course.description = description || course.description;
    course.content = content || course.content;

    Object.assign(course, req.body);
    await course.save();

    // Invalidate both course list and specific course cache
    await invalidateCache([
      "cache:/api/courses*",
      `cache:/api/courses/${req.params.id}`,
    ]);

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Progress.deleteMany({ course: course._id });
    await course.remove();

    await invalidateCache("cache:/api/courses*");

    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
