import { WebSocketServer, WebSocket } from "ws"
import * as http from 'http'
import express from "express"
import cors from "cors"
import { connectTwitch, getTwitchEmotes } from "./api/twitchapi.js"
import { get7TVEmotes } from "./api/7tvapi.js"
import 'dotenv/config'
import { connection } from "./utils/databaseUtils.js"

const AYAYA_URL = "https://play-lh.googleusercontent.com/kTkV3EWtNTDVCzRnUdbI5KdXm6Io-IM4Fb3mDcmX9-EOCEXJxnAxaph_leEn6m61E0I"
const socketCleanupTimerinMilis = process.env['SOCKET_CLEANUP_TIMER_IN_MILIS']
const port = 2999
const app = express()

const SOUND_TABLE = "sound_information"

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

let emotes = {}
let sounds = []

app.use(cors({
    origin: true
}))

app.use(express.static("public"))

console.log("Server initialized")
let displaySockets = []
let controllerSockets = []

console.log("Connecting to APIs")

//TODO: MAKE IT SO THAT YOU DONT HAVE TO KEEP ADDING ON TO THE CALLBACKS WHEN YOU NEED TO CHAIN THEM
connectMYSQLDatabase(() => 
    {
        connectAPIs(() => {
            initializeWSS()
        })
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
    console.log("Initializing WSS")
    console.log(emotes)

    //Enable unused socket cleanup.
    console.log(sounds)

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
                    data: {
                        "emotes": emotes,
                        "sounds": sounds
                    }
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

async function connectMYSQLDatabase(callback) {
    try {
        connection.connect()
        connection.query('SELECT * FROM ' + SOUND_TABLE, (error, results, fields) => {
            if (error) throw error

            results.forEach(document => {
                sounds.push({
                    "id": document.SoundID,
                    "display": document.Display,
                    "src": document.URL,
                    "name": document.SoundName
                })
            })
            callback()
        })
    }
    catch(error) {
        console.log("Mysql connection error")
        console.log(error)
        callback()
    }
}