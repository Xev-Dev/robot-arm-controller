const server = require("http").createServer()
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
})

io.on("connection",(socket)=>{
    var myRoom = socket.id.match(/.{1,6}/g)[0] 
    socket.join(myRoom)
    console.log('joining room: ',myRoom)
    socket.emit('setRoom',myRoom)
    socket.on('joinRoom',(room)=>{
        myRoom = room 
        socket.join(myRoom)
        console.log('joining room: ',myRoom)
        socket.emit('setRemote',myRoom)
    })
    socket.on('armbase2',(bool)=>{
        socket.to(myRoom).emit('armbase2',(bool))
    })
    socket.on('armbase3',(bool)=>{
        socket.to(myRoom).emit('armbase3',(bool))
    })
    socket.on('armbase4',(bool)=>{
        socket.to(myRoom).emit('armbase4',(bool))
    })
    socket.on('armbase5',(bool)=>{
        socket.to(myRoom).emit('armbase5',(bool))
    })
    socket.on('subarm5',(bool)=>{
        socket.to(myRoom).emit('subarm5',(bool))
    })
})
server.listen(3300, () => {
    console.log('listening on *:3300')
})
