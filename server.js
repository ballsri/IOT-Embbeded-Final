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


var isActive = false;
var isDisabled = false;
var isCooldown = false;
var timeend = -1;
var time = -1;
var cooldownEnd = -1;
var cooldown = 5000;

const nodeIp = 'http://192.168.100.241/'


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



function getTimeLeft(te) {
    if (te === -1) return -1;
    return te - new Date().getTime()
}


// set interval to read value from sensor as " sec minutes hour day/months months day/weeks"
cron.schedule("0 */10 * * * *", () => { 
    request(nodeIp + 'getInfo', { json: true }, async (err, response, body) => {
        if (err || response === null || body === null || isNaN(response.body.humid) || isNaN(response.body.light) || isNaN(response.body.water)) return;
        await data.create({
            humid: response.body.humid,
            light: response.body.light,
            water: response.body.water
        })
    });
})


app.get('/', async (req, res) => {
    var latest = await data.find({}).sort({ time: -1 }).limit(1)
    res.render('index', { isActive: isActive, isDisabled: isDisabled, isCooldown: isCooldown, timeout: getTimeLeft(timeend), latest: latest, cooldownEnd: getTimeLeft(cooldownEnd) });
})


app.post('/getInfo', async (req, res) => {
    res.json(await data.find({}).sort({ time: -1 }).limit(1))
})



app.post('/water', (req, res) => {
    if (isDisabled) return res.json({ status: 'error' })
    const water = Number(req.body.water);
    // console.log(water)
    request(nodeIp + 'water?amount=' + water, function (error, response, body) {
        time = req.body.time; //ms
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
            cooldownEnd = new Date().getTime() + Number(1000 * 5); // Cooldown Time
            setTimeout(() => {
                isCooldown = false;
                cooldownEnd = -1;
            }, cooldown);
        }, time);
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
        cooldownEnd = new Date().getTime() + Number(5000); // Cooldown Time
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