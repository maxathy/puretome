const mongoose = require("mongoose");

const MemoirSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: {
    type: String,
    enum: ["draft", "submitted", "published"],
    default: "draft",
  },
});

module.exports = mongoose.model("Memoir", MemoirSchema);
