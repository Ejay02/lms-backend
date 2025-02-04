const Progress = require("../models/progress");
const Course = require("../models/Course");

exports.updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { contentId } = req.body;

    // Validate input
    if (!courseId || !contentId) {
      return res.status(400).json({
        message: "Course ID and Content ID are required",
      });
    }

    // Find the course first to ensure it exists and get content length
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Find existing progress or create new
    let progress = await Progress.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        course: courseId,
        completedContent: [],
        progress: 0,
        lastAccessed: new Date(),
      });
    }

    // Check if content is already marked as completed
    const isAlreadyCompleted = progress.completedContent.some(
      (item) => item.contentId.toString() === contentId
    );

    if (!isAlreadyCompleted) {
      // Add new completed content
      progress.completedContent.push({
        contentId,
        completedAt: new Date(),
      });

      // Recalculate progress percentage
      progress.progress =
        (progress.completedContent.length / course.content.length) * 100;
    }

    // Update last accessed timestamp
    progress.lastAccessed = new Date();

    // Save the updated progress
    await progress.save();

    // Populate course details before sending response
    await progress.populate("course", "title");

    res.json({
      progress: progress.progress,
      completedContent: progress.completedContent,
      lastAccessed: progress.lastAccessed,
      course: progress.course,
    });
  } catch (error) {
    console.error("Progress update error:", error);
    res.status(500).json({
      message: "Failed to update progress",
      error: error.message,
    });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
      });
    }

    // Find progress and populate course details
    const progress = await Progress.findOne({
      user: req.user.id,
      course: courseId,
    }).populate("course", "title");

    // If no progress found, return default values
    if (!progress) {
      return res.json({
        progress: 0,
        completedContent: [],
        lastAccessed: null,
        course: null,
      });
    }

    // Return formatted response
    res.json({
      progress: progress.progress,
      completedContent: progress.completedContent,
      lastAccessed: progress.lastAccessed,
      course: progress.course,
    });
  } catch (error) {
    console.error("Progress fetch error:", error);
    res.status(500).json({
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
};
