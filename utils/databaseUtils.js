import { createConnection } from "mysql"
import 'dotenv/config'
export let connection = createConnection({
    host     : process.env['DATABASE_HOST'],
    user     : process.env['DATABASE_USER'],
    password : process.env['DATABASE_PASSWORD'],
    database : 'sounds',
    port: process.env['DATABASE_PORT']
})

