import { createConnection } from "mysql"
import 'dotenv/config'

const SOUND_TABLE = "sound_information"

export let connection = createConnection({
    host     : process.env['DATABASE_HOST'],
    user     : process.env['DATABASE_USER'],
    password : process.env['DATABASE_PASSWORD'],
    database : 'sounds',
    port: process.env['DATABASE_PORT']
})

export async function connectMYSQLDatabase(sounds, callback = () => {}) {
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
        })

        return Promise.resolve("Success")
    }
    catch(error) {
        console.log("Mysql connection error")
        console.log(error)
        return Promise.reject("Failure")
    }

}