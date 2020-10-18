var express = require('express')
const router = express.Router()
const { ensureLoggedIn } = require('connect-ensure-login')
const { authController } = require('../controllers')

router.post('/auth/login', authController.login)

router.post('/auth/register', authController.register)

router.post('/auth/logout', ensureLoggedIn(), authController.logout)

module.exports = router
