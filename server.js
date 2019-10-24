const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

const sqlite3 = require('sqlite3').verbose()
const DBSOURCE = "db.db"
let db = new sqlite3.Database(DBSOURCE, (err) => {
    if(err){
        console.log(err.message)
        throw err
    }
    else{
        console.log('Connected to the SQlite database.')
    }
})

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/addUser', function (req, res){
    console.log(req.body)
    var fn = req.body.firstname
    var ln = req.body.lastname

    db.run(`INSERT INTO users (firstname, lastname) VALUES('${fn}', '${ln}')`, function(err){
        if(err){
            console.log(err.message)
        }
        else{
            console.log(`Added User ${fn} ${ln}`)
            res.redirect('/users.html')
        }
    })
})

app.post('/addComp', function (req, res){
    console.log(req.body)
    var name = req.body.comp
    var user_id = req.body.creator

    db.run(`INSERT INTO competition (name, user_id) VALUES('${name}', '${user_id}')`, function(err){
        if(err){
            console.log(err.message)
        }
        else{
            console.log(`Added competition: ${name}`)
            res.redirect('/users.html')
        }
    })
})


app.post('/addResult', function (req, res){
    
})

app.get(`/getUsers`, function (req, res){
    db.all(`SELECT * FROM users`, (err, rows) => {
        if(err){
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    })
})

app.get(`/getComp`, function (req, res){
    db.all(`SELECT users.firstname, competition.name FROM users INNER JOIN competition ON users.id = competition.user_id`, (err, rows) => {
        if(err){
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))