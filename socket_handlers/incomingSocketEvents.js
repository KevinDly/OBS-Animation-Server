import { connectTwitch, getUserID } from "../api/twitchapi.js"
import { get7TVEmotes } from "../api/7tvapi.js"
import { sendData, generateDataResponse, generateIDs } from "../utils/dataUtils.js"
import { EVENT_SENT_DATA } from "../constants/eventConstants.js"

export function executeAnimation(displaySockets, message) {
    displaySockets.forEach((displaySocket) => {
        try{
            displaySocket.send(JSON.stringify(message))
        }
        catch(error){
            console.log(error)
        }
    })
}

function handle7TVConnection(socket, id) {
    const sendNewData = (response) => {
        sendData(socket,
            generateDataResponse(EVENT_SENT_DATA,
                ["emotes"],
                [{ "7TV": { "data": generateIDs(response, "name", "id") } }]))
    }

    get7TVEmotes(id, sendNewData)
}

export function twitchAuthData(data, socket) {
    connectTwitch(process.env['TWITCH_API_SECRET'], process.env['TWITCH_OAUTH_URL'], {"code": data['code'], "grant_type": "authorization_code", "redirect_uri": "http://localhost:3000/"}).then((twitchResponse) => {
        try {
            const postUserID = (response) => {
                let id

                try {
                    id = response['data'][0]['id']
                }
                catch (error) {
                    console.log(error)
                    return
                }

                handle7TVConnection(socket, id)
            }

            console.log("Getting user ID")
            getUserID(twitchResponse, (response) => { postUserID(response) })
        }
        catch (error) {
            console.log(error)
        }
    })
}

export function getTwitchDevData(data, socket) {
    connectTwitch(process.env['TWITCH_API_SECRET'], process.env['TWITCH_OAUTH_URL_USER'], {grant_type: "user_token", user_id: data['id'], scope: data['scope']}).then((response) => {
        console.log("Mock user data token recieved")
        console.log(response)
    }).catch((error) => {
        console.log(error)
    })
}

