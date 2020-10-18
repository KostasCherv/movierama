var express = require('express')
const router = express.Router()
const { ensureLoggedIn } = require('connect-ensure-login')
const { movieController } = require('../controllers')

router.post('/movie', ensureLoggedIn(), movieController.createMovie)

router.post('/movie/like', ensureLoggedIn(), movieController.likeMovie)

router.post('/movie/hate', ensureLoggedIn(), movieController.hateMovie)

router.delete('/movie/:movieId', ensureLoggedIn(), movieController.deleteMovie)

router.put('/movie/:movieId', ensureLoggedIn(), movieController.updateMovie)

router.get('/movies/', movieController.getMovies)

module.exports = router
