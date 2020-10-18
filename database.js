
const mongoose = require('mongoose')

const uri = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

mongoose.connection.once('open', () => {
  console.log('Database connected successfully')
})
