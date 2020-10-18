/* eslint-disable no-undef */
const server = require('../server')

before(function (done) {
  this.timeout(10000)
  server.on('started', async function (serverInstance) {
    const collections = await require('mongoose').connection.db.collections()

    for (const collection of collections) {
      await collection.deleteMany()
    }

    done()
  })
})

describe('Run tests', () => {
  require('./auth')
  require('./user')
  require('./movie')
})

after(() => {
  process.exit()
})
