/**
 * COIN FLIP java script functions
 */

var coinflipcontract = "LET round = STATE ( 0 ) LET prevround = PREVSTATE ( 0 ) ASSERT round EQ INC ( prevround ) IF round EQ 1 THEN ASSERT SAMESTATE ( 1 3 ) RETURN VERIFYOUT ( @INPUT @ADDRESS ( @AMOUNT * 2 ) @TOKENID ) ELSEIF round EQ 2 THEN ASSERT SAMESTATE ( 1 5 ) LET ponehash = STATE ( 3 ) LET preimage = STATE ( 6 ) ASSERT SHA3 ( 512 preimage ) EQ ponehash RETURN VERIFYOUT ( @INPUT @ADDRESS @AMOUNT @TOKENID ) ELSEIF round EQ 3 THEN ASSERT SAMESTATE ( 1 6 ) LET ptwohash = STATE ( 5 ) LET preimage = STATE ( 7 ) ASSERT SHA3 ( 512 preimage ) EQ ptwohash LET preimageone = STATE ( 7 ) LET rand = SHA3 ( 512 HEXCAT ( preimageone preimage ) ) ENDIF";
var coinflipaddress  = "0x9961472E32F8DE5CF3044852E39AC1C55955A9CB03D96ED02A17BDFAB2384F50";
var MYGAME_LIST      = [];

function coinFlipInit(){
	//Tell Minima about the smart contract so it knows how to spend it..
	Minima.cmd("extrascript \""+coinflipcontract+"\"");
	
	setBalance();
	
	coinflipPollFunction();
}

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
	
	var decamt = new Decimal(amount);
	if(decamt.lt(0)){
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
	//You need a random number..
	//A winning payout address
	//A key to pay your next go..
	Minima.cmd("random;newaddress;keys new", function(resp){
		var json = JSON.parse(resp);
		
		var rand      = json[0].response.random;
		var myaddress = json[1].response.address.hexaddress;
		var mykey     = json[2].response.key.publickey;
		
		//Now we can use that in a script and get the result to HASH the random number..
		var runscript = 'runscript "LET hash = SHA3 ( 512 '+rand+' )"';
		
		Minima.cmd(runscript, function(resp){
			var json = JSON.parse(resp);
			
			//get the value from variables in JSON
			var hash = json.response.variables.hash;
			
			//MUST STORE THIS NOW.. as we'll need it later
			storeHash(hash,rand);
			
			//Now we can construct the transaction..
			var txnid = Math.floor(Math.random()*1000000000);
			
			//Construct Transaction..
			var txncreator = 
				"txncreate "+txnid+";"+
				//STAGE 0
				"txnstate "+txnid+" 0 0;"+
				//My details
				"txnstate "+txnid+" 1 "+myaddress+";"+
				"txnstate "+txnid+" 2 "+mykey+";"+
				"txnstate "+txnid+" 3 "+hash+";"+
				
				//Now set up the payment..
				"txnauto "+txnid+" "+decamt+" "+coinflipaddress+";"+
				
				//And POST / DELETE
				"txnpost "+txnid+";"+
				"txndelete "+txnid+";";
		
			console.log(txncreator);
			
			Minima.cmd( txncreator , function(resp){
				var json = JSON.parse(resp);
				
				if(!checkAllResponses(json)){
					console.log(resp);
					alert("Something went wrong!  Check console..");
					return;
				}
				
				alert("Game STARTED!");
		    });
		});	
	});
}

function checkAllResponses(responses){
	len = responses.length;
	for(i=0;i<len;i++){
		if(responses[i].status != true){
			return false;
		}
	}
	return true;
}

//Store the preimage of the hash value
function storeHash(hash, value){
	var name = 'COINFLIP_'+hash;
	window.localStorage.setItem(name,value);
}

//get the preimage..
function loadPreHash(hash){
	var name = 'COINFLIP_'+hash;
	return window.localStorage.getItem(name);
}

//Called on newblock
function coinflipPollFunction(){
	setTime();
	
	updateMyGames();
	
	updateAvailable();
}

function getStateVariable(prevstate, prevstate_number){
	var pslen = prevstate.length;
	for(psloop=0;psloop<pslen;psloop++){
		if(prevstate[psloop].port == prevstate_number){
			return prevstate[psloop].data;
		}
	}
	
	//Not found
	return null;
}

function checkCoinIDMyGames(coinid){
	var mg = MYGAME_LIST.length;
	for(mgi=0;mgi<mg;mgi++){
		if(coinid == MYGAME_LIST[mgi]){
			return true;
		}
	}
	return false;
}

