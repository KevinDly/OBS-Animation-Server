const TWITCH_GLOBAL_EMOTES_URL = process.env['TWITCH_GLOBAL_EMOTES_URL']
const TWITCH_VALIDATION_URL = process.env['TWITCH_VALIDATION_URL']
const TWITCH_CLIENT_ID = process.env['TWITCH_CLIENT_ID']
const TWITCH_USERS_URL = process.env['TWITCH_USERS_URL']

const TWITCH_OAUTH_URL = process.env['TWITCH_OAUTH_URL']

//TODO: Replace a, b.
//Function that grabs the emotes from a connected api.
export function getTwitchEmotes({access_token, a, b}, callback = () => {}) {
    return fetch(TWITCH_GLOBAL_EMOTES_URL, {
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Client-Id': TWITCH_CLIENT_ID
        }
    })
    .then(response => response.json())
    .then(response => {
        /*emoteDict[source] = response
        console.log("Initializing Callback")
        console.log(emoteDict)
        callback()*/

        console.log(callback)
        //callback(response)
        return response
    })
}

export function getUserID(accessResponse, callback = () => {}) {
    fetch(TWITCH_USERS_URL, {
        headers: {
            'Authorization': 'Bearer ' + accessResponse['access_token'],
            'Client-Id': TWITCH_CLIENT_ID
        }
    })
    .then(response => response.json())
    .then(response => {
        callback(response)
    })
}

//Function that will attempt to connect to twitch.tv's api.
//TODO: Refactor to be just a connection function => take a lambda that is specific per api
//TODO: Check for failure connection error.
export async function connectTwitch(secret, authorization_url, additional_parameters = {}, dev_mode = false) {
    let twitchSearchParams = {
        'client_id': TWITCH_CLIENT_ID,
        'client_secret': secret,
        'grant_type': 'client_credentials'
    }

    Object.keys(additional_parameters).map(key => {
        twitchSearchParams[key] = additional_parameters[key]
    })

    if(!dev_mode) {
        twitchSearchParams = new URLSearchParams(twitchSearchParams)
    }
    else {
        console.log("Dev mode")
        let formattedString = ""
        Object.keys(twitchSearchParams).map(key => {
            formattedString = formattedString.concat(`${key}=${twitchSearchParams[key]}&`)
        })
        formattedString = formattedString.substring(0, formattedString.length - 1)
        return fetch(authorization_url + "?" + formattedString, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(response => {
            console.log(response)
            return response
        })
    }

    console.log(twitchSearchParams)
    console.log(authorization_url)
    return fetch(authorization_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: twitchSearchParams
    })
    .then(response => response.json())
    .then(response => {
        console.log(response)
        return response
    })
}