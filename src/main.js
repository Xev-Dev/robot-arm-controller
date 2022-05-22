//Imports de librerias y dependencias
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { GUI } from 'dat.gui'
import {socket} from '../helpers/socketConf'
//Variables en el objeto window o contexto superior para poder acceder en cualquier punto del código
window.three = THREE
window.remote = false
window.componentsArray = {}
window.boxHelper = null
window.robotActivePart = null
window.guis = {
    'armBase2': undefined,
    'armBase3': undefined,
    'armBase4': undefined,
    'armBase5': undefined,
    'subArm5': undefined
}
window.room = ""
window.pivot1 = null
window.pivot2 = null
window.pivot3 = null
window.pivot4 = null
window.mobile = false
//Constantes
const lookX = 0
const lookY = 35
const lookZ = 0
//Handle mobile device or pc device
if("ontouchstart" in document.documentElement){
    window.mobile = true
    document.getElementById('pccontroller_button').style.display = "block"
}else{
    window.mobile = false
    document.getElementById('pccontroller_button').style.display = "none"
}
//FUNCIONES BOTONES DOM
////Funcion que renderiza el mundo 3d, prepara el escenario y el modelo 
window.setWorld = function () {
    //Creamos punto de luz 
    var pl = new THREE.PointLight(0xffffff)
    document.getElementById('room').style.display = "block"
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
    camera.lookAt(lookX, lookY, lookZ)
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
    controls.target.set(lookX, lookY, lookZ)
    //Creamos un loop con una funcion recursiva
    var loop = function () {
        requestAnimationFrame(loop)
        renderer.render(scene, camera)
        controls.update()
    }
    //Cargamos nuestro modelo 3d y disponemos de una función de callback con el resultado.
    var loader = new ColladaLoader()
    loader.load("./models/ur10_2.dae", function (result) {
        window.componentsArray = getRobotItems(result.scene, componentsArray)
        scene.add(window.componentsArray.ArmBase)
        scene.add(window.componentsArray.ArmBase2)
        window.pivot1 = setPivot(window.componentsArray.ArmBase2, window.componentsArray.ArmBase3)
        window.pivot1.position.y += 5
        window.componentsArray.ArmBase3.position.y -= 5
        window.pivot2 = setPivot(window.componentsArray.ArmBase3, window.componentsArray.ArmBase4)
        window.pivot2.position.y += 29
        window.componentsArray.ArmBase4.position.y -= 29
        window.pivot3 = setPivot(window.componentsArray.ArmBase4, window.componentsArray.ArmBase5)
        window.pivot3.position.y += 52
        window.componentsArray.ArmBase5.position.y -= 52
        window.pivot4 = setPivot(window.componentsArray.ArmBase5, window.componentsArray.SubArm5)
        window.pivot4.position.y += 57
        window.componentsArray.SubArm5.position.y -= 57
        window.pivot4.position.z -= 6.5
        //-2.8, 2.8
        window.componentsArray.SubArm5.position.z += 6.5
        //Aqui se añaden las partes del brazo al gui y se establecen las direcciones de sus movimientos y limitaciones a la hora de girar
        const gui = new GUI()
        window.guis.armBase2 = gui.add(window.componentsArray.ArmBase2.rotation, 'y', (Math.PI * 2 * -1), (Math.PI * 2)).name('ArmBase2')
        window.guis.armBase3 = gui.add(window.pivot1.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) / 2 - 0.3).name('Armbase3')
        window.guis.armBase4 = gui.add(window.pivot2.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) / 2 - 0.3).name('Armbase4')
        window.guis.armBase5 = gui.add(window.pivot3.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) - 0.3).name('Armbase5')
        window.guis.subArm5 = gui.add(window.pivot4.rotation, 'y', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) - 0.3).name('SubArm5')
        window.armPosition = 1
        loop()
    })
}
//Funcion para ocultar los botones y mostrar el formulario para el modo remoto
window.hiddenButtons = function () {
    document.getElementById('controller_button').style.display = 'none'
    document.getElementById('pccontroller_button').style.display = 'none'
    document.getElementById('roomKey').style.display = 'flex'
}
//Funcion para entrar al modo de control remoto
window.setWorldController = function () {
    socket.emit('joinRoom', document.getElementById('roomInput').value)
    document.getElementById('menu').style.display = 'none'
    document.getElementById('mobileArrows').style.display = 'flex'
    document.getElementById('joyDiv').style.display = 'block'
    document.getElementById('mobileBackground').style.display = 'block'
    window.armPosition = 1
}
//FUNCIONES PARA MODULARIZAR EL CÓDIGO
//Funcion para gestionar el resize en pc y la aparicion del joystick en el movil 
function onWindowSize() {
    window.render.setSize(window.innerWidth, window.innerHeight)
    if(!window.mobile){
        if (window.innerWidth < 926) {
            document.getElementById('controlls-container').style.display = "none"
        } else {
            document.getElementById('controlls-container').style.display = "block"
        }
    }else{
        document.getElementById('joyDiv').style.display = "block"
        document.getElementById('mobileArrows').style.display = "flex"
    }
}
//Funcion que setea un pivot entre dos componentes del robot. Devuelve el pivot
function setPivot(item1, item2) {
    // let material = new THREE.Color('green');
    //  PARA VER LOS EJES DE LOS PIVOTES
    // let axes = new THREE.AxisHelper(105) 
    let pivot = new THREE.Object3D()
    // pivot.add(axes)
    // item1.material = material;
    // pivot.material = material;
    item1.add(pivot)
    pivot.add(item2)
    return pivot
}
//Funcion recursiva a la cual le pasamos el robot y a si misma. 
//Devuelve un objeto con objetos dentro de tipo grupo
function getRobotItems(object_group, componentsArray) {
    // let material = new THREE.Color('green');
    object_group.children.forEach(function (item) {
        var temp_componentsArray = []
        if (item.type == "Group" && !item.name.includes("ur10")) {
            // item.material = material;
            // console.log(item);
            componentsArray[item.name] = item
            temp_componentsArray = getRobotItems(item, componentsArray)
        }
        componentsArray = Object.assign({}, componentsArray, temp_componentsArray)
    })
    return componentsArray
}
//Funcion para volver al menu principal y salir del formulario de control remoto
window.goBack = function(){
    document.getElementById('controller_button').style.display = 'block'
    document.getElementById('pccontroller_button').style.display = 'block'
    document.getElementById('roomKey').style.display = 'none'
}