function updateAvailable(){
	//Search for available games..
	Minima.cmd("search "+coinflipaddress, function(resp){
		var json = JSON.parse(resp);
		
		var avail = '<table style="width:100%;">';
		len = json.response.coins.length;
		for(i=0;i<len;i++){
			coin = json.response.coins[i];
			
			//Is this at ROUND 0
			round  = getStateVariable(coin.data.prevstate,0);
			
			//P1 details
			p1address = getStateVariable(coin.data.prevstate,1);
			p1keys    = getStateVariable(coin.data.prevstate,2);
			p1hash    = getStateVariable(coin.data.prevstate,3);
			
			amount = coin.data.coin.amount;
			coinid = coin.data.coin.coinid;
			
			if(round == 0){
				//Its available!
				avail+='<tr><td class="availablebox" '
				+'onclick="acceptGame(\''+coinid+'\', \''+amount+'\' , \''+p1address+'\', \''+p1keys+'\', \''+p1hash+'\');">'+amount+'</td></tr>';
			}
		}
		avail+="</table>"
		
		document.getElementById("availablegames").innerHTML = avail;	
	});
	
}

var once = false;
function updateMyGames(){
	Minima.cmd("coins "+coinflipaddress, function(resp){
		var json = JSON.parse(resp);
		
		var mygames = '<table width=100% border=0>'
			+'<tr style="height:20;font-size:20;"> '
			+'<th>AMOUNT</th> <th>STAGE</th> <th>RESULT</th> </tr>';
		
		//Clear the list..
		MYGAME_LIST = [];
		
		len = json.response.coins.length;
		for(i=0;i<len;i++){
			coin = json.response.coins[i];
		
			round   = getStateVariable(coin.data.prevstate,0);
			amount  = coin.data.coin.amount;
			coinid  = coin.data.coin.coinid;
			depth   = Minima.block - coin.data.inblock;
			
			MYGAME_LIST.push(coinid); 
			
			mygames+='<tr class="bluebox"><td class="bluebox">'+amount+'</td> '
			+'<td class="bluebox">'+round+'/3</td>';
			
			if(round == 0){
				mygames +=' <td class="bluebox">waiting..</td> </tr>';	
			
			}else if(round == 1){
				//STATE details that need to be kept..
				p1addr   = getStateVariable(coin.data.prevstate,1);
				p1keys   = getStateVariable(coin.data.prevstate,2);
				p1hash   = getStateVariable(coin.data.prevstate,3);
				p2keys   = getStateVariable(coin.data.prevstate,4);
				p2hash   = getStateVariable(coin.data.prevstate,5);
				
				//Are we deep enuogh to play on..
				if(depth>3){
					mygames +=' <td class="bluebox">PLAYER 1 REVEAL</td> </tr>';
					
					//PLAY ON.. PLAYER 1 reveals his Random number..
					Minima.cmd("check "+p1keys, function(resp){
						var json = JSON.parse(resp);
					
						//Are you player 1 ?
						if(json.response.relevant == true){
							//Continue!
							if(!once){
								console.log("ROUND 1!");
								once = true;
								roundOne(coinid, amount, p1addr, p1keys, p1hash, p2keys, p2hash);	
							}
							
						}
					});
					
					//Safety mechanism is P1 tries not to complete
					if(depth>30){
						//PLAYER 2 CAN JUST COLLECT EVERYTHING!
						//..
					}
					
				}else{
					mygames +=' <td class="bluebox">STARTED! '+depth+' deep.. </td> </tr>';	
				}
				
			}else if(round == 2){
				p1addr   = getStateVariable(coin.data.prevstate,1);
				p1keys   = getStateVariable(coin.data.prevstate,2);
				p1hash   = getStateVariable(coin.data.prevstate,3);
				
				p2keys   = getStateVariable(coin.data.prevstate,4);
				p2hash   = getStateVariable(coin.data.prevstate,5);
				
				//Are we deep enuogh to play on..
				if(depth>3){
					mygames +=' <td class="bluebox">PLAYER 2 REVEAL</td> </tr>';
					
					//PLAY ON.. PLAYER 1 reveals his Random number..
					Minima.cmd("check "+p2keys, function(resp){
						var json = JSON.parse(resp);
					
						//Are you player 1 ?
						if(json.response.relevant == true){
							//Continue!
							console.log("ROUND 2!");
//							roundOne(coinid, amount, p1addr, p1keys, p1hash, p2keys, p2hash);
						}
					});
					
					//Safety mechanism if P2 tries not to complete
					if(depth>30){
						//PLAYER 1 CAN JUST COLLECT EVERYTHING!
						//..
					}	
				}
			}	
		}
	
		mygames += "</table>";
		document.getElementById("mygames").innerHTML = mygames;
	});
}

