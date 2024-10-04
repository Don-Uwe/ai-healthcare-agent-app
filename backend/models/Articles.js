const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

//const mongoose = require('mongoose');



const articleSchema = new Schema({
  _id: {
    type: Number,
    autoIncrement: true,
  },
  title: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    default: null, // Explicitly state the default
  },
  publishedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  tags: {
    type: [String], // Specify that this is an array of strings
    default: [],
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft', // Setting a default status
  },
  imageUtils: {
    type: [String],
    required: true,
  },
  viewCount: {
    type: Number,
    required: true,
    default: 0,
  },
  likeCount: {
    type: Number,
    required: true,
    default: 0,
  },
  language: {
    type: String,
    required: true,
    default: 'English',
  },
  adminPost: {
    type: Boolean,
    required: true,
    default: false,
  },
  likedUsers: {
    type: [String], // Specify that this is an array of strings
    default: [],
  },
  savedUsers: {
    type: [String], // Specify that this is an array of strings
    default: [],
  },
});

// Apply the autoIncrement plugin to the schema
articleSchema.plugin(AutoIncrement, { id: 'article_id_counter', inc_field: '_id' });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;

