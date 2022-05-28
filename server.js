const express = require('express'),
    app = express(),
    request = require('request'),
    mongoose = require('mongoose'),
    path = require('path')
    

    monconnect = mongoose.connect('mongodb+srv://embedded-final:embedded-final@final.srrbpje.mongodb.net/stm?retryWrites=true&w=majority')
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname,'/public')))
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))

var isActive = false;
var isDisabled = false;
var timeend = -1;
var time = -1

const nodeIp = 'http://192.168.179.206/'
const curIp = 'http://192.168.79.86/'

// const isActive = mongoose.model('isActive', new mongoose.Schema({
//     isActive : {
//         type : Boolean
//     }
    
// }, {database: "stm", collection:'isActive'}));

// console.log(isActive.findById("628f90eee7f31d2861ef614b"))




    
app.set('port',80);
const http = require('http');
const server = http.createServer(app);


function getTimeLeft(te){
    if( te === -1) return -1;
    
    return te - new Date().getTime()
}
app.get('/',   (req,res) => {
    // iAT =   isActive.findById("628f90eee7f31d2861ef614b", (err,doc)=>{
    //     if(err) console.log(err);
    //     else console.log(doc)
    // })
    res.render('index', {isActive: isActive,isDisabled:isDisabled, timeout:getTimeLeft(timeend)})
    // console.log(iAT)
})

app.post('/getInfo', (req,res) => {
    request(nodeIp+'getInfo', { json: true }, (err, response, body) => {
    if (err) { return res.json({status:'error', code :"hee"}); }
        // console.log(response);
        // console.log(body.explanation);
        res.json({status:'ok', body:response.body})
    });

})

app.post('/water', (req,res) => {
    if(isDisabled) return res.json({status:'error'})
    const water = Number(req.body.water) + 5;
    // console.log(water)
    request(nodeIp+'water?amount=' + water,  function (error, response, body) {
        time= req.body.time; //ms
        timeend = new Date().getTime() + Number(time);
        setTimeout(() => {
            isDisabled = false
            isActive = false;
            time = -1;
            timeend = -1;
            timeout = null
        }, time);
        isDisabled = true;
        isActive = true
        
        res.json({status:'ok'})
        
    });

})


app.get('/log',   (req,res) => {
    res.render('logdisp');
})

app.post('/valveOn', (req,res) => {
    if(isActive){res.json({error:'error'}); return}
    request(nodeIp+'valveOn',  function (error, response, body) {
        //  isActive.findByIdAndUpdate("628f90eee7f31d2861ef614b", {isActive: true}, (err,rs) => {
        //     if(err) console.log(err);
            
        // })
        isActive = true;
        res.json({status:'ok'})
        
    });

})

app.post('/valveOff', (req,res) => {
    if(isActive = false){res.json({status:'error'}); return}
    request(nodeIp+'valveOff',  function (error, response, body) {
        
            //  isActive.findByIdAndUpdate("628f90eee7f31d2861ef614b", {isActive: false}, (err,rs) => {
            //     if(err) console.log(err);
                
            // })
            isActive = false;
            res.json({status:'ok'})
    });

})





// request('https://192.168.1', { json: true }, (err, res, body) => {
//   if (err) { return console.log(err); }
//   console.log(body.url);
//   console.log(body.explanation);
// });



server.listen(app.get('port'), () =>{
    console.log('Server is working on port'+app.get('port'));
})