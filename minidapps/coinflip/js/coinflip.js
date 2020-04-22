/**
 * COIN FLIP java script functions
 */

function setTime(){
	//Set the right time
	document.getElementById("blocktime").innerHTML = "<b>BLOCKTIME : "+Minima.block+"</b>";	
}

function setBalance(){
	//Set the Balance..
	var bal     = Minima.balance.balance[0].confirmed;
	var balun   = Minima.balance.balance[0].unconfirmed;
	var mempool = Minima.balance.balance[0].mempool;
	
	//Is there unconfirmed money coming..
	if(balun !== "0" || mempool !== "0"){
		document.getElementById("balance").innerHTML = "<b>BALANCE : "+bal+" / "+balun+" / "+mempool+"</b>";	
	}else{
		document.getElementById("balance").innerHTML = "<b>BALANCE : "+bal+"</b>";
	}
}

function letsplay(){
	//Get the amount..
	var amount = document.getElementById("newamount").value.trim();
	
	if(amount == "" || amount == "0"){
		alert("NO amount set..!");
		return;
	}
	
	var amt = new Decimal(amount);
	if(amt.lt(0)){
		//Clear the old..
		document.getElementById("newamount").value = 0;
		alert("Cannot play with NEGATIVE amount..");
		return;
	}
	
	//Final Confirm..
	confirm("Are you sure you want to play for "+amount+" Minima ?");
	
	//Clear the old..
	document.getElementById("newamount").value = 0;
	
	//Lets Play..!
}