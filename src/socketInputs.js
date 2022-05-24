import { Socket } from 'socket.io-client'
import {socket} from '../helpers/socketConf'
socket.on('setRoom',(room)=>{
    window.room = room
    document.getElementById('room').innerHTML+=`<p>Room key: ${window.room}</p>`
})
socket.on('setRemote',(room)=>{
    window.room = room
    window.remote = true
    console.log(window.remote)
    socket.emit('setUpList')
})
socket.on('setUpList',()=>{
    if(document.getElementById("positionList").style.display !== 'none'){
        document.getElementById('positionList').style.display = 'flex'
        var count = 1
        for (const item in window.componentsArray) {
            if(item==='ArmBase2'){
                document.getElementById('positionList').innerHTML+='<p style="color:white" class="listItem">Base<i id="arrowSelector" class="fa-solid fa-arrow-left-long"></i></p>'
            }else if((item.includes('ArmBase') && item !== 'ArmBase')){
                document.getElementById('positionList').innerHTML+=`<p class="listItem">Arm ${count}</p>`
                count ++
            }else if(item === 'SubArm5'){
                document.getElementById('positionList').innerHTML+='<p class="listItem">Head</p>'
            }
        }
    }
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
socket.on('moveList',(armPosition)=>{
        var node = document.getElementById("arrowSelector");
        if (node.parentNode) {
            node.parentNode.style.color='black'
            node.parentNode.removeChild(node);
        }
        let items = document.getElementsByClassName('listItem')
        items[armPosition].innerHTML+='<i id="arrowSelector" class="fa-solid fa-arrow-left-long"></i>'
        items[armPosition].style.color = 'white'
})