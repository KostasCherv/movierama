const { User } = require('../models')

const getUser = async (req, res) => {
  if (req.session.passport && req.session.passport.user) {
    const user = await User
      .findOne({ username: req.session.passport.user })
      .populate('liked')
      .populate('hated')

    user.liked = (user.liked || []).map(o => o.movieId)
    user.hated = (user.hated || []).map(o => o.movieId)

    res.send({
      data: user
    })
  } else {
    res.send({ data: null })
  }
}

module.exports = {
  getUser
}
