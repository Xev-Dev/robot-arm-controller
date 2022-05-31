//Listeners controller de pc 
console.log(await Controller.search())
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
            if (window.record) {
                window.change = ["armBase3", 0.05]
                window.movement.push(window.change)
            }
            break
        case "RIGHT_SHOULDER":
            window.guis.armBase3.setValue(window.guis.armBase3.object._z - 0.05)
            if (window.record) {
                window.change = ["armBase3", -0.05]
                window.movement.push(window.change)
            }
            break
        case "LEFT_SHOULDER_BOTTOM":
            window.guis.armBase4.setValue(window.guis.armBase4.object._z + 0.05)
            if (window.record) {
                window.change = ["armBase4", 0.05]
                window.movement.push(window.change)
            }
            break
        case "RIGHT_SHOULDER_BOTTOM":
            window.guis.armBase4.setValue(window.guis.armBase4.object._z - 0.05)
            if (window.record) {
                window.change = ["armBase4", -0.05]
                window.movement.push(window.change)

            }
            break
        case "DPAD_LEFT":
            window.guis.armBase5.setValue(window.guis.armBase5.object._z + 0.05)
            if (window.record) {
                window.change = ["armBase5", 0.05]
                window.movement.push(window.change)
            }
            break
        case "DPAD_RIGHT":
            window.guis.armBase5.setValue(window.guis.armBase5.object._z - 0.05)
            if (window.record) {
                window.change = ["armBase5", -0.05]
                window.movement.push(window.change)
            }
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
                if (window.record) {
                    window.change = ["armBase2", (stick.position.x * -1) * 0.2]
                    window.movement.push(window.change)
                }
            } else {
                window.guis.armBase2.setValue(window.guis.armBase2.object._y - (stick.position.x) * 0.2)
                if (window.record) {
                    window.change = ["armBase2", -Math.abs((stick.position.x * -1) * 0.2)]
                    window.movement.push(window.change)
                }
            }
            break
        case "RIGHT_ANALOG_STICK":
            if (stick.position.x < 0) {
                window.guis.subArm5.setValue(window.guis.subArm5.object._y + (stick.position.x * -1) * 0.2)
                if (window.record) {
                    window.change = ["subArm5", (stick.position.x * -1) * 0.2]
                    window.movement.push(window.change)
                }
            } else {
                window.guis.subArm5.setValue(window.guis.subArm5.object._y - (stick.position.x) * 0.2)
                if (window.record) {
                    window.change = ["subArm5", -Math.abs((stick.position.x * -1) * 0.2)]
                    window.movement.push(window.change)
                }
            }
            break
        default:
            break
    }
}, false)