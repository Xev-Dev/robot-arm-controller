import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { GUI } from 'dat.gui'
import { io } from "socket.io-client"
//Importamos la array de los guis desde la carpeta helpers
import {guis} from "./helpers/guis"
console.log(await Controller.search())
let look_x = 0
let look_y = 35
let look_z = 0
window.joystick = undefined
//Creamos una variable window con la array de los guis
window.guis = guis
const socket = io("http://localhost:3300")
//Funcion que detecta un mando y lo almacena en una variable
window.addEventListener('gc.controller.found', function() {
    var controller = Controller.getController(0)
    window.a = controller.settings.list()
    console.log(controller.layoutInfo)
}, false)
// Funcion que detecta los botones del mando (Cruzeta,gatillos,botones)
window.addEventListener('gc.button.hold', function(event) {
    var button = event.detail
    console.log(button)
    //El switch coge el boton que estas tocando y asigna un valor a un componente segun el boton pulsado
    switch (button.name) {
        case "LEFT_SHOULDER":
            window.guis[1].gui.setValue(window.guis[1].gui.object._z+0.05)
            break
        case "RIGHT_SHOULDER":
            window.guis[1].gui.setValue(window.guis[1].gui.object._z-0.05)
            break
        case "LEFT_SHOULDER_BOTTOM":
            window.guis[2].gui.setValue(window.guis[2].gui.object._z+0.05)
            break
        case "RIGHT_SHOULDER_BOTTOM":
            window.guis[2].gui.setValue(window.guis[2].gui.object._z-0.05)
            break
        case "DPAD_LEFT":
            window.guis[3].gui.setValue(window.guis[3].gui.object._z+0.05)
            break
        case "DPAD_RIGHT":
            window.guis[3].gui.setValue(window.guis[3].gui.object._z-0.05)
            break
        default:
            break
    }
}, false)

