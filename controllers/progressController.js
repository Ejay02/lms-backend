const Progress = require('../models/Progress');
const Course = require('../models/Course');

exports.updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { contentId } = req.body;

    let progress = await Progress.findOne({
      user: req.user.id,
      course: courseId
    });

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Create new progress if doesn't exist
    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        course: courseId,
        completedContent: []
      });
    }

    // Add completed content if not already completed
    if (!progress.completedContent.find(item => item.contentId.toString() === contentId)) {
      progress.completedContent.push({
        contentId,
        completedAt: Date.now()
      });
    }

    // Calculate progress percentage
    progress.progress = (progress.completedContent.length / course.content.length) * 100;
    progress.lastAccessed = Date.now();

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.courseId
    }).populate('course', 'title');

    if (!progress) {
      return res.json({
        progress: 0,
        completedContent: []
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
