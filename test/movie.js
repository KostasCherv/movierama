/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const { expect } = require('chai')
const { Movie, Like, Hate } = require('../models')
const app = require('../server')

describe('Movie Controller', function () {
  const request = require('supertest').agent(app)
  this.timeout(20000)
  let firstMovie, user2

  before(function (done) {
    const url = '/auth/login'
    const userCreds = { username: 'test', password: '123456' }

    request
      .post(url)
      .send(userCreds)
      .set('Accept', 'application/json')
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.header.location).to.equals('/')
        expect(response.body).to.be.empty

        const url = '/user'
        request
          .get(url)
          .end(async function (error, response) {
            expect(error).to.be.null

            expect(response.body).to.have.property('data')
            expect(response.body.data).to.have.property('_id')
            expect(response.body.data.username).to.be.equal(userCreds.username)

            response.body.data
            done()
          })
      })
  })

  it('should get movies list', function (done) {
    const url = '/movies'

    request
      .get(url)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('data')
        expect(response.body.data).to.have.property('movies')
        expect(response.body.data.movies).to.have.lengthOf(0)
        expect(response.body.data).to.have.property('hasNext')
        expect(response.body.data.hasNext).to.be.false
        done()
      })
  })

  it('should create a movie', function (done) {
    const url = '/movie'
    const movie = { title: 'a movie title', description: 'a movie description' }

    request
      .post(url)
      .send(movie)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('data')
        expect(response.body.data).to.equals('ok')
        done()
      })
  })

  it('should get one movie', function (done) {
    const url = '/movies'

    request
      .get(url)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('data')
        expect(response.body.data).to.have.property('movies')
        expect(response.body.data.movies).to.have.lengthOf(1)

        expect(response.body.data).to.have.property('hasNext')
        expect(response.body.data.hasNext).to.be.false

        firstMovie = response.body.data.movies[0]
        done()
      })
  })

  it('should create 10 movies and has total 11', function (done) {
    const url = '/movie'

    let i = 0
    const create = () => {
      const movie = { title: 'a movie title' + i, description: 'a movie description' }
      request
        .post(url)
        .send(movie)
        .end((e, response) => {
          expect(e).to.be.null
          expect(response.body).to.have.property('data')
          expect(response.body.data).to.equals('ok')
          i++
          if (i === 10) {
            checkCount()
          } else {
            create()
          }
        })
    }
    create()

    const checkCount = () => {
      Movie.countDocuments().exec((err, cnt) => {
        expect(err).to.be.null
        expect(cnt).to.equals(11)
        done()
      })
    }
  })

  it('should get 10 movies and hasNext true and sortedBy date', function (done) {
    const url = '/movies'

    request
      .get(url)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('data')
        expect(response.body.data).to.have.property('movies')
        expect(response.body.data.movies).to.have.lengthOf(10)
        expect(response.body.data).to.have.property('hasNext')
        expect(response.body.data.hasNext).to.be.true

        expect(new Date(response.body.data.movies[1].createdAt).getTime()).to.be.lessThan(new Date(response.body.data.movies[0].createdAt).getTime())
        done()
      })
  })

  it('should update a movie', function (done) {
    const url = '/movie/' + firstMovie._id
    const newValues = { title: 'a new title', description: 'a new description' }
    request
      .put(url)
      .send(newValues)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body.data.n).to.be.equal(1)

        Movie.findById(firstMovie._id).exec((err, newMovie) => {
          expect(err).to.be.null

          expect(newMovie.title).to.be.equal(newValues.title)
          expect(newMovie.description).to.be.equal(newValues.description)
          done()
        })
      })
  })

  it('can not like own movie', function (done) {
    const url = '/movie/like'
    const body = { movieId: firstMovie._id }
    request
      .post(url)
      .send(body)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('error')
        expect(response.body.error).to.be.equal("User can't like own movie")

        done()
      })
  })

  it('can not hate own movie', function (done) {
    const url = '/movie/hate'
    const body = { movieId: firstMovie._id }
    request
      .post(url)
      .send(body)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('error')
        expect(response.body.error).to.be.equal("User can't hate own movie")

        done()
      })
  })

  it('should hate a movie', function (done) {
    const url = '/auth/login'
    const userCreds = { username: 'test1', password: '123456' }

    request
      .post(url)
      .send(userCreds)
      .set('Accept', 'application/json')
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.header.location).to.equals('/')
        expect(response.body).to.be.empty
        const url = '/user'
        request
          .get(url)
          .end(async function (error, response) {
            expect(error).to.be.null

            expect(response.body).to.have.property('data')
            expect(response.body.data).to.have.property('_id')
            expect(response.body.data.username).to.be.equal(userCreds.username)

            user2 = response.body.data
            hateRequest()
          })
      })

    const hateRequest = () => {
      const url = '/movie/hate'
      const body = { movieId: firstMovie._id }
      request
        .post(url)
        .send(body)
        .end(async function (error, response) {
          expect(error).to.be.null

          expect(response.body).to.have.property('data')
          expect(response.body.data).to.equals('ok')
          expect(response.body.data).to.equals('ok')

          const hate = await Hate.findOne({ movieId: firstMovie._id, userId: user2._id })
          expect(hate).to.be.not.null

          const like = await Like.findOne({ movieId: firstMovie._id, userId: user2._id })
          expect(like).to.be.null

          const movie = await Movie.findById(firstMovie._id)
          expect(movie.hates).to.have.length(1)
          expect(movie.likes).to.have.length(0)

          done()
        })
    }
  })

  it('should like a movie and delete hate', function (done) {
    const url = '/movie/like'
    const body = { movieId: firstMovie._id }
    request
      .post(url)
      .send(body)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('data')
        expect(response.body.data).to.equals('ok')

        const like = await Like.findOne({ movieId: firstMovie._id, userId: user2._id })
        expect(like).to.be.not.null

        const hate = await Hate.findOne({ movieId: firstMovie._id, userId: user2._id })
        expect(hate).to.be.null

        const movie = await Movie.findById(firstMovie._id)
        expect(movie.hates).to.have.length(0)
        expect(movie.likes).to.have.length(1)

        done()
      })
  })

  it('should get movies sorted by likes', function (done) {
    const url = '/movies?sortBy=likes'

    request
      .get(url)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body.data.movies[1].likes.length).to.be.lessThan(response.body.data.movies[0].likes.length)

        done()
      })
  })

  it('should hate a movie and delete like', function (done) {
    const url = '/movie/hate'
    const body = { movieId: firstMovie._id }
    request
      .post(url)
      .send(body)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('data')
        expect(response.body.data).to.equals('ok')
        expect(response.body.data).to.equals('ok')

        const hate = await Hate.findOne({ movieId: firstMovie._id, userId: user2._id })
        expect(hate).to.be.not.null

        const like = await Like.findOne({ movieId: firstMovie._id, userId: user2._id })
        expect(like).to.be.null

        const movie = await Movie.findById(firstMovie._id)
        expect(movie.hates).to.have.length(1)
        expect(movie.likes).to.have.length(0)

        done()
      })
  })

  it('should get movies sorted by hates', function (done) {
    const url = '/movies?sortBy=hates'

    request
      .get(url)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body.data.movies[1].hates.length).to.be.lessThan(response.body.data.movies[0].hates.length)

        done()
      })
  })

  it('should not delete not owing movie', function (done) {
    const url = '/movie/' + firstMovie._id
    request
      .delete(url)
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.body).to.have.property('error')
        expect(response.body.error).to.be.equal('Cant delete the given movie')

        Movie.findById(firstMovie._id).exec((err, movie) => {
          expect(err).to.be.null
          expect(movie).to.be.not.null
          done()
        })
      })
  })

  it('should delete own movie and dont remain like or hates', function (done) {
    const url = '/auth/login'
    const userCreds = { username: 'test', password: '123456' }

    request
      .post(url)
      .send(userCreds)
      .set('Accept', 'application/json')
      .end(async function (error, response) {
        expect(error).to.be.null

        expect(response.header.location).to.equals('/')
        expect(response.body).to.be.empty
        const url = '/user'
        request
          .get(url)
          .end(async function (error, response) {
            expect(error).to.be.null

            expect(response.body).to.have.property('data')
            expect(response.body.data).to.have.property('_id')
            expect(response.body.data.username).to.be.equal(userCreds.username)

            user2 = response.body.data
            deleteMovie()
          })
      })

    const deleteMovie = () => {
      const url = '/movie/' + firstMovie._id
      request
        .delete(url)
        .end(async function (error, response) {
          expect(error).to.be.null

          expect(response.body).to.have.property('data')
          expect(response.body.data._id).to.be.equal(firstMovie._id)

          Movie.findById(firstMovie._id).exec(async (err, movie) => {
            expect(err).to.be.null
            expect(movie).to.be.null

            const hates = await Hate.find({ movieId: firstMovie._id })
            expect(hates).to.have.length(0)

            const likes = await Like.find({ movieId: firstMovie._id })
            expect(likes).to.have.length(0)

            done()
          })
        })
    }
  })
})
