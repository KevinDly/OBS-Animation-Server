/*
data is an array of documents to generate the IDs for.
keyName is the key in the dict to be used as the identifier
suffix is the suffix of the ID.
*/
export function generateIDs(data, keyName, suffix) {
    const idSet = new Set()
    const updatedData = []
    data.forEach(document => {
        const proposedBaseID = `${document[keyName].toLowerCase()}_${suffix}`
        let count = 0
        let duplicateIdentifier = ""

        let proposedTotalID = proposedBaseID + duplicateIdentifier
        while(idSet.has(proposedTotalID)) {
            proposedTotalID = proposedBaseID + String(count)
            count++
        }
        updatedData.push({...document, id: proposedTotalID})
        idSet.add(proposedTotalID)
    })

    return updatedData
}

function generateDataDict(dataTypes, dataArray) {
    const data = {}
    dataTypes.forEach((type, index) => {
        data[type] = dataArray[index]
    })
    return data
}

export function generateDataResponse(eventType, dataTypes, dataArray) {
    const data = {
        type: eventType,
        data: generateDataDict(dataTypes, dataArray)
    }

    return data
}

export function sendData(socket, data) {
    console.log(data)
    const stringifiedData = JSON.stringify(data)
    socket.send(stringifiedData)
}