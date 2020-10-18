/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { expect } = require('chai')
const app = require('../server')
const { User } = require('../models')

describe('Auth Controller', function () {
  const request = require('supertest')(app)

  it('should create a user', function (done) {
    const url = '/auth/register'
    const user = { username: 'test', password: '123456' }

    request
      .post(url)
      .send(user)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.header.location).to.equals('/')
        expect(response.body).to.be.empty
        const cnt = await User.countDocuments()
        expect(cnt).to.equals(1)
        done()
      })
  })

  it('should not create a user', function (done) {
    const url = '/auth/register'
    const user = { username: 'test', password: '123456' }

    request
      .post(url)
      .send(user)
      .end(async function (error, response) {
        expect(error).to.be.null
        expect(response.header.location).to.contains('/register?error')

        expect(response.body).to.be.empty
        const cnt = await User.countDocuments()
        expect(cnt).to.equals(1)
        done()
      })
  })

  it('should create a user', function (done) {
    const url = '/auth/register'
    const user = { username: 'test1', password: '123456' }

    request
      .post(url)
      .send(user)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.header.location).to.equals('/')
        expect(response.body).to.be.empty
        const cnt = await User.countDocuments()
        expect(cnt).to.equals(2)
        done()
      })
  })

  it('should login a user', function (done) {
    const url = '/auth/login'
    const user = { username: 'test', password: '123456' }

    request
      .post(url)
      .send(user)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.header.location).to.equals('/')
        expect(response.body).to.be.empty
        done()
      })
  })

  it('should not login a user', function (done) {
    const url = '/auth/login'
    const user = { username: 'test', password: '1234567' }

    request
      .post(url)
      .send(user)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.header.location).to.contains('/login?error=')
        expect(response.body).to.be.empty
        done()
      })
  })
})
