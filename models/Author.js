var mongoose = require('mongoose')

module.exports = mongoose.model('Author', {
  name: String
//   author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})