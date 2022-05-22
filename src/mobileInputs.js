//Creamos el componente joystick
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
});

const joystick = document.getElementById("joystick");
const arrowUp = document.getElementById('arrowUp');
const arrowDown = document.getElementById('arrowDown');
window.armPosition = 0;
let pressed= false;
let interval;

//Listeners al joystick y el cambio de componente para versión móvil
joystick.addEventListener("touchmove", function () {
    pressed= true;
    interval = setInterval(whilePressed(),300);
}, false);

joystick.addEventListener("touchend", function () {
    pressed= false;
}, false);

arrowUp.addEventListener('click', () => {
    armPosition++;
    if (armPosition > 5) {
        armPosition = 5
    }
    armSelected();
});

arrowDown.addEventListener('click', () => {
    armPosition--
    if (armPosition < 1) {
        armPosition = 1
    }
    armSelected();
});

window.addEventListener("orientationchange", function() {
    if(window.orientation === 0){
        //vettical
    }

    //horizontal
    alert(window.orientation);
  }, false);

//Funcion para mover el brazo en la version movil y para cuando quieres controlar remotamente otro robot
function moveArm(armPosition) {
    switch (armPosition) {
        case 1:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('armbase2', true);
                } else {
                    window.guis.armBase2.setValue(window.guis.armBase2.object._y + 0.09);
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('armbase2', false);
                } else {
                    window.guis.armBase2.setValue(window.guis.armBase2.object._y - 0.09);
                }
            }
            break
        case 2:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('armbase3', false);
                } else {
                    window.guis.armBase3.setValue(window.guis.armBase3.object._z - 0.05);
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('armbase3', true);
                } else {
                    window.guis.armBase3.setValue(window.guis.armBase3.object._z + 0.05);
                }
            }
            break
        case 3:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('armbase4', false);
                } else {
                    window.guis.armBase4.setValue(window.guis.armBase4.object._z - 0.05);
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('armbase4', true);
                } else {
                    window.guis.armBase4.setValue(window.guis.armBase4.object._z + 0.05);
                }
            }
            break
        case 4:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('armbase5', false);
                } else {
                    window.guis.armBase5.setValue(window.guis.armBase5.object._z - 0.05);
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('armbase5', true);
                } else {
                    window.guis.armBase5.setValue(window.guis.armBase5.object._z + 0.05);
                }
            }
            break
        case 5:
            if (window.joystick.GetDir() === 'E' && window.joystick.GetX() >= 0 && window.joystick.GetX() <= 114) {
                if (window.remote) {
                    socket.emit('subarm5', true);
                } else {
                    window.guis.subArm5.setValue(window.guis.subArm5.object._y + 0.09);
                }
            }
            if (window.joystick.GetDir() === 'W' && window.joystick.GetX() >= -114 && window.joystick.GetX() <= -0) {
                if (window.remote) {
                    socket.emit('subarm5', false);
                } else {
                    window.guis.subArm5.setValue(window.guis.subArm5.object._y - 0.09);
                }
            }
            break
        default:
            break
    }
}

//Función para saber que eje tenemos seleccionado
function armSelected() {
    // removeBoxHelper()
    switch (armPosition) {
        case 1:
            window.robotActivePart = window.componentsArray.ArmBase2
            addBoxHelper()
            break
        case 2:
            window.robotActivePart = window.pivot1
            addBoxHelper()
            // window.boxHelper.position.y -= 5
            break
        case 3:
            window.robotActivePart = window.pivot2
            addBoxHelper()
            // window.boxHelper.position.y -= 29
            //Aqui hay que modificar alguna propiedad del box helper dependiendo del pivot anterior para que no se descoloque
            //window.boxHelper.rotation.z = window.pivot1.rotation.z
            break
        case 4:
            window.robotActivePart = window.pivot3
            addBoxHelper()
            // window.boxHelper.position.y -= 52
            // window.boxHelper.rotation.z = window.pivot2.rotation.z
            break
        case 5:
            window.robotActivePart = window.pivot4
            addBoxHelper()
            // window.boxHelper.position.y -= 57
            // window.boxHelper.rotation.z = window.pivot3.rotation.z + 6.5
            break
        default:
            break
    }
}
function removeBoxHelper() {
    if (window.robotActivePart) {
        window.robotActivePart.children.splice(window.robotActivePart.children.length - 1)
    }
}
function addBoxHelper() {
    if (window.robotActivePart) {
        // window.robotActivePart.material.color = "f60491";
        console.log(window.robotActivePart);
        // var boxHelper = new window.three.BoxHelper(window.robotActivePart, 0x00ff00)
        // boxHelper.matrixAutoUpdate = true
        // window.robotActivePart.add(boxHelper)
        // window.boxHelper = boxHelper
    }
}

function whilePressed() {
    if (pressed) {
      moveArm(armPosition);
    } else {
      clearInterval(interval);
    }
  }