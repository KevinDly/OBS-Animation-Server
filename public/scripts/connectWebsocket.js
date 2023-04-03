import { generateEmotes } from "./generateAnimation.js"

function connectServer(){
    const WEBSOCKET_URL = "ws://localhost:2999"
    const WEBSOCKET_PROTOCOLS = ["streamDisplay"]
    try {
        let websocket = new WebSocket(WEBSOCKET_URL, WEBSOCKET_PROTOCOLS)
        console.log("Created websocket")

        websocket.onmessage = (event) => {
            const msg = JSON.parse(event.data)
            const data = msg.data
            const type = msg.type
            console.log(msg)
            //const emoteDensity = msg.emoteDensity
            //const imageURL = msg.emoteURL

            //generateEmotes(emoteDensity, imageURL)
            switch(type) {
                case "executeAnimation":
                    const imageLink = data.url
                    const emoteDensity = data.emoteDensity
                    generateEmotes(emoteDensity, imageLink)

                    break;
                default:
                    console.log("Unhandled protocol: " + type)
                    console.log(msg)
                
            }
        }
    } catch (error) {
        console.log(error)
        connectServer()
    }
}

export { connectServer }