import * as THREE from 'three'
console.log(await Controller.search())


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



