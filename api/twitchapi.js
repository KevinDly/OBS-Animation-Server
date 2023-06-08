const TWITCH_GLOBAL_EMOTES_URL = 'https://api.twitch.tv/helix/chat/emotes/global'
const TWITCH_VALIDATION_URL = 'https://id.twitch.tv/oauth2/validate'
const TWITCH_CLIENT_ID = 'bmkhxh3eb8cl8uvtkwm6fbrahzgkdx'

const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2/token'

//TODO: Replace a, b.
//Function that grabs the emotes from a connected api.
export function getTwitchEmotes({access_token, a, b}, emoteDict, source, callback = () => {}) {
    fetch(TWITCH_GLOBAL_EMOTES_URL, {
        headers: {
            'Authorization': 'Bearer ' + access_token,
            'Client-Id': TWITCH_CLIENT_ID
        }
    })
    .then(response => response.json())
    .then(response => {
        emoteDict[source] = response
        console.log("Initializing Callback")
        console.log(emoteDict)
        callback()
    })
}

//Function that will attempt to connect to twitch.tv's api.
//TODO: Refactor to be just a connection function => take a lambda that is specific per api
export function connectTwitch(secret, callback) {
    fetch(TWITCH_OAUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'client_id': TWITCH_CLIENT_ID,
            'client_secret': secret,
            'grant_type': 'client_credentials'
        })
    })
    .then(response => response.json())
    .then(response => {
        console.log(response)
        callback(response)
    })
}