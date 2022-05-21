//Imports de librerias y dependencias
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { GUI } from 'dat.gui'
import { io } from "socket.io-client"
console.log(await Controller.search())
//Variables en el objeto window o contexto superior para poder acceder en cualquier punto del código
window.three = THREE
window.joystick = undefined
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
window.joystick = new JoyStick('joyDiv', {
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
window.room = ""
window.pivot1 = null
window.pivot2 = null
window.pivot3 = null
window.pivot4 = null
//Constantes
const joystick = document.getElementById("joystick")
const arrowUp = document.getElementById('arrowUp')
const arrowDown = document.getElementById('arrowDown')
const lookX = 0
const lookY = 35
const lookZ = 0
const socket = io("http://localhost:3300")
//Variable
let armPosition = 0
//Eventos de socket
socket.on('setRoom', (room) => {
    window.room = room
    document.getElementById('room').innerHTML += `<p>Room key: ${window.room}</p>`
})
socket.on('setRemote', (room) => {
    window.room = room
    window.remote = true
})
socket.on('armbase2', (bool) => {
    if (bool) {
        window.guis.armBase2.setValue(window.guis.armBase2.object._y + 0.09)
    } else {
        window.guis.armBase2.setValue(window.guis.armBase2.object._y - 0.09)
    }
})
socket.on('armbase3', (bool) => {
    if (bool) {
        window.guis.armBase3.setValue(window.guis.armBase3.object._z + 0.05)
    } else {
        window.guis.armBase3.setValue(window.guis.armBase3.object._z - 0.05)
    }
})
socket.on('armbase4', (bool) => {
    if (bool) {
        window.guis.armBase4.setValue(window.guis.armBase4.object._z + 0.05)
    } else {
        window.guis.armBase4.setValue(window.guis.armBase4.object._z - 0.05)
    }
})
socket.on('armbase5', (bool) => {
    if (bool) {
        window.guis.armBase5.setValue(window.guis.armBase5.object._z + 0.05)
    } else {
        window.guis.armBase5.setValue(window.guis.armBase5.object._z - 0.05)
    }
})
socket.on('subarm5', (bool) => {
    if (bool) {
        window.guis.subArm5.setValue(window.guis.subArm5.object._y + 0.09)
    } else {
        window.guis.subArm5.setValue(window.guis.subArm5.object._y - 0.09)
    }
})
//Listeners al joystick y el cambio de componente para versión móvil
joystick.addEventListener("touchmove", function () {
    moveArm(armPosition)
}, false)
arrowUp.addEventListener('click', () => {
    armPosition++
    if (armPosition > 5) {
        armPosition = 5
    }
    armSelected()
})
arrowDown.addEventListener('click', () => {
    armPosition--
    if (armPosition < 1) {
        armPosition = 1
    }
    armSelected()
})
//Listeners controller de pc 
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
            window.guis.armBase3.setValue(window.guis.armBase3.object._z + 0.05)
            break
        case "RIGHT_SHOULDER":
            window.guis.armBase3.setValue(window.guis.armBase3.object._z - 0.05)
            break
        case "LEFT_SHOULDER_BOTTOM":
            window.guis.armBase4.setValue(window.guis.armBase4.object._z + 0.05)
            break
        case "RIGHT_SHOULDER_BOTTOM":
            window.guis.armBase4.setValue(window.guis.armBase4.object._z - 0.05)
            break
        case "DPAD_LEFT":
            window.guis.armBase5.setValue(window.guis.armBase5.object._z + 0.05)
            break
        case "DPAD_RIGHT":
            window.guis.armBase5.setValue(window.guis.armBase5.object._z - 0.05)
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
                window.guis.armBase2.setValue(window.guis.armBase2.object._y + (stick.position.x * -1) * 0.2)
            } else {
                window.guis.armBase2.setValue(window.guis.armBase2.object._y - (stick.position.x) * 0.2)
            }
            break
        case "RIGHT_ANALOG_STICK":
            if (stick.position.x < 0) {
                window.guis.subArm5.setValue(window.guis.subArm5.object._y + (stick.position.x * -1) * 0.2)
            } else {
                window.guis.subArm5.setValue(window.guis.subArm5.object._y - (stick.position.x) * 0.2)
            }
            break
        default:
            break
    }
}, false)
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
        if (window.boxHelper) {
            window.boxHelper.update();
        }
    }
    //console.log(window.joystick.GetPosX())
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
        armPosition = 1
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
    armPosition = 1
}
//FUNCIONES PARA MODULARIZAR EL CÓDIGO
//Funcion para cambiar de modo movil a modo pc
function onWindowSize() {
    window.render.setSize(window.innerWidth, window.innerHeight)
    if (window.innerWidth < 926) {
        document.getElementById('controlls-container').style.display = "none"
        document.getElementById('joyDiv').style.display = "block"
        document.getElementById('mobileArrows').style.display = "flex"
        document.getElementById('pccontroller_button').style.display = "block"
    } else {
        document.getElementById('room').style.display = "block"
        document.getElementById('controlls-container').style.display = "block"
        document.getElementById('joyDiv').style.display = "none"
        document.getElementById('mobileArrows').style.display = "none"
        document.getElementById('pccontroller_button').style.display = "none"
    }
}
//Funcion para mover el brazo en la version movil y para cuando quieres controlar remotamente otro robot
function moveArm(armPosition) {
    switch (armPosition) {
        case 1:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('armbase2', true)
                } else {
                    window.guis.armBase2.setValue(window.guis.armBase2.object._y + 0.09)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('armbase2', false)
                } else {
                    window.guis.armBase2.setValue(window.guis.armBase2.object._y - 0.09)
                }
            }
            break
        case 2:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('armbase3', false)
                } else {
                    window.guis.armBase3.setValue(window.guis.armBase3.object._z - 0.05)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('armbase3', true)
                } else {
                    window.guis.armBase3.setValue(window.guis.armBase3.object._z + 0.05)
                }
            }
            break
        case 3:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('armbase4', false)
                } else {
                    window.guis.armBase4.setValue(window.guis.armBase4.object._z - 0.05)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('armbase4', true)
                } else {
                    window.guis.armBase4.setValue(window.guis.armBase4.object._z + 0.05)
                }
            }
            break
        case 4:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('armbase5', false)
                } else {
                    window.guis.armBase5.setValue(window.guis.armBase5.object._z - 0.05)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('armbase5', true)
                } else {
                    window.guis.armBase5.setValue(window.guis.armBase5.object._z + 0.05)
                }
            }
            break
        case 5:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('subarm5', true)
                } else {
                    window.guis.subArm5.setValue(window.guis.subArm5.object._y + 0.09)
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('subarm5', false)
                } else {
                    window.guis.subArm5.setValue(window.guis.subArm5.object._y - 0.09)
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
function armSelected() {
    removeBoxHelper()
    switch (armPosition) {
        case 1:
            window.robotActivePart = window.componentsArray.ArmBase2
            addBoxHelper()
            break
        case 2:
            window.robotActivePart = window.pivot1
            addBoxHelper()
            window.boxHelper.position.y -= 5
            break
        case 3:
            window.robotActivePart = window.pivot2
            addBoxHelper()
            window.boxHelper.position.y -= 29
            //Aqui hay que modificar alguna propiedad del box helper dependiendo del pivot anterior para que no se descoloque
            //window.boxHelper.rotation.z = window.pivot1.rotation.z
            break
        case 4:
            window.robotActivePart = window.pivot3
            addBoxHelper()
            window.boxHelper.position.y -= 52
            // window.boxHelper.rotation.z = window.pivot2.rotation.z
            break
        case 5:
            window.robotActivePart = window.pivot4
            addBoxHelper()
            window.boxHelper.position.y -= 57
            // window.boxHelper.rotation.z = window.pivot3.rotation.z + 6.5
            break
        default:
            break
    }
}
//Funcion que setea un pivot entre dos componentes del robot. Devuelve el pivot
function setPivot(item1, item2) {
    //  PARA VER LOS EJES DE LOS PIVOTES
    // let axes = new THREE.AxisHelper(105) 
    let pivot = new THREE.Object3D()
    // pivot.add(axes)
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
function removeBoxHelper() {
    if (window.robotActivePart) {
        window.robotActivePart.children.splice(window.robotActivePart.children.length - 1)
    }
}
function addBoxHelper() {
    if (window.robotActivePart) {
        var boxHelper = new window.three.BoxHelper(window.robotActivePart, 0x00ff00)
        boxHelper.matrixAutoUpdate = true
        window.robotActivePart.add(boxHelper)
        window.boxHelper = boxHelper
    }
}
onMainWindowSize()