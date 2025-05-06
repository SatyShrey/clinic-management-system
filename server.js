const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
require('dotenv').config();
const conStr = process.env.constr;
const mongoClient = require('mongodb').MongoClient;

const path = require('path');

//............default page (login page).....................
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname) }, (err) => {
        if (err) { console.error('Error:', err); res.end() }
    })
});

//login
app.post('/login', (req, res) => {
    const body = req.body;
    mongoClient.connect(conStr).then(clientObject => {
        const db = clientObject.db('clinic');
        db.collection('users').findOne(body).then(data => {
            res.send(data);
            res.end();
        })
    })
})


//tokens
app.get('/tokens', (req, res) => {
    mongoClient.connect(conStr).then(clientObject => {
        const db = clientObject.db('clinic');
        db.collection('tokens').find({}).toArray().then(data => {
            res.send(data);
            res.end();
        })
    })
})


//add token
app.post('/token', (req, res) => {
    mongoClient.connect(conStr).then(clientObject => {
        const db = clientObject.db('clinic');
        db.collection('tokens').insertOne(req.body).then(()=>{
            db.collection('tokens').find({}).toArray().then(data => {
                res.send(data);
                res.end();
            })
        })
    })
})


//check-done
app.put('/check-done', (req, res) => {
    mongoClient.connect(conStr).then(clientObject => {
        const db = clientObject.db('clinic');
        console.log(req.body)
        db.collection('tokens').updateOne({id:req.body.id},{$set:{status:"completed",fees:req.body.fees}}).then(()=>{
            db.collection('tokens').find({}).toArray().then(data => {
                res.send(data);
                res.end();
            })
        })
    })
})

//signup
app.post('/signup', (req, res) => {
    const body=req.body;
    mongoClient.connect(conStr).then(clientObject => {
        const db = clientObject.db('clinic');
        db.collection('users').findOne({ email: body.email }).then(data => {
            if (data) {
                res.send('Error:This email already exist.');
                res.end();
            }
            else {
                db.collection('users').insertOne(body).then(()=> {
                    res.send('Signup success');
                    res.end();
                })
            }
        })
    })
})

//............styles(index.css).....................
app.get('/css', (req, res) => {
    res.sendFile('index.css', { root: path.join(__dirname) }, (err) => {
        if (err) { console.error('Error:', err); res.end() }
    })
});

//............signup page.....................
app.get('/signup', (req, res) => {
    res.sendFile('signup.html', { root: path.join(__dirname) }, (err) => {
        if (err) { console.error('Error:', err); res.end() }
    })
});

//............doctor page.....................
app.get('/doctor', (req, res) => {
    res.sendFile('doctor.html', { root: path.join(__dirname) }, (err) => {
        if (err) { console.error('Error:', err); res.end() }
    })
});

//............receptionist page.....................
app.get('/receptionist', (req, res) => {
    res.sendFile('receptionist.html', { root: path.join(__dirname) }, (err) => {
        if (err) { console.error('Error:', err); res.end() }
    })
});


app.listen(6060);
console.log('http://localhost:6060')