function acceptGame(coinid, gameamount, p1address, p1keys, p1hash){
	if(!confirm("Confirm accept game for "+gameamount+" Minima ?")){
		return;
	}

	//First get all the details..
	Minima.cmd("random;keys new", function(resp){
		var json = JSON.parse(resp);
		
		//Now you have that coin + details..
		amtx2      = new Decimal(gameamount).mul(2);
		var rand   = json[0].response.random;
		var mykey  = json[1].response.key.publickey;
		
		//Now we can use that in a script and get the result to HASH the random number..
		var runscript = 'runscript "LET hash = SHA3 ( 512 '+rand+' )"';
		
		Minima.cmd(runscript, function(resp){
			var json = JSON.parse(resp);
			
			//get the value from variables in JSON
			var hash = json.response.variables.hash;
			
			//MUST STORE THIS NOW.. as we'll need it later
			storeHash(hash,rand);
			
			//Now we can construct the transaction..
			var txnid = Math.floor(Math.random()*1000000000);
				
			//Construct Transaction..
			var txncreator = 
				"txncreate "+txnid+";"+
				//STAGE 1
				"txnstate "+txnid+" 0 1;"+
				//Copy the previous details..
				"txnstate "+txnid+" 1 "+p1address+";"+
				"txnstate "+txnid+" 2 "+p1keys+";"+
				"txnstate "+txnid+" 3 "+p1hash+";"+
				//Add your details..
				"txnstate "+txnid+" 4 "+mykey+";"+
				"txnstate "+txnid+" 5 "+hash+";"+
				
				//Now create.. but not for right amount..
				"txnauto "+txnid+" "+gameamount+" "+coinflipaddress+" 0x00;"+
				//Now add the game output at pos 0
				"txninput "+txnid+" "+coinid+" 0;"+
				//Now remove the old output
				"txnremoutput "+txnid+" 0;"+
				//And ADD a double amount.. at pos 0
				"txnoutput "+txnid+" "+amtx2+" "+coinflipaddress+" 0x00 0;"+
				//NOW SIGN
				"txnsignauto "+txnid+";"+
				//NOW POST!	
				"txnpost "+txnid+";"+
				//And cleanup..
				"txndelete "+txnid+";";
				
				//PHEW.!! ;-p
			Minima.cmd(txncreator, function(resp){
				var json = JSON.parse(resp);
				if(!checkAllResponses(json)){
					console.log(resp);
					alert("Something went wrong! ");	
				}else{
					alert("Game ON!");	
				}
			});
		});
	});
}

function roundOne(coinid, gameamount, p1address, p1keys, p1hash, p2keys, p2hash){
	//Get the preimage..
	var preimage = loadPreHash(p1hash);
	
	//Now we can construct the transaction..
	var txnid = Math.floor(Math.random()*1000000000);
		
	//Construct Transaction..
	var txncreator = 
		"txncreate "+txnid+";"+
		//STAGE 1
		"txnstate "+txnid+" 0 2;"+
		
		//Copy the previous details..
		"txnstate "+txnid+" 1 "+p1address+";"+
		"txnstate "+txnid+" 2 "+p1keys+";"+
		"txnstate "+txnid+" 3 "+p1hash+";"+
		"txnstate "+txnid+" 4 "+p2keys+";"+
		"txnstate "+txnid+" 5 "+p2hash+";"+
		"txnstate "+txnid+" 6 "+preimage+";"+
		
		//Now add the game as input
		"txninput "+txnid+" "+coinid+";"+
		//And the same amount/addres as an output
		"txnoutput "+txnid+" "+gameamount+" "+coinflipaddress+" 0x00;"+
		
		//And sign with the P1KEY
		"txnsign "+txnid+" "+p1keys+";";
		
//		//NOW POST!	
//		"txnpost "+txnid+";"+
//		//And cleanup..
//		"txndelete "+txnid+";";
//		
	Minima.cmd(txncreator, function(resp){
		var json = JSON.parse(resp);
		if(!checkAllResponses(json)){
			console.log(resp);
			alert("Something went wrong! Check console.. :(");	
		}
	});	
	
}

function roundTwo(){
	
}


