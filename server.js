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
        db.collection('tokens').updateOne({id:req.body.id},{$set:{status:"check-up done",fees:req.body.fees}}).then(()=>{
            db.collection('tokens').find({}).toArray().then(data => {
                res.send(data);
                res.end();
            })
        })
    })
})

//check-done
app.put('/payment-done', (req, res) => {
    mongoClient.connect(conStr).then(clientObject => {
        const db = clientObject.db('clinic');
        db.collection('tokens').updateOne({id:req.body.id},{$set:{status:"completed"}}).then(()=>{
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

//admin login
app.post('/admin-login',(req,res)=>{
    const body = req.body;
    mongoClient.connect(conStr).then(clientObject => {
        const db = clientObject.db('clinic');
        db.collection('admin').findOne(body).then(data => {
            res.send(data);
            res.end();
        })
    })
})
//all users
app.get('/users',(req,res)=>{
    mongoClient.connect(conStr).then(clientObject => {
        const db = clientObject.db('clinic');
        db.collection('users').find({}).toArray().then(data => {
            res.send(data);
            res.end();
        })
    })
})
//delete user
app.delete('/delete-user/:email',(req,res)=>{
    mongoClient.connect(conStr).then(clientObject=>{
        const db=clientObject.db('clinic');
        db.collection('users').deleteOne({email:req.params.email}).then(()=>{
            db.collection('users').find({}).toArray().then((users)=>{
                res.send(users);res.end();
            })
        })
    })
})

//delete completed appointments
app.delete('/remove-completed',(req,res)=>{
    mongoClient.connect(conStr).then(clientObject=>{
        const db=clientObject.db('clinic');
        db.collection('tokens').deleteMany({status:'completed'}).then(()=>{
            db.collection('tokens').find({}).toArray().then((users)=>{
                res.send(users);res.end();
            })
        })
    })
})

//send files from server
function sendResource(route,resource){
    app.get(route, (req, res) => {
        res.sendFile(resource, { root: path.join(__dirname) }, (err) => {
            if (err) { console.error('Error:', err); res.end() }
        })
    });
}
//index.html
sendResource('/','index.html');

//............styles(index.css).....................
sendResource('/css','index.css');

//............favicon.....................
sendResource('/favicon','favicon.png');

//............signup page.....................
sendResource('/signup','signup.html');


//............admin page.....................
sendResource('/admin','admin.html');

//............admin-dashboard page.....................
sendResource('/admin-dashboard','admin-dashboard.html');

//............doctor page.....................
sendResource('/doctor','doctor.html');

//............receptionist page.....................
sendResource('/receptionist','receptionist.html');


app.listen(6060);
console.log('http://localhost:6060')