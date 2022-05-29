// Controller part
// IMPORTANT
var recheck = 60 * 1000 * 10; // recheck from db
var waterTime = 4000; // Time consuming while watering
var cooldownTime = 5000; // Cooling down after watering time
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

// Chang button srcipt
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
}
function coolToOff() {
    isOn.value = 'off';
    button_status.classList.remove('button-on')
    water_status.innerText = "Water Status: Off"
    button_status.innerHTML = offHTML;
    button_status.disabled = false;
    button_status.classList.add('button-off')
    $('#water-value').html(enableAmount)
}

function setCooldown(ct) {
    if (ct >= 0) {
        setTimeout(() => {
            alert('Cooldown is done, Smart Watering is be able to use');
            coolToOff()
        }, ct);

    }
}

function setWaterTime(wt) {
    if (wt >= 0) {
        setTimeout(() => {
            alert('Watering is done, Now cooling down');
            disToCool()
            setCooldown(cooldownTime)
        }, wt);

    }
}


//check time
var timeout = $('#time').val();
setWaterTime(timeout);

var cooldown = $('#cooldown').val();
setCooldown(cooldown);


setInterval(() => {
    getInfo()
}, recheck);

//by Natts: convert mL to stmProtocal (soc-called bytecode)
function mLtoNodeByteCommand(water_amount) {
    return Math.round(water_amount * 225 / 1000) + 5; // bias 5 number
}

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
        // alert(result.code)
        // window.location.href='/'
    }
}




async function btnStatus() {
    // console.log("wads"); 
    var result;
    // console.log(button_status.innerHTML== offHTML)
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
            disToCool()
            setCooldown(cooldownTime);
        } else {
            alert("Error occured, can't turn off")
            window.location.href = '/'
        }

    }


}


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