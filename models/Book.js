var mongoose = require('mongoose')

module.exports = mongoose.model('Book', {
  title: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'}
})