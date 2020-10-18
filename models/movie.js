const mongoose = require('mongoose')
const { Schema } = mongoose

const movieSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
  hates: [{ type: Schema.Types.ObjectId, ref: 'Hate' }]
})

module.exports = mongoose.model('Movie', movieSchema)
