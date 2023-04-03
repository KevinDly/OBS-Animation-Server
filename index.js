import { WebSocketServer } from "ws"
import * as http from 'http'
import express from "express"
import cors from "cors"

const AYAYA_URL = "https://play-lh.googleusercontent.com/kTkV3EWtNTDVCzRnUdbI5KdXm6Io-IM4Fb3mDcmX9-EOCEXJxnAxaph_leEn6m61E0I"

const port = 2999
const app = express()
app.use(cors({
    origin: true
}))
app.use(express.static("public"))

const server = http.createServer(app)
const wss = new WebSocketServer({ server })

console.log("Server initialized")

let displaySockets = []
let controllerSockets = []

wss.on("connection", (socket) => {
    console.log("Connection recieved.")
    console.log(socket.protocol)
    socket.send(JSON.stringify({
        type: "executeAnimation",
        data: {
            url: AYAYA_URL,
            emoteDensity: 5
        }
    }))

    switch(socket.protocol){
        case("streamDisplay"):
            displaySockets.push(socket)
            console.log(displaySockets)
            break;
        case("streamerController"):
            controllerSockets.push(socket)
            controllerSocketConnection(socket)
            break;
    }

})
server.listen(port, () => {
    console.log(`Server started on port ${server.address().port}`);
})

function controllerSocketConnection(socket) {
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