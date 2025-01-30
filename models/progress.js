const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completedContent: [
    {
      contentId: mongoose.Schema.Types.ObjectId,
      completedAt: Date,
    },
  ],
  progress: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Progress", progressSchema);
