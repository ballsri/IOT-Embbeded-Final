const express = require('express'),
    app = express(),
    request = require('request'),
    mongoose = require('mongoose'),
    path = require('path'),
    cron = require('node-cron')


monconnect = mongoose.connect('mongodb+srv://embedded-final:embedded-final@final.srrbpje.mongodb.net/stm?retryWrites=true&w=majority')
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('port', 80);
const http = require('http');
const server = http.createServer(app);



// Configuration
const cooldown = 5000;
const wateringTime = 4000;
const constLight = 500;  
const constHumid = 1500;




// Global Variable
var isActive = false;
var isDisabled = false;
var isCooldown = false;
var timeend = -1;
var time = -1;
var cooldownEnd = -1;
var cooldownDate = (isCooldown) ? new Date(new Date().getTime() + cooldown) : new Date();



// IP
const nodeIp = 'http://192.168.122.206/'

// Database Schema
const data = mongoose.model('data', new mongoose.Schema({
    humid: {
        type: Number
    },
    light: {
        type: Number
    },
    water: {
        type: Number
    },
    time: {
        type: Date,
        default: Date.now
    }
}, { database: "stm", collection: 'data' }));


// Function
function getTimeLeft(te) {
    if (te === -1) return -1;
    return te - new Date().getTime()
}

function setWaterringAndCooldown(time){
    isDisabled = true;
    isActive = true
    timeend = new Date().getTime() + Number(time);
    setTimeout(() => {
        isDisabled = false
        isActive = false;
        time = -1;
        timeend = -1;
        timeout = null
        isCooldown = true;
        cooldownEnd = new Date().getTime() + cooldown; // Cooldown Time
        setTimeout(() => {
            isCooldown = false;
            cooldownEnd = -1;
        }, cooldown);
    }, time);

}

// Schedule
// set interval to read value from sensor as " sec minutes hour day/months months day/weeks"
cron.schedule("0 */10 * * * *", () => { 
    request(nodeIp + 'getInfo', { json: true }, async (err, response, body) => {
        var humid = response.body.humid;
        var light = response.body.light;
        var water = response.body.water;
        // Exit when value is unreadable
        if (err || response === null || body === null || humid == '' || light =='' || water == '' || isNaN(humid) || isNaN(water) || isNaN(light)) return;

        // Water when value is reached
        if(Number(light) > constLight && Number(humid) < constHumid       ){
            const water = 50;
            request(nodeIp + 'water?amount=' + water, function (error, response, body) {
                time = wateringTime; //ms
                setWaterringAndCooldown(time)
            });
            setTimeout(() => {
                
            }, wateringTime);
        }


        // Create on db
        await data.create({
            humid: humid,
            light: light,
            water: water
        })
    });
})


app.get('/', async (req, res) => {
    var latest = await data.find({}).sort({ time: -1 }).limit(1)
    res.render('index', { isActive: isActive, isDisabled: isDisabled, isCooldown: isCooldown, timeout: getTimeLeft(timeend), latest: latest , cooldownEnd: getTimeLeft(cooldownEnd), cooldownDate : cooldownDate});
})

app.get('/refresh', async (req,res)=>{
    request(nodeIp + 'getInfo', { json: true }, async (err, response, body) => {
        var humid = response.body.humid;
        var light = response.body.light;
        var water = response.body.water;
        // Exit when value is unreadable
        if (err || response === null || body === null || humid == '' || light =='' || water == '' || isNaN(humid) || isNaN(water) || isNaN(light)) return res.redirect('/');

        // Create on db
        await data.create({
            humid: humid,
            light: light,
            water: water
        })
        res.redirect('/')



    });
})


app.post('/getInfo', async (req, res) => {
    res.json(await data.find({}).sort({ time: -1 }).limit(1))
})



app.post('/water', (req, res) => {
    if (isDisabled) return res.json({ status: 'error' })

    const water = Number(req.body.water);

    request(nodeIp + 'water?amount=' + water, function (error, response, body) {
        time = wateringTime; //ms
        setWaterringAndCooldown(time)
        res.json({ status: 'ok' })
    });
})


app.get('/log', async (req, res) => {
    var id = req.query.id
    
    var data_page = await data.aggregate([
        {
            $sort: { time: -1 }
        },
        {
            $skip: Number(id)
        },
        {
            $limit: 9
        }
    ])
    var val = await data.count();
    res.render('logdisp', { data: data_page, id: id, DocSize: val });
})

app.post('/valveOn', (req, res) => {
    if (isActive) { res.json({ error: 'error' }); return }
    request(nodeIp + 'valveOn', function (error, response, body) {
        isActive = true;
        res.json({ status: 'ok' })
    });
})

app.post('/valveOff', (req, res) => {
    if (isActive = false) { res.json({ status: 'error' }); return }
    
    isCooldown = true;
    isActive = false;
    request(nodeIp + 'valveOff', function (error, response, body) {
        cooldownEnd = new Date().getTime() + cooldown; // Cooldown Time
        setTimeout(() => {
            isCooldown = false;
            cooldownEnd = -1;
        }, cooldown);
        res.json({ status: 'ok' })
    });

})



server.listen(app.get('port'), () => {
    console.log('Server is working on port' + app.get('port'));
})