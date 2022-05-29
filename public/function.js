


//check time
var timeout = $('#time').val();
// console.log(timeout)
if(  timeout >=0){
    setTimeout(() => {
        alert('Watering is done');
        window.location.href='/'
    }, timeout);

}

setInterval(() => {
    getInfo()
}, 60000);

const disableAmount = ' <label for="Amount" class="form__fieldblock">Wait for Watering ...</label>'
const enableAmount = ' <input type="input" class="form__field" placeholder="Amount" name="Amount" id="water-amount" required /><label for="Amount" class="form__label">Amount</label><button class="button button-log" onclick="sendWater()" id="submit-water">Submit</button>'

//by Natts: convert mL to stmProtocal (soc-called bytecode)
function mLtoNodeByteCommand(water_amount){
    return Math.round(water_amount*225/1000) +5; // bias 5 number
}

async function getInfo(){

    const server ='http://192.168.79.86/';

    const result = await fetch('/getInfo', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        
        },
        body:JSON.stringify({

        })
    }).then((res)=> res.json())

    if(result.status == "ok"){
        // console.log(result.body)
        $('#humid').html(result.body.humid);
        $('#light').html(result.body.light);
        $('#water').html(result.body.water);


    } else {
        // alert(result.code)
        // window.location.href='/'
    }
}

const button_status = document.getElementById("button-status");

const water_status = document.getElementById("water-status");
// console.log("asd");


//const template for on/off button
const onHTML = "<p>ON</p>"
const offHTML = "<p>OFF</p>"
const lodingHTML = '<lottie-player src="https://assets2.lottiefiles.com/packages/lf20_Stt1R6.json" background="transparent"  speed="1.2" loop  autoplay></lottie-player>'

async function btnStatus(){
    // console.log("wads"); 
    var result;
    if(button_status.innerText == "OFF"){
        console.log(button_status.innerText)
        // just for testing
        button_status.innerHTML = lodingHTML;
        button_status.setAttribute("loading", true);
        // just for testing

        result = await fetch('/valveOn', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            
            },
            body:JSON.stringify({
    
            })
        }).then((res)=> res.json())
    
        if(result.status == "ok"){
            // console.log(result.body)
              water_status.innerText="Water Status: On"
                button_status.innerHTML = onHTML;
                button_status.style.backgroundColor = "#1abc9c" ;
                $('#water-value').html(disableAmount)
                
    
        } else {
            alert("Error occured, can't turn on")
            window.location.href='/'
        }
      

    } else{
        // console.log(button_status.innerText)
        result = await fetch('/valveOff', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            
            },
            body:JSON.stringify({
    
            })
        }).then((res)=> res.json())
    // console.log(result.status)
        if(result.status == "ok"){
            // console.log(result.body)
            water_status.innerText="Water Status: Off"
            button_status.innerText= "COOLING DOWN";
            button_status.style.backgroundColor = "#1abc9c" ;
            $('#water-value').html(disableAmount)
                
            setTimeout(() => {
                alert('Cooldown is done');
                
                water_status.innerText="Water Status: Off"
                button_status.innerHTML= offHTML;
                button_status.style.backgroundColor = "#34495e" ;
                $('#water-value').html(enableAmount)
               
            }, 5000); // IMPORTANT time to control cooldown interval
        } else {
            alert("Error occured, can't turn off")
            window.location.href='/'
        }
        
        
        
    }

    
}


async function sendWater(){
    const precalcWater = document.getElementById("water-amount").value;
    const water = mLtoNodeByteCommand(precalcWater);
    // console.log(water)
    var result;

        result = await fetch('/water', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            
            },
            body:JSON.stringify({
                water:water,
                time: 4000 // time calculated by water's input IMPORTANT

    
            })
        }).then((res)=> res.json())
    
        if(result.status == "ok"){
            // console.log(result.body)
                water_status.innerText="Water Status: On"
                button_status.innerText = "DISABLED";
                button_status.disabled = true;
                button_status.style.backgroundColor = "#34495e" ;
                $('#water-value').html(disableAmount)
    
                setTimeout(() => {
                    alert('Watering is done');
                    button_status.disabled = false;
                    water_status.innerText="Water Status: Off"
                    button_status.innerText = "OFF";
                    button_status.style.backgroundColor = "#34495e" ;
                    $('#water-value').html(enableAmount)
          
                }, 5000);
                
        } else {
            alert("Error occured, can't turn on")
            window.location.href='/'
        }
      

    

    
}