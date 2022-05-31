const express = require('express')
const app = express()
const server = require("http").Server(app)
const cors = require('cors')
const Router = require("./routes.js")
const connection = require('./db.js')
connection.connect((err)=>{
    err?console.log(err):console.log('Connected to database correctly')
});
app.use(express.json({
    limit: '50mb'
}))
app.use(cors())
app.use('/', Router)
server.listen(3600)