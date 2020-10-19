const { Movie, Like, Hate } = require('../models')
var ObjectId = require('mongoose').Types.ObjectId

const createMovie = (req, res) => {
  const { title, description } = req.body
  if (!title || title === '') {
    return res.send({ error: 'Title is required' })
  }
  try {
    new Movie({
      title,
      description,
      createdBy: req.user._id
    }).save()

    res.send({ data: 'ok' })
  } catch (e) {
    res.send({ error: e })
  }
}

const getMovies = async (req, res) => {
  const page = req.query.page || 1
  const createdBy = req.query.createdBy || false
  const sortBy = req.query.sortBy || 'createdAt'

  try {
    const query = {}
    if (createdBy && ObjectId.isValid(createdBy)) {
      query.createdBy = createdBy
    }

    const total = await Movie.countDocuments(query)
    const movies = await Movie
      .find(query)
      .populate('likes')
      .populate('hates')
      .populate('createdBy')
      .sort({ [sortBy]: -1 })
      .skip((page - 1) * 10)
      .limit(10)

    let hasNext = false
    if (total > (page * 10)) {
      hasNext = true
    }

    res.send({ data: { movies, hasNext } })
  } catch (e) {
    res.send({ error: e })
  }
}

const deleteMovie = async (req, res) => {
  const { movieId } = req.params

  try {
    const movie = await Movie.findById(movieId)
    if (movie && movie.createdBy.equals(req.user._id)) {
      const movie = await Movie.findByIdAndDelete(movieId)

      await Promise.all([
        Hate.deleteMany({ _id: { $in: movie.hates.map(ObjectId) } }),
        Like.deleteMany({ _id: { $in: movie.likes.map(ObjectId) } })
      ])

      res.send({ data: movie })
    } else {
      res.send({ error: 'Cant delete the given movie' })
    }
  } catch (e) {
    res.send({ error: e })
  }
}

const updateMovie = async (req, res) => {
  const { movieId } = req.params
  const { title, description } = req.body
  try {
    let movie = await Movie.findById(movieId)
    if (movie && movie.createdBy.equals(req.user._id)) {
      const updateQuery = {}
      if (title) {
        updateQuery.title = title
      }

      if (description) {
        updateQuery.description = description
      }

      movie = await movie.update(updateQuery)
      res.send({ data: movie })
    } else {
      res.send({ error: 'Could not update given movie' })
    }
  } catch (e) {
    res.send({ error: e })
  }
}

const likeMovie = async (req, res) => {
  const { movieId } = req.body
  const userId = req.user._id

  try {
    const movie = await Movie.findById(movieId)

    if (movie && movie.createdBy.equals(userId)) {
      res.send({ error: "User can't like own movie" })
    } else if (movie) {
      const alreadyLike = await Like.findOne({ userId, movieId })
      if (alreadyLike) {
        res.send({ error: 'Already Like' })
        return
      }

      const hate = await Hate.findOne({ userId, movieId })
      if (hate) {
        hate.deleteOne()
      }

      await new Like({
        userId,
        movieId
      }).save()

      res.send({ data: 'ok' })
    } else {
      res.send({ error: 'Movie not found' })
    }
  } catch (e) {
    console.log(e)
    res.send({ error: e })
  }
}

const hateMovie = async (req, res) => {
  const { movieId } = req.body
  const userId = req.user._id

  try {
    const movie = await Movie.findById(movieId)

    if (movie && movie.createdBy.equals(userId)) {
      res.send({ error: "User can't hate own movie" })
    } else if (movie) {
      const alreadyHate = await Hate.findOne({ userId, movieId })
      if (alreadyHate) {
        res.send({ error: 'Already Hate' })
        return
      }

      const like = await Like.findOne({ userId, movieId })
      if (like) {
        like.deleteOne()
      }

      await new Hate({
        userId,
        movieId
      }).save()

      res.send({ data: 'ok' })
    } else {
      res.send({ error: 'Movie not found' })
    }
  } catch (e) {
    res.send({ error: e })
  }
}

module.exports = {
  createMovie,
  getMovies,
  deleteMovie,
  updateMovie,
  likeMovie,
  hateMovie
}
