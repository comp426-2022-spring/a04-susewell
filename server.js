// Require Express.js
const express = require('express')
const app = express()

const logdb = require('./database.js')

const morgan = require('morgan')
const fs = require('fs')

const args = require('minimist')(process.argv.slice(2));

app.use(express.urlencoded({extended: true}))
app.use(express.json())


const port = args.port || args.p || 5000



const server = app.listen(port, () => {
    console.log('Server is running on a port %PORT%'.replace('%PORT%', port))
})

app.get("/app/", (req, res, next) =>{
    res.json({"message" : "Your API works! (200)"});
    res.status(200);
});

if (args.log == 'false') {
    console.log("not creating file access.log")
} else {
    const accesslog = fs.createWriteStream('access.log', {flags: 'a'})
    app.use(morgan('combined', {stream: accessLog}))
}

const help = (`
server.js [options]
--port, -p	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug, -d If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help, -h	Return this message and exit.
`)
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    console.log(logdata)
    const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
    next();
});

if (args.debug || args.d) {
    app.get('/app/log/access/', (req, res, next) => {
        const stmt = db.prepare('SELECT * FROM accesslog').all()
        res.status(200).json (stmt)
    })
    app.get ('/app/error/', (req, res, next) => {
        throw new Error('Error')
    })
}
function coinFlip() {
    let flip =  Math.random();
    if (flip < 0.5){
        return 'heads'
    } else {
        return 'tails'
    }
}

function coinFlips(flips) {

    let result = [];
    for(let i = 0; i < flips; i++) {
      result [i] = coinFlip();
    }
    return result;
}

function countFlips(array) {

     let i = 0;
     let heads = 0
     let tails = 0
    
    while (i < array.length) {
      if (array[i] === 'heads') {
        heads += 1;
      }else {
        tails +=1
      }
      i++;
    }
    if (tails === 0) {
      return {'heads' : heads}
    } else if (heads === 0) {
      return {'tails' : tails}
    } else {
    return {'heads' : heads, 'tails' : tails}
    }
  }

  function flipACoin(call) {
    let flip =  coinFlip();
  
    if (call != flip){
     return {call: call, flip: flip, result: 'lose'}
    } else{
      return {call: call, flip: flip, result: 'win'}
    }
  }
// Use Morgan for logging
app.use(fs.writeFile('./access.log', data, 
    {flag: 'a'}, (err, req, res, next) => {
        if (err) {
            console.error(err)
        } else {
            console.log()
        }
    }
))


app.get('/app/echo/:number', express.json(), (req, res) => {
    res.status(200).json({ 'message': req.params.number })
})

app.get('/app/echo/', (req, res) => {
    res.status(200).json({ 'message' : req.query.number })
})

app.get('/app/echo/', logging, (req, res) => {
    res.status(200).json({ 'message' : req.body.number })
})

app.get('/app/flip/', (req, res) => {
    res.status(200).json({ 'flip' : coinFlip()})
})

app.get('/app/flips/:number', (req, res) => {
    let flips = coinFlips(req.params.number)
    let final = countFlips(flips)
    res.status(200).json({ 'raw' : flips, 'summary' : final})
})

app.get('/app/flip/call/heads', (req, res) => {
    let heads = flipACoin('heads')
    res.status(200).json(heads)
})

app.get('/app/flip/call/tails', (req, res) => {
    let tails = flipACoin('tails')
    res.status(200).json(tails)
})

app.use(function(req, res) {
    res.status(404).send("404 NOT FOUND")
    res.type("text/plain")
})