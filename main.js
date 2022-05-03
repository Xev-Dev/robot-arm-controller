
import 'regenerator-runtime/runtime'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { GUI } from 'dat.gui'
console.log(await Controller.search())
window.three = THREE
window.camera = null
let look_x = 0
let look_y = 35
let look_z = 0

//Funcion que detecta un mando y lo almacena en una variable
window.addEventListener('gc.controller.found', function() {
    var controllerPS4 = Controller.getController(0)
    window.a = controllerPS4.settings.list()
}, false)

// Funcion que detecta los botones del mando (Cruzeta,gatillos,botones)
window.addEventListener('gc.button.press', function(event) {
    var button = event.detail
    console.log(button)
    switch (button.name) {
        case "LEFT_SHOULDER":
            window.armbase3.setValue(window.armbase3.object._z+1)
            break;
        case "RIGHT_SHOULDER":
            window.armbase3.setValue(window.armbase3.object._z-1)
            break;
        case "LEFT_SHOULDER_BOTTOM":
            window.armbase4.setValue(window.armbase4.object._z+1)
            break;
        case "RIGHT_SHOULDER_BOTTOM":
            window.armbase4.setValue(window.armbase4.object._z-1)
            break;
        case "DPAD_LEFT":
            window.armbase5.setValue(window.armbase5.object._z+1)
            break;
        case "DPAD_RIGHT":
            window.armbase5.setValue(window.armbase5.object._z-1)
            break;
        default:
            break;
    }
}, false)

// Funcion que detecta los joysticks
window.addEventListener('gc.analog.start', function(event) {
    var stick = event.detail
    console.log(stick)
    switch (stick.name) {
        case "LEFT_ANALOG_STICK":
            if (stick.position.x < 0) {
                window.armbase2.setValue(window.armbase2.object._y+1) 
            } else {
                window.armbase2.setValue(window.armbase2.object._y-1)
            } 
            break;
        case "RIGHT_ANALOG_STICK":
            if (stick.position.x < 0) {
                window.subarm5.setValue(window.subarm5.object._y+1) 
            } else {
                window.subarm5.setValue(window.subarm5.object._y-1)
            } 
            break;
        default:
            break;
    }
}, false)

////THREE JS SUPER FUNCTION
(function () {
    //Creamos punto de luz 
    var pl = new THREE.PointLight(0xffffff)
    pl.position.set(30, 60, 40)
    const sphereSize = 1
    //Creamos un helper para saber donde se encuentra el punto de luz 
    const pointLightHelper = new THREE.PointLightHelper( pl, sphereSize, 0x000000 )
    //Creamos escena
    var scene = new THREE.Scene()
    scene.background = new THREE.Color('white')
    //Añadimos a la escena el punto de luz y el helper para verla
    scene.add(pl)
    scene.add(pointLightHelper )
    //Creamos una camara
    var camera = new THREE.PerspectiveCamera(35, 840 / 680, .1, 500 )
    //Configuramos la camara
    camera.position.set(3, 0.5, 3)
    camera.position.set(1.5, 3, 5)
    camera.position.set(50, 100, 135)
    camera.lookAt(look_x, look_y, look_z)
    //Añadimos la camara a la escena
    scene.add(camera)
    window.camera = camera
    //Preparamos un render
    var renderer = new THREE.WebGLRenderer({antialias:true})
    //Seteamos el tamaño del render que queramos
    renderer.setSize(1140, 770)
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
    //Cargamos nuestro modelo 3d y disponemos de una función de callback con el resultado.
    var loader = new ColladaLoader()
    loader.load("./models/ur10_2.dae", function (result) {
        let componentsArray = []
        componentsArray = getRobotItems(result.scene, componentsArray)
        console.log(componentsArray)
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
        const gui = new GUI()
        window.armbase2 = gui.add(componentsArray.ArmBase2.rotation, 'y',(Math.PI*2*-1)/2, (Math.PI*2)/2).name('ArmBase2');
        window.armbase3 = gui.add(pivot1.rotation, 'z',(Math.PI*2*-1)/2, (Math.PI*2)/2).name('Armbase3')
        window.armbase4 = gui.add(pivot2.rotation, 'z',(Math.PI*2*-1)/2, (Math.PI*2)/2).name('Armbase4')
        window.armbase5 = gui.add(pivot3.rotation, 'z',(Math.PI*2*-1)/2, (Math.PI*2)/2).name('Armbase5')
        window.subarm5 = gui.add(pivot4.rotation, 'y',(Math.PI*2*-1)/2, (Math.PI*2)/2).name('SubArm5')
        
        loop()
    })  
 }())
//Funcion que setea un pivot entre dos componentes del robot. Devuelve el pivot
function setPivot(item1,item2){
    //  PARA VER LOS EJES DE LOS PIVOTES
    // let axes = new THREE.AxisHelper(105) 
    let pivot = new THREE.Object3D();
    // pivot.add(axes)
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