const express = require('express')
const router = express.Router()
const cors = require('cors')
// Middleware
router.use(cors())
//Import routers
const queryAuthRoute = require('./controllers/AuthController')
const queryRobotRoute = require('./controllers/RobotController')
router.use('/auth', queryAuthRoute)
router.use('/robot', queryRobotRoute)
module.exports = router