const fs = require('fs')
const crypto = require('crypto')
const express = require('express')
const ejs = require('ejs')
const sqlite3 = require('sqlite3').verbose();
const {Sequelize, Model, DataTypes, UnknownConstraintError} = require('sequelize')

const isHeroku = process.env.HEROKU ? true : false // heroku mode disables authentication
const config = require('./config.json');
const { url } = require('inspector');
let auth = JSON.parse('{ "keys" : [] }')
try {
    auth = require('./auth.json')
} catch (e) {}

const port = process.env.PORT || config.port
const domain = process.env.DOMAIN || config.url
const baseURL = `${domain}`+(port == 80 || isHeroku ? "" : `:${port}`) 

const sequelize = new Sequelize( {
  dialect: config.database_dialect,
  storage: config.database_storage
})
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
  lastAccessedAt: {
    type: DataTypes.DATE
  },
  accessAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  fullURL: {
    type: DataTypes.VIRTUAL,
    get() { 
      return `${baseURL}/${this.shortenedHash}` }
  }
})

//TODO: Implement this custom URL parameters
const CustomParam  = sequelize.define('CustomParam', {
 param: {
   type: DataTypes.STRING,
   unique: true,
   primaryKey: true
 }
})
CustomParam.belongsToMany(URL, { through: "CustomParamURLs"})
URL.belongsToMany(CustomParam, { through: "CustomParamURLs"})

//Create DBs
const init = async() => { 
  await URL.sync()
  await CustomParam.sync()
  console.log("tables made")
}
init()

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))   //serve .css file

app.get('/', (req, res) => {
    //res.status(301).redirect(url)
    res.status(404).render('error')
})

app.get('/:id', (req, res) => {
  //open file from param name. redirect to url found in that file
  let id = req.params['id'];

  const yerr = async () => {
    let urlObject = await URL.findByPk(id)
    if (urlObject == null)
      res.status(404).render('error')
    else {
      console.log('found something')
      console.log(urlObject)
      res.status(301).redirect(urlObject.incomingURL.trim())
      // res.status(301).redirect(url) 
      // console.log(`redirecting ${id} to ${url} - ${new Date(Date.now()).toUTCString()}`)
    }
  }
  yerr()
})



app.post('/url',  (req, res) => {
  console.log(req.headers)
  if (!isHeroku && !auth.keys.includes(req.headers.authorization)) {
    // heroku mode disables authentication
    res.send(403)
    return
  }
  // full url: localhost:3000/url?url=my_url.com&custom=covidsurvey
  // becomes localhost:3000/covidsurvey/urlhash
  // no custom param means direct to url
  let sendURL = (urlObject) => { console.log(urlObject); res.send(urlObject.fullURL)}
  let genHash = (url) => {
    return crypto.createHash("sha1")
      .update(url).digest("hex")
      .substring(0, 8)
    //convert url to sha1 hash. truncate.
  }
  if ('url' in req.query) {
    let url = req.query['url']
    let hash = genHash(url)
    console.log(`${url} -> ${hash}`)

    //find url, create if needed
    const findOrCreateURL = async() => {
      console.log("called findOrCreateURL fuction")
      let urlObject = await URL.findByPk(hash)
      if (urlObject == null) {
        //make it
        console.log("making it for the first time")
        urlObject = await URL.create( 
          {
            incomingURL: url,
            shortenedHash: hash
          }
        )
        sendURL(urlObject)
        console.log(urlObject)
      }
      else {
        sendURL(urlObject)
        console.log("url already existed")
        console.log(urlObject)
      }
    }
    findOrCreateURL()
  }
  else {
    res.send(400)
    res.end() //invalid query parameters
  }
})

app.listen(port, () => {
  console.log('Running server')
  console.log(baseURL)
})
