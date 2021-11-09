const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const ejs = require('ejs')
const sqlite3 = require('sqlite3').verbose();
const {Sequelize, Model, DataTypes, UnknownConstraintError} = require('sequelize')

const isHeroku = process.env.HEROKU ? true : false
const config = require('./config.json')
let auth = JSON.parse('{ "keys" : [] }')
try {
    auth = require('./auth.json')
} catch (e) {}

const port = process.env.PORT || config.port
const domain = process.env.DOMAIN || config.url
const baseURL = `${domain}`+(port == 80 || isHeroku ? "" : `:${port}`) 

// let db = new sqlite3.Database(':memory:', (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Connected to the in-memory SQlite database.');
// });
const sequelize = new Sequelize('sqlite::memory:', {logging: console.log})
const URL = sequelize.define('URL', {
  incomingURL: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true,
      notEmpty: true
    },
  },
  shortenedHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  accessedAt: {
    type: DataTypes.DATE
  },
  accessAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  getterMethods: {
    fullURL() { this.increment('accessAttempts'); return `${baseURL}/${this.shortenedHash}` }
  },
  settersMethods: {
    setURL(url, hash) {
      this.setDataValue('incomingURL', url)
      this.setDataValue('shortenedHash', hash)
    }
  }
})
const CustomParam  = sequelize.define('CustomParam', {
 param: {
   type: DataTypes.STRING,
   unique: true,
   primaryKey: true
 }
})
CustomParam.belongsToMany(URL, { through: "CustomParamURLs"})
URL.belongsToMany(CustomParam, { through: "CustomParamURLs"})

const init = async() => { 
  await URL.sync()
  await customParam.sync()
  console.log("tables made")
}
init()

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))   //serve .css file

app.get('/', (req, res) => {
    //res.status(301).redirect(url)
    console.log(testURL)

    res.status(404).render('error', )
})

app.get('/:id', (req, res) => {
  //open file from param name. redirect to url found in that file
  let id = req.params['id']

  async () => {
    let urlObject = await URL.findByPk(id)
    if ( urlObject == null)
      res.status(404).render('error')
    else {
    }
  } 
  fs.readFile(`db/${id}`, 'utf8', (err, data) => {
    if (err) {
      //TODO: Send notification on my end with user's information if this is an error
    res.status(404).render('error')
    }
    else {
      let url = data.trim()
      res.status(301).redirect(url) 
      console.log(`redirecting ${id} to ${url} - ${new Date(Date.now()).toUTCString()}`)
    }
  })
})

app.post('/url',  (req, res) => {
  console.log(req.headers)
  if (!isHeroku && !auth.keys.includes(req.headers.authorization)) {
    // heroku mode disables authentication
    res.send(403)
    return
  }
  // full url: localhost:3000/url?url=my_url.com
  let sendURL = (hash) => res.send(URL.findByPk(hash).fullURL())

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

    //find url, create if needed
    async() => {
      let [urlObject, created] = await URL.findOrCreate( {
        where: {shortenedHash: hash},
        defaults: {
          incomingURL: url,
          shortenedHash: hash
        } 
      })
      if (created)
        console.log('New URL Made')
      
      sendURL(urlObject)
    }
    // fs.access (`db/${hash}`, fs.F_OK, (err) => {
    //   if (err) {
    //     //file doesn't exist. write it
    //     fs.writeFile(`db/${hash}`, url, 'utf8', (err) => {
    //       if (err) {
    //         const err_msg = `Unable to save file ${hash}`
    //         console.log(err_msg)
    //         res.status(500).send(err_msg)
    //       }
    //       else {
    //         console.log(`${url} => ${hash} saved to disk`)
    //         sendURL(hash)
    //       }
    //     })
    //   //TODO: Proper error logging and handling
    //   }
    //   else {
    //     console.log(`${hash} <=> ${url} exists; sending it over`)
    //     sendURL(hash)
    //   }
    // })
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

