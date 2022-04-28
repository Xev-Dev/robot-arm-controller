
import 'regenerator-runtime/runtime'
import * as THREE from 'three'
import { OrbitControls, MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { GUI } from 'dat.gui'
console.log(await Controller.search())

window.three = THREE;
window.robot_parts = [];
window.camera = null;
window.dae_obj = null;
window.boxHelper  = null;
window.robot = null;
window.rotate_z = false;
window.rotate_y = false;
window.rotate_x = false;
let look_x = 0;
let look_y = 35;
let look_z = 0;

//Funcion que detecta un mando y lo almacena en una variable
window.addEventListener('gc.controller.found', function() {
    var controllerPS4 = Controller.getController(0);
    window.a = controllerPS4.settings.list();
}, false);


// Funcion que detecta los botones del mando (Cruzeta,gatillos,botones)
window.addEventListener('gc.button.press', function(event) {
    var button = event.detail;
    console.log(button);
    buttonPressed(event)

}, false);

// Funcion que detecta los joysticks
window.addEventListener('gc.analog.start', function(event) {
    var stick = event.detail;
    console.log(stick);
}, false);

////EJEMPLO DEL POL THREE JS 
(function () {
    window.rotate_z= false; 
    window.rotate_y = false; 
    window.rotate_x = false;
    //Creamos punto de luz 
    var pl = new THREE.PointLight(0xffffff);
    pl.position.set(30, 60, 40);
    const sphereSize = 1;
    //Creamos un helper para saber donde se encuentra el punto de luz 
    const pointLightHelper = new THREE.PointLightHelper( pl, sphereSize, 0x000000 );
    //Creamos escena
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('white');
    //Añadimos a la escena el punto de luz y el helper para verla
    scene.add(pl);
    scene.add( pointLightHelper );
    //Creamos una camara
    var camera = new THREE.PerspectiveCamera(35, 840 / 680, .1, 500 );
    //Configuramos la camara
    camera.position.set(3, 0.5, 3);
    camera.position.set(1.5, 3, 5);
    camera.position.set(50, 100, 135);
    camera.lookAt(look_x, look_y, look_z);
    //Añadimos la camara a la escena
    scene.add(camera);
    window.camera = camera;
    //3 ejes helper para ayudarnos a situar el brazo robotico
    var gridXZ = new THREE.GridHelper(100, 50, new THREE.Color(0x006600), new THREE.Color(0x006600));
    gridXZ.position.x = 50;
    gridXZ.position.z = 50;
    scene.add(gridXZ);

    var gridXY = new THREE.GridHelper(100, 50, new THREE.Color(0x000066), new THREE.Color(0x000066));
    gridXY.rotation.x = Math.PI / 2;
    gridXY.position.x = 50;
    gridXY.position.y = 50;
    scene.add(gridXY);

    var gridYZ = new THREE.GridHelper(100, 50  , new THREE.Color(0x660000), new THREE.Color(0x660000));
    gridYZ.rotation.z = Math.PI / 2;
    gridYZ.position.y = 50;
    gridYZ.position.z = 50;
    scene.add(gridYZ);

    //AXES HELPER
    var axes = new THREE.AxisHelper(25);
    scene.add(axes);

    //Preparamos un render
    var renderer = new THREE.WebGLRenderer({antialias:true});
    //Seteamos el tamaño del render que queramos
    renderer.setSize(1140, 770);
    //Introducimos nuestro objeto render en el DOM 
    document.getElementById('world').appendChild(renderer.domElement);
    //Le indicamos que renderice la escena y camara creadas con anterioridad
    renderer.render(scene, camera);
    var controls = new MapControls(camera, renderer.domElement);
    controls.target.set(look_x, look_y, look_z);
    controls.update();
    // var controls = new THREE.OrbitControls(camera, renderer.domElement);

    //Creamos un loop con una funcion recursiva
    var loop = function () {
        if(window.rotate_z == true){
            window.robot.children[0].rotation.z+=0.01;
        }
        if(window.rotate_y == true){
            window.robot.children[0].rotation.y+=0.01;
        }
        if(window.rotate_x == true){
            window.robot.children[0].rotation.x+=0.01;
        }
        requestAnimationFrame(loop);
        renderer.render(scene, camera);
        controls.update();
        if(window.boxHelper){
            window.boxHelper.update();
        }
    };
    // CREATE A COLLADALOADER INSTANCE IMPORTANDO EL MODELO DE SKETCHUP
    // var loader = new THREE.ColladaLoader();
    var loader = new ColladaLoader();
    // CALL THE LOAD METHOD, PASS THE ABSOLUTE OR RELATIVE PATH
    // TO THE *.DAE FILE AS THE FIRST ARGUMENT, AND A DONE CALLBACK
    // AS THE SECOND ARGUMENT
    // loader.load("sketchup2three.dae", function (result) {
    //loader.load("threejs.dae", function (result) {
    //Cargamos el modelo mediante .load (url,callback(resultado))
    loader.load("./models/ur10_2.dae", function (result) {
        // adding the child that I want to the scene
        // scene.add(result.scene.children[2]);
        scene.add(result.scene);
        window.robot = result.scene;
        window.robot.position.x=10;
        window.robot.position.z= 10;
        window.dae_obj = result;
        window.dae_obj.library.visualScenes.ID2.build.quaternion.x=0;

//         var bBox = new THREE.Box3().setFromObject(result.scene);
//         var height = bBox.getSize().y;
// var dist = height / (2 * Math.tan(camera.fov * Math.PI / 360));
// var pos = result.scene.position;
       // var box = new THREE.Box3().setFromObject( result );
       // console.log( box.min, box.max, box.getSize() );
       // window.robot.scale.set(0.3,0.3,0.3)
       // window.robot.position.set(12.5,0,12.5)
        // var boundingBox = new window.three.Box3().setFromObject(window.robot);
        // const helper = new window.three.Box3Helper( boundingBox, 0xffff00 );
        // const helper2 = new window.three.BoxHelper( window.robot, 0xff0000 );
        // window.robot.add(helper);
        // window.robot.add(helper2);

        // start the app loop
        print_model_information();
        loop();
    });
 
}
    ());

    function print_model_information(){
        var panel = document.getElementById("panel");
        // panel.innerHTML="Works!!";
        panel.innerHTML="";
        var componentsArray = [];
       componentsArray = recursive_robot_print(window.robot, componentsArray);
        window.robot_parts = componentsArray;
       console.log(componentsArray);

        for (var key in componentsArray) {
            if (componentsArray.hasOwnProperty(key)){
                var item = componentsArray[key];
                panel.innerHTML+="<div class='robot_part_panel "+item.name+"' data='"+item.name+"'>"+item.name+"</div>";
            }
        }
        var robotParts_dom = document.querySelectorAll(".robot_part_panel ")
        console.log(robotParts_dom)
        robotParts_dom.forEach(part => {
            part.addEventListener('click', () => {
                robotParts_dom.forEach(removeHighlight);
                //TODO: delete BoxHelper
                removeBoxHelper();
                window.robotActivePart = part.getAttribute("data")
                console.log(part.getAttribute("data"));
                part.classList.toggle("marked");
                //TODO: add BoxHelper
                addBoxHelper();
            }
          );
        });
 
    }

function removeBoxHelper(){
    if(window.robotActivePart){
        console.log("remove =>"+robotActivePart);
        window.robot.remove(window.boxHelper);
    }
    console.log("REMOVE BOX HELPER TODO");
}

function addBoxHelper(){
    if(window.robotActivePart){
        console.log("add =>"+robotActivePart);
        var boxHelper = new window.three.BoxHelper(window.robot_parts[window.robotActivePart] , 0x00ff00 );
        boxHelper.matrixAutoUpdate=true;
        boxHelper.position.x=-10;
        boxHelper.position.z=-10;
        window.robot.add(boxHelper);
        window.boxHelper = boxHelper;
    }
}

function removeHighlight(element){
    element.classList.remove("marked");
}

function recursive_robot_print(object_group, componentsArray){
        object_group.children.forEach(function (item){
            var temp_componentsArray = [];
            // if(item.type=="Group"  ){
            if(item.type=="Group" && !item.name.includes("ur10")){
                if(item.name.includes("SubArm") || item.name === 'MainArm'){
                    const gui = new GUI()
                    const folder = gui.addFolder(item.name)
                    item.name.includes("SubArm") && item.name !== 'SubArm5' ? folder.add(item.rotation, 'z', 0, Math.PI * 2) : folder.add(item.rotation, 'y', 0, Math.PI * 2)  
                    folder.open()
                }
                componentsArray[item.name] = item;
                temp_componentsArray = recursive_robot_print(item, componentsArray);
            }
            componentsArray = Object.assign({},componentsArray, temp_componentsArray);
        });
        return componentsArray;
}