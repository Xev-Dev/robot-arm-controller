import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { GUI } from 'dat.gui'
import { io } from "socket.io-client"
//Importamos la array de los guis desde la carpeta helpers
import { guis } from "./helpers/guis"
console.log(await Controller.search())
let look_x = 0
let look_y = 35
let look_z = 0
let posBrazo = 0
let nombreBrazoSeleccionado = undefined
window.joystick = undefined
window.three = THREE
let arrowUp = document.getElementById('arrowUp')
let arrowDown = document.getElementById('arrowDown')
window.remote = false
window.componentsArray = {}
window.boxHelper = null
window.robotActivePart = null
window.guis = {
    'armbase2':undefined,
    'armbase3':undefined,
    'armbase4':undefined,
    'armbase5':undefined,
    'subarm5':undefined
}
window.joystick = new JoyStick('joyDiv',{
    title: 'joystick',
    width: 120,
    height: 120,
    internalFillColor: '#000000',
    internalLineWidth: 2,
    internalStrokeColor: '#000000',
    externalLineWidth: 2,
    externalStrokeColor: '#000000',
    autoReturnToCenter: true
})
var joystick = document.getElementById("joystick")
//Creamos una variable window con la array de los guis
window.guis = guis
window.room = ""
window.socket = io("http://localhost:3300")
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
        window.guis[0].gui.setValue(window.guis[0].gui.object._y+0.09)
    }else{
        window.guis[0].gui.setValue(window.guis[0].gui.object._y-0.09)
    }
})
socket.on('armbase3',(bool)=>{
    if(bool){
        window.guis[1].gui.setValue(window.guis[1].gui.object._z+0.05)
    }else{
        window.guis[1].gui.setValue(window.guis[1].gui.object._z-0.05)
    }
})
socket.on('armbase4',(bool)=>{
    if(bool){
        window.guis[2].gui.setValue(window.guis[2].gui.object._z+0.05)
    }else{
        window.guis[2].gui.setValue(window.guis[2].gui.object._z-0.05)
    }
})
socket.on('armbase5',(bool)=>{
    if(bool){
        window.guis[3].gui.setValue(window.guis[3].gui.object._z+0.05)
    }else{
        window.guis[3].gui.setValue(window.guis[3].gui.object._z-0.05)
    }
})
socket.on('subarm5',(bool)=>{
    if(bool){
        window.guis[4].gui.setValue(window.guis[4].gui.object._y+0.09)
    }else{
        window.guis[4].gui.setValue(window.guis[4].gui.object._y-0.09)
    }
})
joystick.addEventListener("touchmove",function(){
    moverBrazo(posBrazo)
},false)
onMainWindowSize()
//Funcion que detecta un mando y lo almacena en una variable
window.addEventListener('gc.controller.found', function () {
    var controller = Controller.getController(0)
    window.a = controller.settings.list()
}, false)

