const server = require("http").createServer()
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    },
})
io.on("connection",(socket)=>{
    socket.join(socket.id.match(/.{1,6}/g)[0])
    socket.emit('setRoom',socket.id.match(/.{1,6}/g)[0])
    socket.on('joinRoom',(room)=>{
        socket.join(room)
        console.log('joining room: ',room)
        socket.emit('setRoom',room)
    })
})
server.listen(3300, () => {
    console.log('listening on *:3300')
})