const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: [
    {
      title: String,
      description: String,
      type: { type: String, enum: ["video", "document", "quiz", "image", "text"] },
      data: mongoose.Schema.Types.Mixed,
    },
  ],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isEnrolled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);
