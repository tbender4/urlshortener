const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const app = express()
const port = 3000
//const port = 80
const domain = 'u.sv3.com'

function genHash (url) {
  return crypto.createHash("sha1")
    .update(url).digest("hex")
    .substring(0, 8)
  //convert url to sha1 hash. truncate.
}

function saveURL(url, hash) {
  fs.writeFile(hash, url, 'utf8', (err) => {
    if (err) 
      console.log("unable to write")
    //TODO: Proper error logging and handling
  })
}

app.route('/')
 //TODO: Create landing page 
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
  fs.readFile('db/${id}', 'utf8', (err, data) => {
    if (err) {
      //TODO: Create neater error page
      res.send('not a valid url')
    }
    var url = data.trim()
    res.status(301).redirect(url) 
    console.log('redirected to ${url}')
  })

})

app.post('/url',  (req, res) => {
  // full url: localhost:3000/url?url=my_url.com
  console.log(req.query)
  if ('url' in req.query) {
    let hash = genHash(req.query['url'])
    console.log(hash)

    //if hash exists, send over the url
    fs.exists ('db/${hash}', (exists) => {
      if (exists) {
        res.send('${domain}/${hash}')
      }
      else {
        //TODO: Save URL to hash file on disk.
       saveURL(req.query['url'], hash).then(
      }
    }
    res.send(hash)
  }
  else {
    res.end() //invalid query 
  }
  
})

app.listen(port, () => {
  console.log('yerr')
})

