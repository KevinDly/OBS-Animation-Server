import './env.js' //MUST Be the first import
import { WebSocketServer, WebSocket } from "ws"
import { connectTwitch, getTwitchEmotes, getUserID } from "./api/twitchapi.js"
import { generateDataResponse, generateIDs, sendData } from "./utils/dataUtils.js"
import { connectMYSQLDatabase } from "./utils/databaseUtils.js"
import { executeAnimation, twitchAuthData } from "./socket_handlers/incomingSocketEvents.js"
import { configureTwitchWebhooks } from "./api/twitchEventApi.js"
import * as http from 'http'
import express from "express"
import cors from "cors"

//const key = dotenv.config({ path: !process.env.NODE_ENV ? ".env" : `.env.${process.env.NODE_ENV}`})
console.log("Currently in: " + process.env.NODE_ENV)
console.log(process.env['PORT_FILE_AND_WSS'])
import { EVENT_SENT_DATA, SOCKET_DISPLAY, SOCKET_LIVESTREAMER_CONTROLLER,
    EVENT_EXECUTE_ANIMATION, EVENT_TWITCH_USER_AUTHENTICATION } from './constants/eventConstants.js'

const socketCleanupTimerinMilis = process.env['SOCKET_CLEANUP_TIMER_IN_MILIS']

const FILE_PORT = process.env['PORT_FILE_AND_WSS']
const file_app = express()
const file_server = http.createServer(file_app)
const wss = new WebSocketServer({ server: file_server })

const TWITCH_WEBHOOK_PORT = process.env['PORT_WEBHOOK']
const webhook_server = express()

let displaySockets = []
let controllerSockets = []

let emotes = {}
let sounds = []

file_app.use(cors({
    origin: true
}))

file_app.use(express.static("public"))
console.log("Express server initialized")

initializeServerData()

//Function that checks if any websockets are closed.
//If they are then they are not appended onto the new list.
//controllerSockets is then updated.
//TODO: Check for repeated sockets (refreshing the webpage will cause multiple duplicate sockets to appear)
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

async function initializeWSS() {
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
            case(SOCKET_DISPLAY):
                displaySockets.push(socket)
                console.log(displaySockets)
                break;

            case(SOCKET_LIVESTREAMER_CONTROLLER):
                controllerSockets.push(socket)
                console.log(controllerSockets.length)

                sendData(socket, 
                    generateDataResponse(EVENT_SENT_DATA, ["emotes", "sounds"], [emotes, sounds]))
                controllerSocketConnection(socket)
                break;
        }

    })

    file_server.listen(FILE_PORT, () => {
        console.log(`Server started on port ${file_server.address().port}`);
    })
}


async function controllerSocketConnection(socket) {
    socket.on("message", (message) => {
        let newMessage = JSON.parse(message)
        let type, data
        try{
            type = newMessage.type
            data = newMessage.data
        }
        catch {
            console.log("Unknown message recieved.")
            console.log(newMessage)
            return
        }
    
        console.log("Recieved message.")
        console.log(`%s`, newMessage)
        console.log("type", type)
        console.log("data", data)
        //TODO: Put data
        switch(type) {
            case EVENT_EXECUTE_ANIMATION:
                executeAnimation(displaySockets, newMessage)
                break;
            case EVENT_TWITCH_USER_AUTHENTICATION:
                //TODO: Error handling for the user, send data back to tell them to refresh or add emotes depending on failure.
                //TODO: Make different events for just sending emotes/sounds/etc
                //TODO: Remove this stuff from here to it's own functions, as later on we'll need to do a lot with user-id related data.
                twitchAuthData(data, socket)
                break;
            default:
                console.log("Unknown event recieved.")
                console.log(newMessage)
                break;
        }
    })
}

async function initializeServerData() {
    console.log("Connecting to APIs")
    const updateEmotes = (response) => {
        //const data = generateIDs(response['data'], "name", "id")
        emotes["Twitch.tv Global"] = response
    }

    console.log("Connecting to MySQL Database")
    connectMYSQLDatabase(sounds).then(() => {
        console.log("Connecting to Twitch")
        return connectTwitch(process.env['TWITCH_API_SECRET'])
    }).then((response) => {
        console.log("Getting Twitch Emotes")
        return getTwitchEmotes(response)
    }).then((response) => {
        console.log("Updating Twitch emotes")
        updateEmotes(response)
    }).then(() => {
        console.log("Twitch Webhook Server")
        configureTwitchWebhooks(webhook_server, TWITCH_WEBHOOK_PORT)
    })
    .then(() => {
        console.log("WSS")
        initializeWSS()
    })
}