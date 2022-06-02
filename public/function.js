// Controller part
// IMPORTANT
const recheck = 60 * 1000 * 10; // recheck from db
const waterTime = 4000; // Time consuming while watering
const cooldownTime = 5000; // Cooling down after watering time
// IMPORTANT

// HTML GETTER
const button_status = document.getElementById("button-status");
const water_status = document.getElementById("water-status");
const isOn = document.getElementById("isOn");

//HTML template
const disableAmount = ' <label for="Amount" class="form__fieldblock">Wait for Watering ...</label>'
const enableAmount = ' <div class="form__box field" id="water-value"><input type="number" class="form__field" placeholder="Amount" name="Amount" id="water-amount"required min="4.44" max="1114.44" step="4.44" onchange="waterAmountChangeHandler()" /><label for="water-amount" class="form__label">Amount (mL)</label></div><button class="button button-log" id="submit-water" onclick="sendWater()">Submit</button>'
//const template for on/off button
const onHTML = "<p>ON</p>"
const offHTML = "<p>OFF</p>"
const loadingHTML = '<lottie-player src="https://assets2.lottiefiles.com/packages/lf20_Stt1R6.json" background="transparent"  speed="1.2" loop  autoplay></lottie-player>'

// Change button srcipt
function loading() {
    button_status.innerHTML = loadingHTML;
    button_status.setAttribute("loading", '');
    button_status.disabled = true;
    $('#water-value').html(disableAmount)
}

function offToOn() {
    button_status.disabled = false;
    isOn.value = 'on';
    button_status.classList.remove('button-off')
    button_status.classList.add('button-on')

    water_status.innerText = "Water Status: On"
    button_status.innerHTML = onHTML;
}

function offToDis() {
    water_status.innerText = "Water Status: On"
    button_status.innerText = "DISABLE";
    button_status.disabled = true;
    $('#water-value').html(disableAmount)
}

function disToCool() {
    button_status.classList.remove('button-off')
    button_status.classList.add('button-on')
    isOn.value = 'off'
    water_status.innerText = "Water Status: Off"
    button_status.innerText = "COOLING DOWN";
    button_status.disabled = true;
    $('#water-value').html(disableAmount)
    document.getElementById("cdTime").classList.remove("hidden");
}
function coolToOff() {
    isOn.value = 'off';
    button_status.classList.remove('button-on')
    water_status.innerText = "Water Status: Off"
    button_status.innerHTML = offHTML;
    button_status.disabled = false;
    button_status.classList.add('button-off')
    $('#water-value').html(enableAmount)
    document.getElementById("cdTime").classList.add("hidden");
    document.getElementById("cooldownTime").innerHTML=""
}


// Counter function

// Realtime Clock
setInterval(() => {
    var realtime = new Date();
    var hour = realtime.getHours();
    var minute = realtime.getMinutes();
    var second = realtime.getSeconds();
    hour = ("0" + hour).slice(-2);
    minute = ("0" + minute).slice(-2);
    second  = ("0" + second).slice(-2);
    document.getElementById("clock").innerHTML = hour + " : " + minute + " : " + second;
  }, 1000);


// Cooldown counter
var cdInterval;
var counter = cooldownTime;
function fnCD(ct,timeend) {
            
    var cdtime = ct;
    var now = new Date().getTime();
    var timeDif = timeend - now;
    if(timeDif < 0) timeDif = 0;
    timeDif = Math.floor(timeDif/1000);
    var hourleft = Math.floor(timeDif/3600);
    timeDif = timeDif%3600;
    var minuteleft = Math.floor(timeDif/60);
    timeDif = timeDif % 60;
    var secondleft = timeDif;
 
    hourleft = ("0" + hourleft).slice(-2);
    minuteleft = ("0" + minuteleft).slice(-2);
    secondleft  = ("0" + secondleft).slice(-2);

    document.getElementById("cooldownTime").innerHTML = hourleft + " : " + minuteleft + " : " + secondleft;
    
    // console.log(counter)
    if(now > timeend){
            alert('Cooldown is done, Smart Watering is be able to use');
            clearInterval(cdInterval);
            coolToOff()
    }
  }
// Cooldown interval
function setCooldown(ct) {
    
    ct = Number(ct)
    if (ct >= 0) {
    
        counter = ct;
        var timeend = new Date().getTime()+ct+1500
        
     
        document.getElementById("cdTime").classList.remove("hidden");
        cdInterval = setInterval(()=>{
            fnCD(counter,timeend)
            counter -= 1000;
        }, 1000);
        
        

    }
}
// Watering time
function setWaterTime(wt) {
    if (wt >= 0) {
        setTimeout(() => {
            alert('Watering is done, Now cooling down');
            disToCool()
            setCooldown(cooldownTime)
        }, wt);

    }
}


// check time from backend
var timeout = $('#time').val();
setWaterTime(timeout);

var cooldown = $('#cooldown').val();
setCooldown(cooldown);

// update info from db
setInterval(() => {
    getInfo()
}, recheck);

//by Natts: convert mL to stmProtocal (soc-called bytecode)
function mLtoNodeByteCommand(water_amount) {
    return Math.round(water_amount * 225 / 1000) + 5; // bias 5 number
}

// Retrieve info from db
async function getInfo() {
    const result = await fetch('/getInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({

        })
    }).then((res) => res.json())

    if (result.status == "ok") {
        // console.log(result.body)
        $('#humid').html(result.body.humid);
        $('#light').html(result.body.light);
        $('#water').html(result.body.water);


    } else {
       
    }
}



// Change button 
async function btnStatus() {

    var result;

    if (isOn.value == 'off') {

        loading();


        result = await fetch('/valveOn', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'

            },
            body: JSON.stringify({

            })
        }).then((res) => res.json())

        if (result.status == "ok") {
            button_status.removeAttribute("loading");
            offToOn();
        } else {
            alert("Error occured, can't turn on")
            window.location.href = '/'
        }


    } else if (isOn.value == "on") {
        loading()

        result = await fetch('/valveOff', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'

            },
            body: JSON.stringify({

            })
        }).then((res) => res.json())

        if (result.status == "ok") {
            button_status.removeAttribute("loading");
            setCooldown(cooldownTime);
            disToCool()
        } else {
            alert("Error occured, can't turn off")
            window.location.href = '/'
        }

    }


}

// Send amount of water to backend
async function sendWater() {
    const precalcWater = document.getElementById("water-amount").value;
    const water = mLtoNodeByteCommand(precalcWater);
    loading();

    var result;

    result = await fetch('/water', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            water: water,
            time: waterTime // time calculated by water's input IMPORTANT


        })
    }).then((res) => res.json())

    if (result.status == "ok") {
        button_status.removeAttribute("loading");

        offToDis();

        setWaterTime(waterTime);
        

    } else {
        alert("Error occured, can't turn on")
        window.location.href = '/'
    }





}