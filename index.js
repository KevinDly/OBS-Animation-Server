import { WebSocketServer, WebSocket } from "ws"
import * as http from 'http'
import express from "express"
import cors from "cors"
import * as child from "child_process"
import { connectTwitch, getTwitchEmotes } from "./api/twitchapi.js"
import { get7TVEmotes } from "./api/7tvapi.js"
import 'dotenv/config'

const AYAYA_URL = "https://play-lh.googleusercontent.com/kTkV3EWtNTDVCzRnUdbI5KdXm6Io-IM4Fb3mDcmX9-EOCEXJxnAxaph_leEn6m61E0I"
const socketCleanupTimerinMilis = 30000
const port = 2999
const app = express()

app.use(cors({
    origin: true
}))

app.use(express.static("public"))
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

const emotes = {}

console.log("Server initialized")
let displaySockets = []
let controllerSockets = []

console.log("Connecting to APIs")
connectAPIs(() => {
    initializeWSS()
})

//Function that checks if any websockets are closed.
//If they are then they are not appended onto the new list.
//controllerSockets is then updated.
function checkWebsockets() {
    console.log("Checking websockets")
    let updatedSockets = []
    controllerSockets.forEach((socket) => {
        if(socket.readyState != WebSocket.CLOSED) {
            updatedSockets.push(socket)
        }
    })

    controllerSockets = updatedSockets
    console.log(controllerSockets.length)
}

function initializeWSS() {
    console.log(emotes)

    //Enable unused socket cleanup.
    setInterval(() => {
        checkWebsockets()
    }, socketCleanupTimerinMilis)

    //Enable socket events.
    setupSockets()
}

async function setupSockets() {
    wss.on("connection", (socket) => {
        console.log("Connection recieved.")
        console.log(socket.protocol)

        //TODO: Remove unused connections.
        switch(socket.protocol){
            case("streamDisplay"):
                displaySockets.push(socket)
                console.log(displaySockets)
                break;
            case("streamerController"):
                controllerSockets.push(socket)
                console.log(controllerSockets.length)
                const data = {
                    type: "recievedEmotes",
                    data: emotes
                }
                socket.send(JSON.stringify(data))
                controllerSocketConnection(socket)
                break;
        }

    })

    server.listen(port, () => {
        console.log(`Server started on port ${server.address().port}`);
    })
}

async function controllerSocketConnection(socket) {
    socket.on("message", (message) => {
        let newMessage = JSON.parse(message)
        const type = newMessage.type
        const data = newMessage.data
    
        console.log("Recieved message.")
        console.log(`%s`, newMessage)
        console.log("type", type)
        console.log("data", data)
        //TODO: Put data
        switch(type) {
            case "executeAnimation":
                displaySockets.forEach((displaySocket) => {
                    try{
                        displaySocket.send(JSON.stringify(newMessage))
                    }
                    catch(error){
                        console.log(error)
                    }
                })
                break;
            default:
                break;
        }
    })
}

/*TODO: Think about hashing the objects such that we can check if
additional emotes have been added or modified, and update client based on that
information.
*/
async function connectAPIs(callback) {
    let connect7TV = () => { get7TVEmotes(emotes, "7TV", callback) }
    connectTwitch(process.env['TWITCH_API_SECRET'], (response) => {
        getTwitchEmotes(response, emotes, "Twitch.tv Global", connect7TV)
    })
}