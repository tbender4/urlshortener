const fs = require('fs')
const express = require('express')
const app = express()
const port = 3000
//const port = 80

app.get('/:id', (req, res) => {

    if (req.params['id'] == 'meme')
    fs.readFile('meme', 'utf8', (err, data) => {
        console.log(data)
        //res.status(301).redirect(data.toString())
        res.send(data.toString())
    })

    //res.status(301).redirect('https://google.com');
    //^^
    //this is the end result. direct to the desired URL
})

app.listen(port, () => {
    console.log('yerr')
})

