const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const ejs = require('ejs')
const config = require('./config.json')
const auth = require('./auth.json')

const app = express()
//heroku settings
const port = process.env.PORT || config.port
const domain = process.env.DOMAIN || config.url
const isHeroku = process.env.HEROKU ? true : false

function genHash (url) {
  return crypto.createHash("sha1")
    .update(url).digest("hex")
    .substring(0, 8)
  //convert url to sha1 hash. truncate.
}

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
      //TODO: Create neater error page
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
  if (!auth.keys.includes(req.headers.authorization || isHeroku)) {
    res.send(403)
    return
  }

  // full url: localhost:3000/url?url=my_url.com
  let sendURL = (hash) => res.send(`${domain}`+(port == 80 ? "" : `:${port}`)+`/${hash}`)

  if ('url' in req.query) {
    let url = req.query['url']
    
    let hash = genHash(url)
    console.log(hash)

    //if hash exists, send over the url
    fs.access (`db/${hash}`, fs.F_OK, (err) => {
      if (err) {
        //file doesn't exist. write it
        fs.writeFile(`db/${hash}`, url, 'utf8', (err) => {
          if (err) {
            const err_msg = `unable to save file ${hash}`
            console.log(err_msg)
            res.status(500).send(err_msg)
          }
          else {
            console.log(`${hash} saving to disk`)
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
  console.log(`${domain}` + (port == 80 ? "" : `:${port}`))
})

