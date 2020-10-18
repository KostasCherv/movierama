const { User } = require('../models')
const passport = require('passport')

const register = async (req, res, next) => {
  const { username, password } = req.body
  try {
    const user = await User.register({ username }, password)

    req.logIn(user, function (err) {
      if (err) {
        return next(err)
      }

      return res.redirect('/')
    })
  } catch (e) {
    return res.redirect('/register?error=' + e)
  }
}

const login = (req, res, next) => {
  passport.authenticate('local',
    (err, user, info) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.redirect('/login?error=' + info)
      }

      req.logIn(user, function (err) {
        if (err) {
          return next(err)
        }

        return res.redirect('/')
      })
    })(req, res, next)
}

const logout = (req, res) => {
  req.logOut()
  res.redirect('/')
}

module.exports = {
  login,
  logout,
  register
}
