import {socket} from '../helpers/socketConf'
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
let lastPositionStick = 0;

//Listeners al joystick y el cambio de componente para versión móvil
joystick.addEventListener("touchmove", function () {
    moveArm(armPosition);
}, false);

joystick.addEventListener("touchend", function () {
    lastPositionStick = 0;
}, false);

arrowUp.addEventListener('click', () => {
    console.log(armPosition)
    armPosition++;
    if (armPosition > 4) {
        armPosition = 4
    }
    armSelected();
});

arrowDown.addEventListener('click', () => {
    armPosition--
    if (armPosition < 0) {
        armPosition = 0
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
    if(!isCanRotateArm()){
        return;
    }
    switch (armPosition) {
        case 0:
            if (window.joystick.GetDir() === 'E') {
                if (window.remote) {
                    socket.emit('armbase2', true);
                } else {
                    window.guis.armBase2.setValue(window.guis.armBase2.object._y + 0.09);
                }
            }
            if (window.joystick.GetDir() === 'W') {
                if (window.remote) {
                    socket.emit('armbase2', false);
                } else {
                    window.guis.armBase2.setValue(window.guis.armBase2.object._y - 0.09);
                }
            }
            break
        case 1:
            if (window.joystick.GetDir() === 'E') {
                if (window.remote) {
                    socket.emit('armbase3', false);
                } else {
                    window.guis.armBase3.setValue(window.guis.armBase3.object._z - 0.05);
                }
            }
            if (window.joystick.GetDir() === 'W') {
                if (window.remote) {
                    socket.emit('armbase3', true);
                } else {
                    window.guis.armBase3.setValue(window.guis.armBase3.object._z + 0.05);
                }
            }
            break
        case 2:
            if (window.joystick.GetDir() === 'E') {
                if (window.remote) {
                    socket.emit('armbase4', false);
                } else {
                    window.guis.armBase4.setValue(window.guis.armBase4.object._z - 0.05);
                }
            }
            if (window.joystick.GetDir() === 'W') {
                if (window.remote) {
                    socket.emit('armbase4', true);
                } else {
                    window.guis.armBase4.setValue(window.guis.armBase4.object._z + 0.05);
                }
            }
            break
        case 3:
            if (window.joystick.GetDir() === 'E') {
                if (window.remote) {
                    socket.emit('armbase5', false);
                } else {
                    window.guis.armBase5.setValue(window.guis.armBase5.object._z - 0.05);
                }
            }
            if (window.joystick.GetDir() === 'W') {
                if (window.remote) {
                    socket.emit('armbase5', true);
                } else {
                    window.guis.armBase5.setValue(window.guis.armBase5.object._z + 0.05);
                }
            }
            break
        case 4:
            if (window.joystick.GetDir() === 'E') {
                if (window.remote) {
                    socket.emit('subarm5', true);
                } else {
                    window.guis.subArm5.setValue(window.guis.subArm5.object._y + 0.09);
                }
            }
            if (window.joystick.GetDir() === 'W') {
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
    lastPositionStick = window.joystick.GetX()
}
//Función para aplicar estilos a la lista
function armSelected() {
    var node = document.getElementById("arrowSelector");
    if (node.parentNode) {
        node.parentNode.style.color='black'
        node.parentNode.removeChild(node);
    }
    let items = document.getElementsByClassName('listItem')
    items[armPosition].innerHTML+='<i id="arrowSelector" class="fa-solid fa-arrow-left-long"></i>'
    items[armPosition].style.color = 'white'
}
function whilePressed() {
    console.log('eseeee');
    if (pressed) {
      moveArm(armPosition);
    }
}

function isCanRotateArm(){
    if(window.joystick.GetDir() === 'E' && parseInt(lastPositionStick) > 100){
        lastPositionStick = 100;
    }

    if(window.joystick.GetDir() === 'W' && parseInt(lastPositionStick) < -100){
        lastPositionStick = -100;
    }

    if(window.joystick.GetDir() === 'E' && parseInt(window.joystick.GetX()) >= parseInt(lastPositionStick)){
        return true;
    }

    if(window.joystick.GetDir() === 'W' && parseInt(window.joystick.GetX()) <= parseInt(lastPositionStick)){
        return true;
    }

    return false;
}
