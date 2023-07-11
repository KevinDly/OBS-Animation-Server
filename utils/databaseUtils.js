import { createConnection } from "mysql"

const SOUND_TABLE = "sound_information"

export let connection = createConnection({
    host     : process.env['DATABASE_HOST'],
    user     : process.env['DATABASE_USER'],
    password : process.env['DATABASE_PASSWORD'],
    database : 'sounds',
    port: process.env['DATABASE_PORT']
})

export async function connectMYSQLDatabase(sounds, callback = () => {}) {
    connection.connect()
    connection.query('SELECT * FROM ' + SOUND_TABLE, (error, results, fields) => {
        try {
            if(error) {
                throw error
            }

            results.forEach(document => {
                sounds.push({
                    "id": document.SoundID,
                    "display": document.Display,
                    "src": document.URL,
                    "name": document.SoundName
                })
            })
        }
        catch(error) {
            console.log(error)
        }   
    })
}