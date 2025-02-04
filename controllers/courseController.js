const Course = require("../models/Course");
const Progress = require("../models/Progress");
const paginateResults = require("../utils/pagination");
// const { cache, invalidateCache } = require("../middleware/cache");

exports.createCourse = async (req, res) => {
  try {
    const { title, description, content, coverImage } = req.body;

    // Check for duplicate course
    const existingCourse = await Course.findOne({
      title,
      instructor: req.user.id,
    });

    if (existingCourse) {
      return res.status(400).json({
        message: "Course with this title already exists for this instructor",
      });
    }

    const updatedContent = content.map((item) => {
      if (item.type === "image" && item.data) {
        // Ensure the image URL is saved directly as a string
        item.data = item.data;
      }
      return item;
    });

    const course = new Course({
      title,
      description,
      coverImage,
      instructor: req.user.id,
      content: updatedContent,
    });

    await course.save();
    // await invalidateCache("cache:/api/courses*");
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

exports.getMyCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // Create the query based on the search term
    const query = search
      ? { title: { $regex: search, $options: "i" }, students: req.user.id }
      : { students: req.user.id };

    // Paginate the results
    const results = await paginateResults(
      Course,
      query,
      parseInt(page),
      parseInt(limit),
      "instructor"
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error getting your courses" });
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

    const { title, description, content, coverImage } = req.body;

    const updatedContent = content.map((item) => {
      if (item.type === "image" && item.data) {
        item.data = item.data;
      }
      return item;
    });

    course.title = title || course.title;
    course.description = description || course.description;
    course.content = updatedContent || course.content;
    if (coverImage) {
      course.coverImage = coverImage;
    }

    Object.assign(course, req.body);
    await course.save();

    // Invalidate both course list and specific course cache
    // await invalidateCache([
    //   "cache:/api/courses*",
    //   `cache:/api/courses/${req.params.id}`,
    // ]);

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
    await course.deleteOne();

    // await invalidateCache("cache:/api/courses*");

    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course" });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the student is already enrolled
    if (course.students.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Enroll the student
    course.students.push(req.user.id);
    course.isEnrolled = true; // Update isEnrolled flag
    await course.save();

    // create a progress entry for the student
    const progress = new Progress({
      user: req.user.id,
      course: course._id,
    });
    await progress.save();

    res.json({
      message: "Course enrolled successfully",
      isEnrolled: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.unenroll = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the student is enrolled
    if (!course.students.includes(req.user.id)) {
      return res.status(400).json({ message: "Not enrolled in this course" });
    }

    // Remove student from course
    course.students = course.students.filter(
      (studentId) => studentId.toString() !== req.user.id
    );
    course.isEnrolled = false;
    await course.save();

    // Remove progress entry
    await Progress.findOneAndDelete({ user: req.user.id, course: course._id });

    // Invalidate cache for courses
    // await invalidateCache("cache:/api/courses*");

    res.json({
      message: "Successfully unenrolled from the course",
      isEnrolled: false,
    });
  } catch (error) {
    res.status(500).json({ message: "Unenrolled error" });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = search
      ? {
          title: { $regex: search, $options: "i" },
          instructor: req.user.id,
        }
      : { instructor: req.user.id };

    const results = await paginateResults(
      Course,
      query,
      parseInt(page),
      parseInt(limit),
      { path: "instructor", select: "name email" }
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving instructor courses",
      error: error.message,
    });
  }
};
