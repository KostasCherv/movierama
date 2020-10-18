module.exports = function (req, res, next) {
  if (req.session.passport && req.session.passport.user) {
    // if user is logged-in redirect back to index page //
    res.redirect('/')
  } else {
    next()
  }
}
