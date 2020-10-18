const passportLocalMongoose = require('passport-local-mongoose')
const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

userSchema.virtual('liked', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'userId'
})

userSchema.virtual('hated', {
  ref: 'Hate',
  localField: '_id',
  foreignField: 'userId'
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)
