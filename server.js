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

    db.run(`INSERT INTO competition (name, user_id, ra) VALUES('${name}', '${user_id}', '${0}')`, function(err){
        if(err){
            console.log(err.message)
        }
        else{
            console.log(`Added competition: ${name}`)
            res.redirect('/users.html')
        }
    })
})

app.post('/addAllResult', function (req, res){
    var results = req.body.results;
    var userId = req.body.userId;
    var compId = req.body.cID;
    console.log(results)
    console.log(userId)
    console.log(compId)
    var query = `INSERT INTO results (result, user_id, comp_id) VALUES`;
    for(var i=0;i<userId.length;i++){
        if(i == userId.length - 1){
            query += `('${results[i]}', '${userId[i]}', '${compId}')`
        }
        else{
            query += `('${results[i]}', '${userId[i]}', '${compId}'),`
        }
    }
    console.log(query)
    db.run(query, function(err){
        if(err){
            console.log(err.message)
        }
        else{
            db.run(`UPDATE competition SET ra = 1 WHERE ra = 0`, function(err){
                if(err){
                    console.log(err.message)
                }
                else{
                    console.log('bom')
                }
            })
            console.log(`Results added for competition: ${compId}`)
            res.redirect('/users.html')
        }
    })
})

app.post('/addResult', function (req, res){
    var user_id = req.body.users;
    var comp_id = req.body.comp;
    var result = req.body.result;

    db.run(`INSERT INTO results (result, user_id, comp_id) VALUES('${result}', '${user_id}', '${comp_id}')`, function(err){
        if(err){
            console.log(err.message)
        }
        else{
            console.log(result)
            res.redirect('/users.html')
        }
    })
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
    db.all(`SELECT competition.id, users.firstname, users.lastname, competition.name, competition.ra FROM users INNER JOIN competition ON users.id = competition.user_id`, (err, rows) => {
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

app.get('/getAll', function (req, res){
    db.all(`SELECT result, users.firstname, users.lastname, competition.name, competition.id FROM users INNER JOIN results ON users.id = results.user_id INNER JOIN competition ON results.comp_id = competition.id`, (err, rows) => {
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

app.get('/a', function (req, res){
    db.all(`SELECT MAX(id) AS id,name FROM competition`, (err, rows) => {
        if(err){
            res.status(400).json({"error":err.message});
            return;
        }
        db.all(`SELECT id, firstname, lastname FROM users`, (err, rows2) => {
            if(err){
                res.status(400).json({"error":err.message});
                return;
            }
            res.json({
                "data1":rows,
                "data2":rows2
            })
        })
        
    })
    
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))