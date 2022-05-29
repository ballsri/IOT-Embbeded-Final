// By Natt.s
// this file is for number input handler

function waterAmountChangeHandler(){
    let amountInput = document.getElementById("water-amount");
    amountInput.value = Math.max(4.44, amountInput.value);
    amountInput.value = Math.min(1114.44, amountInput.value);
    
    let afterRound = Math.round(amountInput.value / 4.44) * 4.44;
    amountInput.value = Math.round(afterRound * 100)/100;
    // console.log(mLtoNodeByteCommand(amountInput.value));
}

//-- declared already in function.js --
// function mLtoNodeByteCommand(water_amount){
//     return Math.round(water_amount*225/1000);
// }

//for displaying water in mL in logdisp page
//cuz water data on MongoDB is "stm tick" unit
//which required conversion to mL