// Funcion que detecta los botones del mando (Cruzeta,gatillos,botones)
window.addEventListener('gc.button.hold', function (event) {
    var button = event.detail
    //El switch coge el boton que estas tocando y asigna un valor a un componente segun el boton pulsado
    switch (button.name) {
        case "LEFT_SHOULDER":
            window.guis[1].gui.setValue(window.guis[1].gui.object._z + 0.05)
            break
        case "RIGHT_SHOULDER":
            window.guis[1].gui.setValue(window.guis[1].gui.object._z - 0.05)
            break
        case "LEFT_SHOULDER_BOTTOM":
            window.guis[2].gui.setValue(window.guis[2].gui.object._z + 0.05)
            break
        case "RIGHT_SHOULDER_BOTTOM":
            window.guis[2].gui.setValue(window.guis[2].gui.object._z - 0.05)
            break
        case "DPAD_LEFT":
            window.guis[3].gui.setValue(window.guis[3].gui.object._z + 0.05)
            break
        case "DPAD_RIGHT":
            window.guis[3].gui.setValue(window.guis[3].gui.object._z - 0.05)
            break
        default:
            break
    }
}, false)
// Funcion que detecta los joysticks
window.addEventListener('gc.analog.hold', function (event) {
    var stick = event.detail
    //El switch coge el boton que estas tocando y asigna un valor a un componente segun el boton pulsado
    switch (stick.name) {
        case "LEFT_ANALOG_STICK":
            if (stick.position.x < 0) {
                window.guis[0].gui.setValue(window.guis[0].gui.object._y + (stick.position.x * -1) * 0.2)
            } else {
                window.guis[0].gui.setValue(window.guis[0].gui.object._y - (stick.position.x) * 0.2)
            }
            break
        case "RIGHT_ANALOG_STICK":
            if (stick.position.x < 0) {
                window.guis[4].gui.setValue(window.guis[4].gui.object._y + (stick.position.x * -1) * 0.2)
            } else {
                window.guis[4].gui.setValue(window.guis[4].gui.object._y - (stick.position.x) * 0.2)
            }
            break
        default:
            break
    }
}, false)
////THREE JS SUPER FUNCTION
window.setWorld = function (){
    //Creamos punto de luz 
    var pl = new THREE.PointLight(0xffffff)
    document.getElementById('room').style.display="block"
    pl.position.set(30, 60, 40)
    const sphereSize = 1
    //Creamos un helper para saber donde se encuentra el punto de luz 
    const pointLightHelper = new THREE.PointLightHelper(pl, sphereSize, 0x000000)
    //Creamos escena
    var scene = new THREE.Scene()
    scene.background = new THREE.Color(0x7693b4)
    //Añadimos a la escena el punto de luz y el helper para verla
    scene.add(pl)
    scene.add(pointLightHelper)
    //Creamos una camara
    var camera = new THREE.PerspectiveCamera(35, 840 / 680, .1, 500)
    //Configuramos la camara
    camera.position.set(3, 0.5, 3)
    camera.position.set(1.5, 3, 5)
    camera.position.set(50, 100, 135)
    camera.lookAt(look_x, look_y, look_z)
    //Añadimos la camara a la escena
    scene.add(camera)
    //Añadimos un suelo y un rectangulo por debajo del brazo 
    //robótico para recrear una escena con algo de realidad
    var geoFloor = new THREE.PlaneBufferGeometry(100, 100, 30, 30)
    var geoCube = new THREE.BoxGeometry(20, 100, 8)
    var matFloor = new THREE.MeshBasicMaterial({ color: 0xadb3af, side: THREE.DoubleSide })
    var matCube = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
    var cube = new THREE.Mesh(geoCube, matCube)
    var floor = new THREE.Mesh(geoFloor, matFloor)
    //Rotaciones de los elementos
    floor.rotateX(- Math.PI / 2)
    cube.rotateX(- Math.PI / 2)
    cube.rotateY(- Math.PI / 2)
    //Posicionamiento
    floor.position.y -= 20
    cube.position.y -= 10
    //Finalmente añadimos
    scene.add(floor)
    scene.add(cube)
    //Preparamos un render
    var renderer = new THREE.WebGLRenderer({ antialias: true })
    window.render = renderer
    //Handle initial window size 
    document.getElementById('menu').style.display = "none"
    onWindowSize()
    //Listener para controlar el resize
    window.addEventListener('resize', onWindowSize, false)
    //Introducimos nuestro objeto render en el DOM
    document.getElementById('world').appendChild(renderer.domElement)
    //Configuramos los controles para poder movernos por el mundo
    var controls = new MapControls(camera, renderer.domElement)
    controls.target.set(look_x, look_y, look_z)
    //Creamos un loop con una funcion recursiva
    var loop = function () {
        requestAnimationFrame(loop)
        renderer.render(scene, camera)
        controls.update()
    }
    //console.log(window.joystick.GetPosX())
    //Cargamos nuestro modelo 3d y disponemos de una función de callback con el resultado.
    var loader = new ColladaLoader()
    loader.load("./models/ur10_2.dae", function (result) {
        window.componentsArray = getRobotItems(result.scene, componentsArray)
        scene.add(window.componentsArray.ArmBase)
        scene.add(window.componentsArray.ArmBase2)
        let pivot1 = setPivot(window.componentsArray.ArmBase2, window.componentsArray.ArmBase3)
        pivot1.position.y += 5
        window.componentsArray.ArmBase3.position.y -= 5
        let pivot2 = setPivot(window.componentsArray.ArmBase3, window.componentsArray.ArmBase4)
        pivot2.position.y += 29
        window.componentsArray.ArmBase4.position.y -= 29
        let pivot3 = setPivot(window.componentsArray.ArmBase4, window.componentsArray.ArmBase5)
        pivot3.position.y += 52
        window.componentsArray.ArmBase5.position.y -= 52
        let pivot4 = setPivot(window.componentsArray.ArmBase5, window.componentsArray.SubArm5)
        pivot4.position.y += 57
        window.componentsArray.SubArm5.position.y -= 57
        pivot4.position.z -= 6.5
        //-2.8, 2.8
        window.componentsArray.SubArm5.position.z += 6.5
        //Aqui se añaden las partes del brazo al gui y se establecen las direcciones de sus movimientos y limitaciones a la hora de girar
        const gui = new GUI()
        window.guis[0].gui = gui.add(window.componentsArray.ArmBase2.rotation, 'y', (Math.PI * 2 * -1), (Math.PI * 2)).name('ArmBase2')
        window.guis[1].gui = gui.add(pivot1.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) / 2 - 0.3).name('Armbase3')
        window.guis[2].gui = gui.add(pivot2.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) / 2 - 0.3).name('Armbase4')
        window.guis[3].gui = gui.add(pivot3.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) - 0.3).name('Armbase5')
        window.guis[4].gui = gui.add(pivot4.rotation, 'y', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) - 0.3).name('SubArm5')
        posBrazo = 1
        loop()
    })
}

