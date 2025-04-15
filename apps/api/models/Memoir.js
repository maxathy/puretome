const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  events: [EventSchema],
});

const MemoirSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: String,
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    collaborators: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'published'],
      default: 'draft',
    },
    chapters: [ChapterSchema],
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Memoir || mongoose.model('Memoir', MemoirSchema);
