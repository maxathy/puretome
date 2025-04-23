const mongoose = require('mongoose');
/**
 * Memoir schema for MongoDB
 * Contains chapters and events structure for the memoir
 *
 * @property {String} title - Memoir title (required)
 * @property {String} content - Memoir description/content
 * @property {ObjectId} author - Reference to User model
 * @property {Array<ObjectId>} collaborators - Array of User references
 * @property {String} status - Publication status (draft, submitted, published)
 * @property {Array<ChapterSchema>} chapters - Array of chapters
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

const EventSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
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
