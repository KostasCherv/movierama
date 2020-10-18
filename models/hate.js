const mongoose = require('mongoose')
const { Schema } = mongoose

const hateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie' }
})

hateSchema.pre('save', async function (next) {
  await mongoose.model('Movie').updateOne({ _id: this.movieId }, { $push: { hates: this._id } })
  next()
})

hateSchema.pre('deleteOne', { document: true }, async function (next) {
  await mongoose.model('Movie').updateOne({ _id: this.movieId }, { $pull: { hates: this._id } })
  next()
})

hateSchema.index({ userId: 1, movieId: 1 }, { unique: true })

module.exports = mongoose.model('Hate', hateSchema)
