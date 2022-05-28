


//check time
var timeout = $('#time').val();
// console.log(timeout)
if(  timeout >=0){
    setTimeout(() => {
        alert('Watering is done');
        window.location.href='/'
    }, timeout);

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

    if(result.status == 200){
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

async function btnStatus(){
    // console.log("wads"); 
    var result;
    if(button_status.innerText == "OFF"){
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
                button_status.innerText = "ON";
                button_status.style.backgroundColor = "#1abc9c" ;
                $('#water-value').html(' <label for="Amount" class="form__fieldblock">Wait for Watering ...</label>')
                
    
        } else {
            alert("Error occured, can't turn on")
            window.location.href='/'
        }
      

    } else{

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
            button_status.innerText= "OFF";
            button_status.style.backgroundColor = "#34495e" ;
            $('#water-value').html(' <input type="input" class="form__field" placeholder="Amount" name="Amount" id="water-amount" required /><label for="Amount" class="form__label">Amount</label><button class="button button-log" onclick="sendWater()" id="submit-water">Submit</button>')
           
        } else {
            alert("Error occured, can't turn off")
            window.location.href='/'
        }
        
        
        
    }

    
}


async function sendWater(){
    const water = document.getElementById("water-amount").value;
    // console.log(water)
    var result;

        result = await fetch('/water', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            
            },
            body:JSON.stringify({
                water:water,
                time: 4000

    
            })
        }).then((res)=> res.json())
    
        if(result.status == "ok"){
            // console.log(result.body)
                water_status.innerText="Water Status: On"
                button_status.innerText = "DISABLED";
                button_status.disabled = true;
                button_status.style.backgroundColor = "#34495e" ;
                $('#water-value').html('<label for="Amount" class="form__fieldblock">Wait for Watering ...</lab')
    
                setTimeout(() => {
                    button_status.disabled = false;
                    water_status.innerText="Water Status: Off"
                    button_status.innerText = "OFF";
                    button_status.style.backgroundColor = "#34495e" ;
                    $('#water-value').html(' <input type="input" class="form__field" placeholder="Amount" name="Amount" id="water-amount" required /><label for="Amount" class="form__label">Amount</label><button class="button button-log" onclick="sendWater()" id="submit-water">Submit</button>')
          
                }, 5000);
                
        } else {
            alert("Error occured, can't turn on")
            window.location.href='/'
        }
      

    

    
}