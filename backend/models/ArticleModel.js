const mongoose = require('mongoose');
const Schema = mongoose.Schema;



/** For Artcle Tags */
const articleTagSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  }
});

const ArticleTag = mongoose.model('ArticleTag', articleTagSchema);

module.exports = ArticleTag;
