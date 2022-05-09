const server = require("http").createServer()
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
})
io.on("connection",(socket)=>{
    console.log('new user connected')
})
server.listen(3300, () => {
    console.log('listening on *:3300')
})