// Funcion que detecta los joysticks
window.addEventListener('gc.analog.hold', function(event) {
    var stick = event.detail
    console.log(stick)
    //El switch coge el boton que estas tocando y asigna un valor a un componente segun el boton pulsado
    switch (stick.name) {
        case "LEFT_ANALOG_STICK":
            if (stick.position.x < 0) {
                window.guis[0].gui.setValue(window.guis[0].gui.object._y+(stick.position.x*-1)*0.2) 
            } else {
                window.guis[0].gui.setValue(window.guis[0].gui.object._y-(stick.position.x)*0.2)
            } 
            break
        case "RIGHT_ANALOG_STICK":
            if (stick.position.x < 0) {
                window.guis[4].gui.setValue(window.guis[4].gui.object._y+(stick.position.x*-1)*0.2) 
            } else {
                window.guis[4].gui.setValue(window.guis[4].gui.object._y-(stick.position.x)*0.2)
            } 
            break
        default:
            break
    }
}, false)
////THREE JS SUPER FUNCTION
window.setWorld = function setWorld() {
    //Creamos punto de luz 
    var pl = new THREE.PointLight(0xffffff)
    pl.position.set(30, 60, 40)
    const sphereSize = 1    
    //Creamos un helper para saber donde se encuentra el punto de luz 
    const pointLightHelper = new THREE.PointLightHelper( pl, sphereSize, 0x000000 )
    //Creamos escena
    var scene = new THREE.Scene()
    scene.background = new THREE.Color(0x7693b4)
    //Añadimos a la escena el punto de luz y el helper para verla
    scene.add(pl)
    scene.add(pointLightHelper)
    //Creamos una camara
    var camera = new THREE.PerspectiveCamera(35, 840 / 680, .1, 500 )
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
    var geoCube = new THREE.BoxGeometry( 20, 100, 8 )
    var matFloor = new THREE.MeshBasicMaterial({ color: 0xadb3af, side: THREE.DoubleSide })
    var matCube = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
    var cube = new THREE.Mesh(geoCube,matCube) 
    var floor = new THREE.Mesh(geoFloor,matFloor)
    //Rotaciones de los elementos
    floor.rotateX( - Math.PI / 2)
    cube.rotateX( - Math.PI / 2)
    cube.rotateY( - Math.PI / 2)
    //Posicionamiento
    floor.position.y -= 20
    cube.position.y -= 10
    //Finalmente añadimos
    scene.add(floor)
    scene.add(cube)
    //Preparamos un render
    var renderer = new THREE.WebGLRenderer({antialias:true})
    window.render = renderer
    //Handle initial window size 
    document.getElementById('menu').style.display="none"
    onWindowSize()
    //Listener para controlar el resize
    window.addEventListener('resize', onWindowSize,false)
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
    //console.log(window.joystick.GetPosX());
    //Cargamos nuestro modelo 3d y disponemos de una función de callback con el resultado.
    var loader = new ColladaLoader()
    loader.load("./models/ur10_2.dae", function (result) {
        let componentsArray = []
        componentsArray = getRobotItems(result.scene, componentsArray)
        scene.add(componentsArray.ArmBase)
        scene.add(componentsArray.ArmBase2)
        let pivot1 = setPivot(componentsArray.ArmBase2,componentsArray.ArmBase3)
        pivot1.position.y+=5
        componentsArray.ArmBase3.position.y-=5
        let pivot2 = setPivot(componentsArray.ArmBase3,componentsArray.ArmBase4)
        pivot2.position.y+=29
        componentsArray.ArmBase4.position.y-=29
        let pivot3 = setPivot(componentsArray.ArmBase4,componentsArray.ArmBase5)
        pivot3.position.y+=52
        componentsArray.ArmBase5.position.y-=52
        let pivot4 = setPivot(componentsArray.ArmBase5,componentsArray.SubArm5)
        pivot4.position.y+=57
        componentsArray.SubArm5.position.y-=57
        pivot4.position.z-=6.5
        //-2.8, 2.8
        componentsArray.SubArm5.position.z+=6.5
        //Aqui se añaden las partes del brazo al gui y se establecen las direcciones de sus movimientos y limitaciones a la hora de girar
        const gui = new GUI()
        window.guis[0].gui=gui.add(componentsArray.ArmBase2.rotation, 'y',(Math.PI*2*-1), (Math.PI*2)).name('ArmBase2')
        window.guis[1].gui=gui.add(pivot1.rotation, 'z',(Math.PI*2*-1)/2+0.3, (Math.PI*2)/2-0.3).name('Armbase3')
        window.guis[2].gui=gui.add(pivot2.rotation, 'z',(Math.PI*2*-1)/2+0.3, (Math.PI*2)/2-0.3).name('Armbase4')
        window.guis[3].gui=gui.add(pivot3.rotation, 'z',(Math.PI*2*-1)/2+0.3, (Math.PI*2)-0.3).name('Armbase5')
        window.guis[4].gui=gui.add(pivot4.rotation, 'y',(Math.PI*2*-1)/2+0.3, (Math.PI*2)-0.3).name('SubArm5')
        loop()
    })  
}
window.changeComponent = function(direction){
    if(direction === 'up'){
        console.log(direction)
        for(var i=0; i<window.guis.length; i++){
            if(window.guis[i].selected){
                window.guis[i].selected = false
                console.log('changing value to false',window.guis[i])
                window.guis[+i+1].selected = true
                console.log('changing next value to true',window.guis[+i+1])
            }
        }
    }else{
        console.log(direction)
    }
}
function onWindowSize(){
    window.render.setSize( window.innerWidth, window.innerHeight )
    if(window.innerWidth < 926){
        document.getElementById('controlls-container').style.display="none"
        document.getElementById('joyDiv').style.display="block"
        document.getElementById('mobileArrows').style.display="flex"
        if(!window.joystick){
             //Set mobile joystick if not exists window.joystick
            setJoystick()
        }
    }else{
        document.getElementById('controlls-container').style.display="block"
        document.getElementById('joyDiv').style.display="none"
        document.getElementById('mobileArrows').style.display="none"    
    }
}

//Funcion para setear los controles en el móvil
function setJoystick(){
    window.joystick = new JoyStick('joyDiv',{
            // The ID of canvas element
            title: 'joystick',
            // width/height
            width: undefined,
            height: undefined,
            internalFillColor: '#000000',
            // Border width of Stick
            internalLineWidth: 2,
            // Border color of Stick
            internalStrokeColor: '#000000',
            // External reference circonference width
            externalLineWidth: 2,
            //External reference circonference color
            externalStrokeColor: '#000000',
            // Sets the behavior of the stick
            autoReturnToCenter: true


            
    // ,function(stickData){
    //     if (stickData.xPosition < 64) {
    //         window.guis[0].gui.setValue(window.guis[0].gui.object._y+0.05);
    //     }else {
    //         window.guis[0].gui.setValue(window.guis[0].gui.object._y-0.05);
    //     }
     });
    //console.log(window.joystick.GetX(),window.joystick.GetY());
}
//Funcion que setea un pivot entre dos componentes del robot. Devuelve el pivot
function setPivot(item1,item2){
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
function getRobotItems(object_group, componentsArray){
        object_group.children.forEach(function (item){
            var temp_componentsArray = []
            if(item.type=="Group" && !item.name.includes("ur10")){
                componentsArray[item.name] = item
                temp_componentsArray = getRobotItems(item, componentsArray)
            }
            componentsArray = Object.assign({},componentsArray, temp_componentsArray)
        })
        return componentsArray
}