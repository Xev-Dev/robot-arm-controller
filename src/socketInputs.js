import {socket} from '../helpers/socketConf'
socket.on('setRoom',(room)=>{
    window.room = room
    document.getElementById('room').innerHTML+=`<p>Room key: ${window.room}</p>`
})
socket.on('setRemote',(room)=>{
    window.room = room
    window.remote = true
})
socket.on('armbase2',(bool)=>{
    if(bool){
        window.guis.armBase2.setValue(window.guis.armBase2.object._y+0.09)
    }else{
        window.guis.armBase2.setValue(window.guis.armBase2.object._y-0.09)
    }
})
socket.on('armbase3',(bool)=>{
    if(bool){
        window.guis.armBase3.setValue(window.guis.armBase3.object._z+0.05)
    }else{
        window.guis.armBase3.setValue(window.guis.armBase3.object._z-0.05)
    }
})
socket.on('armbase4',(bool)=>{
    if(bool){
        window.guis.armBase4.setValue(window.guis.armBase4.object._z+0.05)
    }else{
        window.guis.armBase4.setValue(window.guis.armBase4.object._z-0.05)
    }
})
socket.on('armbase5',(bool)=>{
    if(bool){
        window.guis.armBase5.setValue(window.guis.armBase5.object._z+0.05)
    }else{
        window.guis.armBase5.setValue(window.guis.armBase5.object._z-0.05)
    }
})
socket.on('subarm5',(bool)=>{
    if(bool){
        window.guis.subArm5.setValue(window.guis.subArm5.object._y+0.09)
    }else{
        window.guis.subArm5.setValue(window.guis.subArm5.object._y-0.09)
    }
})