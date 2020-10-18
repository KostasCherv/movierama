/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { expect } = require('chai')
const app = require('../server')

describe('User Controller', function () {
  const request = require('supertest').agent(app)
  this.timeout(20000)
  let user

  before(function (done) {
    const url = '/auth/login'
    user = { username: 'test', password: '123456' }

    request
      .post(url)
      .send(user)
      .set('Accept', 'application/json')
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.header.location).to.equals('/')
        expect(response.body).to.be.empty
        done()
      })
  })

  it('should get user', function (done) {
    const url = '/user'

    request
      .get(url)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('data')
        expect(response.body.data).to.have.property('_id')
        expect(response.body.data.username).to.be.equal(user.username)

        done()
      })
  })
})
