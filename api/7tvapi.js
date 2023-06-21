//TODO: Remove later.
const CHOOBS_ID = "143548078"

//TODO Turns this into a general function alongside the twitch function.
export function get7TVEmotes(emoteDict, source, userID, callback = () => {}) {
    fetch(`https://7tv.io/v3/users/twitch/${userID}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(response => {
        let emoteList = []
        console.log(response)

        //Means the user has no emotes currently available.
        //TODO: Send error message back to user
        if(!("emotes" in response.emote_set))
            return
        
        response.emote_set.emotes.forEach(data => {
        const emoteFormatting = {
            images: {
                url_1x: `https://cdn.7tv.app/emote/${data.id}/1x.webp`,
                url_2x: `https://cdn.7tv.app/emote/${data.id}/2x.webp`,
                url_3x: `https://cdn.7tv.app/emote/${data.id}/3x.webp`,
                url_4x: `https://cdn.7tv.app/emote/${data.id}/4x.webp`
            },
            name: data.name
        }
        emoteList.push(emoteFormatting)
        })
        emoteDict[source] = {data: emoteList}
        callback()
    })
}