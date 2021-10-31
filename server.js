const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const ejs = require('ejs')
const sqlite3 = require('sqlite3').verbose();
const isHeroku = process.env.HEROKU ? true : false
const config = require('./config.json')
let auth = JSON.parse('{ "keys" : [] }')
try {
    auth = require('./auth.json')
} catch (e) {}

const port = process.env.PORT || config.port
const domain = process.env.DOMAIN || config.url
const baseURL = `${domain}`+(port == 80 || isHeroku ? "" : `:${port}`) 
"$heroku"
const app = express()
//heroku settings
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});



app.set('view engine', 'ejs')
app.use(express.static('public'))   //serve .css file

app.get('/', (req, res) => {
    //res.status(301).redirect(url) 
    res.status(404).render('error')
})

app.get('/:id', (req, res) => {
  //open file from param name. redirect to url found in that file
  let id = req.params['id']
  fs.readFile(`db/${id}`, 'utf8', (err, data) => {
    if (err) {
      //TODO: Send notification on my end with user's information if this is an error
    res.status(404).render('error')
    }
    else {
      let url = data.trim()
      res.status(301).redirect(url) 
      console.log(`redirected to ${url} - ${Date.now()}`)
    }
  })

})

app.post('/url',  (req, res) => {
  console.log(req.headers)
  if (!isHeroku && !auth.keys.includes(req.headers.authorization)) {
    res.send(403)
    return
  }
  // full url: localhost:3000/url?url=my_url.com
  let sendURL = (hash) => res.send(`${baseURL}/${hash}`)

  if ('url' in req.query) {
    let genHash = url => {
      return crypto.createHash("sha1")
        .update(url).digest("hex")
        .substring(0, 8)
      //convert url to sha1 hash. truncate.
    }

    let url = req.query['url']
    let hash = genHash(url)
    console.log(hash)

    //if hash exists, send over the url
    fs.access (`db/${hash}`, fs.F_OK, (err) => {
      if (err) {
        //file doesn't exist. write it
        fs.writeFile(`db/${hash}`, url, 'utf8', (err) => {
          if (err) {
            const err_msg = `Unable to save file ${hash}`
            console.log(err_msg)
            res.status(500).send(err_msg)
          }
          else {
            console.log(`${hash} saved to disk`)
            sendURL(hash)
          }
        })
      //TODO: Proper error logging and handling
      }
      else {
        console.log(`${hash} - ${url} exists; sending it over`)
        sendURL(hash)
      }
    })
  }
  else {
    res.send(400)
    res.end() //invalid query 
  }
})

app.listen(port, () => {
  console.log('Running server')
  console.log(baseURL)
})

