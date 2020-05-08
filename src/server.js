const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors  = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const port = 3000;

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

let db;
const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology:true});

client.connect((err)=>{
    if(err){
        console.error('Problem with DB');
        return;
    }
    db = client.db('store');
    console.log('Successful connection to DB')
});

app.put('/coupon', (req, res) => {
    const coupon = {
        code : req.body.code,
        date : new Date(),
        isRedmee: false
    };
    db.collection('coupons').insertOne(
        coupon, (err, coupon)=>{
       if(err){
           console.log(err);
           res.sendStatus(500);
           return;
       }
       res.sendStatus(201);
    });
});

app.get('/coupon', (req,res)=>{
    db.collection('coupons').find().toArray((err, coupons)=>{
        if(err){
            res.sendStatus(500);
            return;
        }
        res.json(coupons)
    })
});

app.get('/coupon/:id', (req,res)=>{
    db.collection('coupons').findOne({
        _id:ObjectId(req.params.id)
    },(err,coupon)=>{
        if(err){
            console.log(err);
            res.sendStatus(500);
            return;
        }
        res.json(coupon);
    });
});

app.delete('/coupon/:id', (req, res) => {
    db.collection('coupons').findOneAndDelete(
        {
            _id: ObjectId(req.params.id)
        }, (err,report)=> {
            if(report.value === null){
                res.sendStatus(404);
                return;
            }
            res.sendStatus(204)
        }
    )
});

app.post('/coupon/:id', (req, res) => {
    db.collection('coupons').findOne({
        _id:ObjectId(req.params.id)
    }, (err,coupon)=>{
        if(err){
            console.log(err);
            res.sendStatus(500)
            return;
        }
        if(!coupon){
            res.sendStatus(404);
            return;
        }
        db.collection('coupons').updateOne(
            {
                _id:ObjectId(req.params.id)
            },
            {$set: req.body},
            (err) =>{
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }
                res.sendStatus(200);
            }
        );
    });
});

app.post('/coupon/:id/redeem', (req, res) => {
    db.collection('coupons').findOne({
        _id:ObjectId(req.params.id)
    }, (err,coupon)=>{
        if(err){
            console.log(err);
            res.sendStatus(500)
            return;
        }
        if(!coupon){
            res.sendStatus(404);
            return;
        }
        db.collection('coupons').updateOne(
            {
                _id:ObjectId(req.params.id)
            },
            {$set: {isRedmee: true}},
            (err) =>{
                if(err){
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }
                res.sendStatus(200);
            }
        );
    });
});

app.get('/coupon/search/:code', (req, res)=>{
    let couponCode = parseInt(req.params.code);
    db.collection('coupons').findOne({code:couponCode}, (err,coupon)=>{
        if(err){
            console.log(err);
            res.sendStatus(400);
            return;
        }
        if(coupon.length === 0){
            res.sendStatus(404);
            return;
        }
        console.log(couponCode);
        res.json(coupon);
    })
});
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));