window.hiddenButtons = function(){
    document.getElementById('controller_button').style.display='none'
    document.getElementById('pccontroller_button').style.display='none'
    document.getElementById('roomKey').style.display='flex'
}
window.setWorldController = function (){
    socket.emit('joinRoom',document.getElementById('roomInput').value)
    document.getElementById('menu').style.display = 'none'
    document.getElementById('mobileArrows').style.display = 'flex'
    document.getElementById('joyDiv').style.display = 'block'
    document.getElementById('mobileBackground').style.display = 'block'
    posBrazo = 1
}
function onWindowSize() {
    window.render.setSize(window.innerWidth, window.innerHeight)
    if (window.innerWidth < 926) {
        document.getElementById('controlls-container').style.display = "none"
        document.getElementById('joyDiv').style.display = "block"
        document.getElementById('mobileArrows').style.display = "flex"
        document.getElementById('pccontroller_button').style.display = "block"
    } else {
        document.getElementById('room').style.display="block"
        document.getElementById('controlls-container').style.display = "block"
        document.getElementById('joyDiv').style.display = "none"
        document.getElementById('mobileArrows').style.display = "none"
        document.getElementById('pccontroller_button').style.display = "none"
    }
}
function moverBrazo(posBrazo){
    switch (posBrazo) {
        case 1:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if(window.remote){
                    socket.emit('armbase2',true)
                }else{
                    window.guis[0].gui.setValue(window.guis[0].gui.object._y+0.09)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if(window.remote){
                    socket.emit('armbase2',false)
                }else{
                    window.guis[0].gui.setValue(window.guis[0].gui.object._y-0.09)
                }
            }
            break
        case 2:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if(window.remote){
                    socket.emit('armbase3',false)
                }else{
                    window.guis[1].gui.setValue(window.guis[1].gui.object._z - 0.05)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if(window.remote){
                    socket.emit('armbase3',true)
                }else{
                    window.guis[1].gui.setValue(window.guis[1].gui.object._z + 0.05)
                }
            }          
            break
        case 3:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if(window.remote){
                    socket.emit('armbase4',false)
                }else{
                    window.guis[2].gui.setValue(window.guis[2].gui.object._z - 0.05)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if(window.remote){
                    socket.emit('armbase4',true)
                }else{
                    window.guis[2].gui.setValue(window.guis[2].gui.object._z+0.05)
                }
            }               
            break
        case 4:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if(window.remote){
                    socket.emit('armbase5',false)
                }else{
                    window.guis[3].gui.setValue(window.guis[3].gui.object._z-0.05)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if(window.remote){
                    socket.emit('armbase5',true)
                }else{
                    window.guis[3].gui.setValue(window.guis[3].gui.object._z+0.05)
                }
                
            }               
            break
        case 5:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if(window.remote){
                    socket.emit('subarm5',true)
                }else{
                    window.guis[4].gui.setValue(window.guis[4].gui.object._y+0.09)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if(window.remote){
                    socket.emit('subarm5',false)
                }else{
                    window.guis[4].gui.setValue(window.guis[4].gui.object._y-0.09)
                }
            }            
            break
        default:
            break
    }
}
function onMainWindowSize() {
    if (window.innerWidth < 926) {
        document.getElementById('pccontroller_button').style.display = "block"
    } else {
        document.getElementById('pccontroller_button').style.display = "none"
    }
}
function armSelected(){
    removeBoxHelper()
    switch (posBrazo) {
        case 1:
            window.robotActivePart = window.componentsArray.ArmBase2
            break
        case 2:
            window.robotActivePart = window.componentsArray.ArmBase3
            break
        case 3:
            window.robotActivePart = window.componentsArray.ArmBase4
            break
        case 4:
            window.robotActivePart = window.componentsArray.ArmBase5
            break
        case 5:
            window.robotActivePart = window.componentsArray.SubArm5
            break
        default:
            break
    }
    addBoxHelper()
}
arrowUp.addEventListener('click',()=>{
    posBrazo++
    if(posBrazo >5){
        posBrazo = 5
    }
    armSelected()
})
arrowDown.addEventListener('click',()=>{
    posBrazo--
    if(posBrazo < 1){
        posBrazo = 1
    }
    armSelected()
})
//Funcion que setea un pivot entre dos componentes del robot. Devuelve el pivot
function setPivot(item1, item2) {
    //  PARA VER LOS EJES DE LOS PIVOTES
    //let axes = new THREE.AxisHelper(105) 
    let pivot = new THREE.Object3D()
    //pivot.add(axes)
    item1.add(pivot)
    pivot.add(item2)
    return pivot
}
//Funcion recursiva a la cual le pasamos el robot y a si misma. 
//Devuelve un objeto con objetos dentro de tipo grupo
function getRobotItems(object_group, componentsArray) {
    object_group.children.forEach(function (item) {
        var temp_componentsArray = []
        if (item.type == "Group" && !item.name.includes("ur10")) {
            componentsArray[item.name] = item
            temp_componentsArray = getRobotItems(item, componentsArray)
        }
        componentsArray = Object.assign({}, componentsArray, temp_componentsArray)
    })
    return componentsArray
}
function removeBoxHelper(){
    if(window.robotActivePart){
        window.robotActivePart.children.splice(window.robotActivePart.children.length-1)
    }
}
function addBoxHelper(){
    if(window.robotActivePart){
        var boxHelper = new window.three.BoxHelper(window.robotActivePart,0x00ff00)
        boxHelper.matrixAutoUpdate=true
        window.robotActivePart.add(boxHelper)
        window.boxHelper = boxHelper
    }
}