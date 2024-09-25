const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
    required: false,
  },
  published_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  last_updated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  tags: {
    type: [String],
  },
  status: {
    type: String,
    required: false,
    enum: ['Draft', 'Published', 'Archived'],
  },
 imageUtils : {
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
  adminPost:{
    type: Boolean,
    required: true,
    default: false
  },
  likedUsers: {
    type: Array,
    default: []
},
});

// Apply the autoIncrement plugin to the schema
articleSchema.plugin(AutoIncrement, { id: 'article_id_counter', inc_field: '_id' });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
