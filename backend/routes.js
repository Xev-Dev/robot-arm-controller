const express = require('express')
const router = express.Router()
const cors = require('cors')
// Middleware
router.use(cors())
//Import routers
const queryAuthRoute = require('./controllers/AuthController')
router.use('/auth', queryAuthRoute)
module.exports = router