import { io } from "socket.io-client"
const socket = io("wss://node.dpadrobot.es")
export {socket}