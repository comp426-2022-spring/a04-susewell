// Require Express.js
const express = require('express')
const app = express()

const logdb = require('./database')

const morgan = require('morgan')
const errorhandler = require('errorhandler')
const fs = require('fs')

const args = require ('minimist')(process.argv.slice(2));
args['port'];
const port_args = args.port;

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const logging = (req, res, next) => {
    console.log(req.body.number)
    next()
}



var port = 5000

if (port_args != null) {
    var port = port_args;
}

const server = app.listen(port, () => {
    console.log('App is running on a port %PORT%'.replace('%PORT%', port))
})

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

app.get('/app', (req, res) => {
    res.status(200).end('API is working right')
    res.type('text/plain')
})


app.get('/app/echo/:number', express.json(), (req, res) => {
    res.status(200).json({ 'message': req.params.number })
})

app.get('/app/echo/', (req, res) => {
    res.status(200).json({ 'message' : req.query.number })
})

app.get('/app/echo/', logging, (req, res) => {
    res.status(200).json({ 'message' : req.body.number })
})

app.get('/app/flip', (req, res) => {
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