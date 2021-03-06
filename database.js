const database = require('better-sqlite3')

const logdb = new database('log.db')

const stmt = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='access';`)
let row = stmt.get();
if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database.....')
    
    const sqlInit = `
        CREATE TABLE access ( id INTEGER PRIMARY KEY, 
            remoteaddr TEXT, 
            remoteuser TEXT, 
            time TEXT, 
            method TEXT, 
            url TEXT,
            protocol TEXT, 
            httpversion TEXT, 
            status TEXT, 
            referrer TEXT, 
            useragent TEXT)
    `
    logdb.exec(sqlInit)
} else {
    console.log('Log database exists.')
}

module.exports = logdb