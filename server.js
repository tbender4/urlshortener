const fs = require('fs')
const crypto = require('crypto')
const express = require('express')

const app = express()
const port = 80
//const port = 80
const domain = 'u.sv3.com'

function genHash (url) {
  return crypto.createHash("sha1")
    .update(url).digest("hex")
    .substring(0, 8)
  //convert url to sha1 hash. truncate.
}

app.route('/')
 //TODO: Create better landing page 
  .get((req, res) => {
    res.send('root my guy')
  })
  .post((req, res) => {
    res.send("what's up my guy\n")
    console.log('post called on root')
  })


app.get('/:id', (req, res) => {
  //open file from param name. redirect to url found in that file
  let id = req.params['id']
  fs.readFile(`db/${id}`, 'utf8', (err, data) => {
    if (err) {
      //TODO: Create neater error page
      res.send('not a valid url')
    }
    let url = data.trim()
    res.status(301).redirect(url) 
    console.log(`redirected to ${url}`)
  })

})

app.post('/url',  (req, res) => {
  // full url: localhost:3000/url?url=my_url.com
  let sendURL = (hash) => res.send(`${domain}/${hash}`)

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
            console.log("unable to save file")
            res.status(500).send("unable to save file")
          }
          else sendURL(hash)
        })
      //TODO: Proper error logging and handling
      }
      else {
        console.log(`${hash} - ${url} exists`)
        sendURL(hash)
      }
    })
  }
  else {
    res.end() //invalid query 
  }
})

app.listen(port, () => {
  console.log('yerr')
})

