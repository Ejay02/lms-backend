const Feedback = require("../models/feedback");

exports.submitFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    const feedback = new Feedback({
      user: req.user.id,
      course: courseId,
      rating,
      comment,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback" });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ course: req.params.courseId })
      .populate("user", "name email profileImage")
      .sort("-createdAt");

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error getting feedback" });
  }
};
