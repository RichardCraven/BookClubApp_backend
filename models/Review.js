var mongoose = require('mongoose')

module.exports = mongoose.model('Review', {
  title: String,
  content: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book'},
})