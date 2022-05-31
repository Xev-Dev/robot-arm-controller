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
window.gui = null
window.hideGui = false
window.recordId 
window.lastRecord 
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
window.login = true
window.logged = (JSON.parse(localStorage.getItem('logged'))).id
window.record = false
window.change = undefined
window.movement = []
window.positions = []
window.records = []
//Constantes
const lookX = 0
const lookY = 35
const lookZ = 0
const backend = 'http://localhost:3600'
console.log(logged)
//Handle mobile device or pc device
if("ontouchstart" in document.documentElement){
    window.mobile = true
    document.getElementById('pccontroller_button').style.display = "block"
}else{
    window.mobile = false
    document.getElementById('pccontroller_button').style.display = "none"
}
if(window.logged){
    document.getElementById('login').style.display = "none"
    document.getElementById('register').style.display='none'
}else{
    document.getElementById('menu').style.display = "none"
    document.getElementById('register').style.display='none'
}

    
//FUNCIONES BOTONES DOM
////Funcion que renderiza el mundo 3d, prepara el escenario y el modelo 
window.setWorld = async function () {
    await getRecord()
    resetRecordList()
    setRecordList()
    //Creamos punto de luz 
    var pl = new THREE.PointLight(0xffffff)
    document.getElementById('room').style.display = "block"
    document.getElementById('record').style.display = "block"
    document.getElementById('menu').style.display = 'none'
    document.getElementById('back').style.display = 'block'
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
        //Funcion para setear la lista de componentes
        if(window.mobile){
            displayList()
        }
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
        if(!window.hideGui){
            window.gui = new GUI()
            window.guis.subArm5 = window.gui.add(window.pivot4.rotation, 'y', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) - 0.3).name('Head')
            window.guis.armBase5 = window.gui.add(window.pivot3.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) - 0.3).name('Arm3')
            window.guis.armBase4 = window.gui.add(window.pivot2.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) / 2 - 0.3).name('Arm2')
            window.guis.armBase3 = window.gui.add(window.pivot1.rotation, 'z', (Math.PI * 2 * -1) / 2 + 0.3, (Math.PI * 2) / 2 - 0.3).name('Arm1')
            window.guis.armBase2 = window.gui.add(window.componentsArray.ArmBase2.rotation, 'y', (Math.PI * 2 * -1), (Math.PI * 2)).name('Base')  
            if(window.mobile){
                GUI.toggleHide();
                window.hideGui = true
            }    
        }
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
        document.getElementById('room').style.display = "none"
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
window.tryLogin = async function(){
    const form = {
        username:document.getElementById('uname').value,
        password:document.getElementById('psw').value
    }
    const res = await fetch(`${backend}/auth/login`,{
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify(form),
        method:'POST'
    })
    const json = await res.json()
    if(json.logged){
        localStorage.setItem('logged',JSON.stringify(json.logged))
        document.getElementById('login').style.display = 'none'
        document.getElementById('menu').style.display = 'flex'
        window.logged = (JSON.parse(localStorage.getItem('logged'))).id
    }else{
        console.log('failed to login')
    }   
}
window.logout = function(){
    localStorage.removeItem('logged')
    document.getElementById('menu').style.display = 'none'
    document.getElementById('login').style.display = 'block'
}
window.toggleView = function(){
    console.log(window.login)
    if(window.login){
        document.getElementById('login').style.display='none'
        document.getElementById('register').style.display='block'
        window.login = false
    }else{
        document.getElementById('register').style.display='none'
        document.getElementById('login').style.display='block'
        window.login = true
    }
}
window.backToMenu = function(){
    document.getElementById('menu').style.display = 'flex'
    document.getElementById('mobileArrows').style.display = 'none'
    document.getElementById('joyDiv').style.display = 'none'
    document.getElementById('mobileBackground').style.display = 'none'
    document.getElementById('roomKey').style.display = 'none'
    document.getElementById('controlls-container').style.display = 'none'
    document.getElementById('record').style.display = 'none'
    document.getElementById('back').style.display = 'none'
    document.getElementById('positionList').innerHTML = '';
    window.armPosition = 0
    window.gui.destroy()
}
window.tryRegister = async function(){
    const form = {
        username:document.getElementById('username').value,
        password:document.getElementById('password').value,
        password_confirmation:document.getElementById('passwordrep').value
    }
    const res = await fetch(`${backend}/auth/register`,{
        headers:{"Content-Type": "application/json"},
        body:JSON.stringify(form),
        method:'POST'
    })
    const json = await res.json()
    if(json.registered){
        console.log('registered!')
        window.toggleView()
    }else{
        console.log('failed to register')
    }   
}
function displayList(){
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
window.startRecord = async function () {
    if (window.record) {
        window.record = false
        console.log("Grabacion detenida");
        console.log(window.movement);
        console.log(window.positions);
    } else{
        window.record = true;
        console.log("Grabacion empezada");
        const postRecord = await fetch(`${backend}/robot/registerRecord`,{
            headers:{"Content-Type":"application/json"},
            method:"POST",
            body:localStorage.getItem('logged')
        })
        const postRecordJson = await postRecord.json()
        if(postRecordJson.error){
            console.log(postRecordJson.error)
        }else{
            console.log('new record registered succesfully')
            await getRecord()
            resetRecordList()
            setRecordList()
            console.log(window.lastRecord)
        }
        window.positions={
            'base':window.guis.armBase2.object._y,
            'arm1':window.guis.armBase3.object._z,
            'arm2':window.guis.armBase4.object._z,
            'arm3':window.guis.armBase5.object._z,
            'head':window.guis.subArm5.object._y,
            'id_record':window.lastRecord
        }
        const postPosition = await fetch(`${backend}/robot/registerPosition`,{
            headers:{"Content-Type":"application/json"},
            method:"POST",
            body:JSON.stringify(window.positions)
        })
        const postPositionJson = await postPosition.json()
        console.log(postPositionJson)
    }
}
async function getRecord(){
    const getRecord = await fetch(`${backend}/robot/getRecord/${window.logged}`,{
        headers:{"Content-Type":"application/json"},
        method:"GET",
    })
    window.records = await getRecord.json()
    console.log(window.records)
}
function resetRecordList(){
    document.getElementById('recordList').innerHTML=''
}
function setRecordList(){
    window.records.forEach((el,index) => {
        document.getElementById('recordList').innerHTML+=`<p class="record">Record ${el.id}</p>`
        if(index===window.records.length - 1){
            window.lastRecord = el.id
        }
    })
}
//Funciones para reproducir movimientos 
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.play = async function () {
    for (let i = 0; i < window.movement.length; i++) {
        switch (window.movement[i][0]) {
            case "base":
                window.guis.armBase2.setValue(window.guis.armBase2.object._y + window.movement[i][1])
                break;
            case "arm1":
                window.guis.armBase3.setValue(window.guis.armBase3.object._z + window.movement[i][1])
                break;
            case "arm2":
                window.guis.armBase4.setValue(window.guis.armBase4.object._z + window.movement[i][1])
                break;
            case "arm3":
                window.guis.armBase5.setValue(window.guis.armBase5.object._z + window.movement[i][1])
                break;
            case "head":
                window.guis.subArm5.setValue(window.guis.subArm5.object._y + window.movement[i][1])
                break;
            default:
                break;
        }
        await sleep(5)
    }
    console.log('Done');
}

const record = document.getElementById('record');

record.addEventListener('click', function handleClick() {
    if (record.textContent == 'Stop') {
        record.textContent = 'Record'
    } else {
        record.textContent = 'Stop';
    }
})