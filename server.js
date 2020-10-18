const express = require('express')
const app = express()
const passport = require('passport')
const ensureNotLoggedIn = require('./services/ensureNotLoggedIn')
require('dotenv').config()

require('./database')
require('./models')
require('./services/passport')

const routes = require('./routes')

app.use(express.static(require('path').join(__dirname, '/html')))

const bodyParser = require('body-parser')
const expressSession = require('express-session')({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressSession)

// passport setup
app.use(passport.initialize())
app.use(passport.session())

routes.map(route => app.use('/', route))

// routes for static files
app.get('/login',
  ensureNotLoggedIn,
  (req, res) => {
    res.sendFile('html/login.html', {
      root: __dirname
    })
  }
)

app.get('/',
  (req, res) => res.sendFile('html/index.html', {
    root: __dirname
  })
)

app.get('/register',
  ensureNotLoggedIn,
  (req, res) => res.sendFile('html/register.html', {
    root: __dirname
  })
)

const port = process.env.PORT || 3000
require('mongoose').connection.once('open', () => {
  app.listen(port, () => console.log('App listening on port ' + port))
  app.emit('started')
})

module.exports = app
