const mongoose = require('mongoose')
const { Schema } = mongoose

const likeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie' }
})

likeSchema.index({ userId: 1, movieId: 1 }, { unique: true })

likeSchema.pre('save', async function (next) {
  await mongoose.model('Movie').updateOne({ _id: this.movieId }, { $push: { likes: this._id } })
  next()
})

likeSchema.pre('deleteOne', { document: true }, async function (next) {
  await mongoose.model('Movie').updateOne({ _id: this.movieId }, { $pull: { likes: this._id } })
  next()
})

module.exports = mongoose.model('Like', likeSchema)
