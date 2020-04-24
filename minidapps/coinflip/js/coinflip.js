/**
 * COIN FLIP java script functions
 */

var coinflipcontract = "LET round = STATE ( 0 ) LET prevround = PREVSTATE ( 0 ) ASSERT round EQ INC ( prevround ) IF round EQ 1 THEN IF SIGNEDBY ( PREVSTATE ( 2 ) ) THEN RETURN TRUE ENDIF ASSERT SAMESTATE ( 1 3 ) RETURN VERIFYOUT ( @INPUT @ADDRESS ( @AMOUNT * 2 ) @TOKENID ) ELSEIF round EQ 2 THEN IF @BLKDIFF GT 64 AND SIGNEDBY ( PREVSTATE ( 4 ) ) THEN RETURN TRUE ENDIF ASSERT SAMESTATE ( 1 5 ) LET ponehash = STATE ( 3 ) LET preimage = STATE ( 6 ) ASSERT SHA3 ( 512 preimage ) EQ ponehash RETURN VERIFYOUT ( @INPUT @ADDRESS @AMOUNT @TOKENID ) ELSEIF round EQ 3 THEN IF @BLKDIFF GT 64 AND SIGNEDBY ( PREVSTATE ( 2 ) ) THEN RETURN TRUE ENDIF ASSERT SAMESTATE ( 1 6 ) LET ptwohash = STATE ( 5 ) LET ptwopreimage = STATE ( 7 ) ASSERT SHA3 ( 512 ptwopreimage ) EQ ptwohash LET ponepreimage = STATE ( 6 ) LET rand = SHA3 ( 512 HEXCAT ( ponepreimage ptwopreimage ) ) LET val = NUMBER ( SUBSET ( 0 1 rand ) ) IF ( val LT 128 ) THEN LET winner = 1 ELSE LET winner = 2 ENDIF LET paywinner = @AMOUNT * 0.95 LET payloser = @AMOUNT - paywinner ASSERT STATE ( 8 ) EQ winner ASSERT STATE ( 9 ) EQ paywinner LET poneaddress = STATE ( 1 ) IF winner EQ 1 THEN ASSERT VERIFYOUT ( @INPUT poneaddress paywinner @TOKENID ) ELSE ASSERT VERIFYOUT ( @INPUT poneaddress payloser @TOKENID ) ENDIF RETURN SIGNEDBY ( PREVSTATE ( 4 ) ) ENDIF";
var coinflipaddress  = "0x13F484D30BC6776A1050C90FF9B87CDB8EA8FC0333E206B4D2E71D012505BA43";

var MYGAME_LIST      = [];
var MYGAME_KEYS      = [];
var MYGAME_COINID    = [];

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
		
		//Store keys for later
		MYGAME_KEYS.push(mykey);
		
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
			
			Minima.cmd( txncreator , function(resp){
				var json = JSON.parse(resp);
				
				if(!checkAllResponses(json)){
					console.log(resp);
					alert("Something went wrong!  Check console..");
					return;
				}
				
				alert("Game Request Posted..!\n\nAwaiting Player..");
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

function getStateVariable(statevarlist, state_port){
	var pslen = statevarlist.length;
	for(psloop=0;psloop<pslen;psloop++){
		if(statevarlist[psloop].port == state_port){
			return statevarlist[psloop].data;
		}
	}
	
	//Not found..
	return "0x00";
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
}

function updateMyGames(){
	Minima.cmd("search "+coinflipaddress+";coins all", function(resp){
		var alljson = JSON.parse(resp);
		
		//FIRST DO MY GAMES.. And fill up MYGAME_LIST..
		var mygames = '<table width=100% border=0>'
			+'<tr style="height:20;font-size:20;"> '
			+'<th width=30%>AMOUNT</th> <th width=30%>ROUND</th> <th width=30%>STAGE</th> </tr>';
		
		//Clear the list..
		MYGAME_LIST = [];
		
		coinlist = alljson[1].response.coins;
		len = coinlist.length;
		
		//Sort by time..
		coinlist.sort(compareCoin);
		for(i=0;i<len;i++){
			coin = coinlist[i];
		
			round   = getStateVariable(coin.data.prevstate,0);
			amount  = new Decimal(coin.data.coin.amount);
			coinid  = coin.data.coin.coinid;
			depth   = Minima.block - coin.data.inblock;
			spent   = coin.data.spent;
			
			//Is theis the Coin Flip Address
			rightaddress = ( coin.data.coin.address == coinflipaddress );
			
			MYGAME_LIST.push(coinid); 
			
			if(round == 0  && !spent && rightaddress){
				mygames+='<tr class="bluebox"><td class="bluebox">'+amount+'</td> '
				+'<td class="bluebox">'+round+'/3</td>';
				
				if(depth<=3){
					mygames +=' <td class="bluebox">Waiting.. '+depth+' / 3 .. </td> </tr>';	
				}else{
					mygames +=' <td class="bluebox">Waiting 4 Player.. </td> </tr>';
				}				
			}else if(round == 1 && !spent && rightaddress){
				mygames+='<tr class="bluebox"><td class="bluebox">'+amount+'</td> '
				+'<td class="bluebox">'+round+' / 3</td>';
				
				//STATE details that need to be kept..
				p1addr   = getStateVariable(coin.data.prevstate,1);
				p1keys   = getStateVariable(coin.data.prevstate,2);
				p1hash   = getStateVariable(coin.data.prevstate,3);
				p2keys   = getStateVariable(coin.data.prevstate,4);
				p2hash   = getStateVariable(coin.data.prevstate,5);
				
				//Are we deep enuogh to play on..
				if(depth>3){
					mygames +=' <td class="bluebox">PLAYER 1 REVEAL ( '+depth+' )</td> </tr>';
					
					//PLAY ON.. PLAYER 1 reveals his Random number..
					Minima.cmd("check "+p1keys, function(resp){
						var json = JSON.parse(resp);
					
						//Are you player 1 ?
						if(json.response.relevant == true){
							if(!MYGAME_COINID.includes(coinid)){
								//Continue! - need to make sure not to KEEP calling this.. (it fails as a double spend but cleaber like this.. REFRESH if in trouble)
								roundOne(coinid, amount, p1addr, p1keys, p1hash, p2keys, p2hash);
							}	
						}
					});
					
					//Safety mechanism is P1 tries not to complete
					if(depth>64){
						//PLAYER 2 CAN JUST COLLECT EVERYTHING!
						//..
					}
					
				}else{
					mygames +=' <td class="bluebox">'+depth+' / 3 .. </td> </tr>';	
				}
				
			}else if(round == 2 && !spent && rightaddress){
				mygames+='<tr class="bluebox"><td class="bluebox">'+amount+'</td> '
				+'<td class="bluebox">'+round+' / 3</td>';
				
				p1addr   = getStateVariable(coin.data.prevstate,1);
				p1keys   = getStateVariable(coin.data.prevstate,2);
				p1hash   = getStateVariable(coin.data.prevstate,3);
				
				p2keys   = getStateVariable(coin.data.prevstate,4);
				p2hash   = getStateVariable(coin.data.prevstate,5);
				
				p1preimage = getStateVariable(coin.data.prevstate,6);
				
				//Are we deep enuogh to play on..
				if(depth>3){
					mygames +=' <td class="bluebox">PLAYER 2 REVEAL ( '+depth+' )</td> </tr>';
					
					//PLAY ON.. PLAYER 1 reveals his Random number..
					Minima.cmd("check "+p2keys, function(resp){
						var json = JSON.parse(resp);
					
						//Are you player 1 ?
						if(json.response.relevant == true){
							if(!MYGAME_COINID.includes(coinid)){
								//Continue!
								roundTwo(coinid, amount, p1addr, p1keys, p1hash, p2keys, p2hash, p1preimage);
							}
						}
					});
					
					//Safety mechanism if P2 tries not to complete
					if(depth>64){
						//PLAYER 1 CAN JUST COLLECT EVERYTHING!
						//..
					}	
				}else{
					mygames +=' <td class="bluebox">'+depth+' / 3 .. </td> </tr>';	
				}
				
			}else if(round == 3){
				if(coin.data.prevstate.length>9){
					//Check if the key is yours..
					p1keys    = getStateVariable(coin.data.prevstate,2);
					p2keys    = getStateVariable(coin.data.prevstate,4);
					winner    = getStateVariable(coin.data.prevstate,8);
					winamount = getStateVariable(coin.data.prevstate,9);
					
					//Only want to show ONE of these but there are always 2 - a winner and a loser..
					result = "";
					ok     = (amount == winamount);
					if(MYGAME_KEYS.includes(p1keys)){
						if(winner == 1){
							result = "WIN";
						}else{
							result = "LOSE";
						}
						
						if(ok){
							mygames+='<tr class="bluebox"><td class="bluebox">'+amount+'</td> '
							+'<td class="bluebox">GAME OVER</td><td class="bluebox">'+result+'</td> </tr>';		
						}
						
					}else if(MYGAME_KEYS.includes(p2keys)){
						if(winner == 1){
							result = "LOSE";
						}else{
							result = "WIN";
						}
						
						if(ok){
							mygames+='<tr class="bluebox"><td class="bluebox">'+amount+'</td> '
							+'<td class="bluebox">GAME OVER</td><td class="bluebox">'+result+'</td> </tr>';		
						}		
					} 
				}
			}
		}
	
		mygames += "</table>";
		document.getElementById("mygames").innerHTML = mygames;
		
		//AND NOW AVAILABLE GAMES
		var json = alljson[0];
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
			
			amount = new Decimal(coin.data.coin.amount);
			coinid = coin.data.coin.coinid;
			depth  = Minima.block - coin.data.inblock;
			
			if(depth>3){
				if(!MYGAME_LIST.includes(coinid)){
					if(round == 0){
						//Its available!
						avail+='<tr><td class="availablebox" '
						+'onclick="acceptGame(\''+coinid+'\', \''+amount+'\' , \''+p1address+'\', \''+p1keys+'\', \''+p1hash+'\');">'+amount+'</td></tr>';
					}	
				}
			}
		}
		avail+="</table>"
		document.getElementById("availablegames").innerHTML = avail;	
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
		var p2keys = json[1].response.key.publickey;
		
		//Store keys for later
		MYGAME_KEYS.push(p2keys);
		
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
				"txnstate "+txnid+" 4 "+p2keys+";"+
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
					alert("Something went wrong!\n\nCheck logs..");	
				}else{
					alert("GAME ON!");	
				}
			});
		});
	});
}

function roundOne(coinid, gameamount, p1address, p1keys, p1hash, p2keys, p2hash ){
	console.log("ROUND 1!");
	
	//Get the preimage..
	var preimage = loadPreHash(p1hash);
	
	//Now we can construct the transaction..
	var txnid = Math.floor(Math.random()*1000000000);
		
	//Construct Transaction..
	var txncreator = 
		"txncreate "+txnid+";"+
		
		//STAGE 2
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
		//And the same amount/address as an output
		"txnoutput "+txnid+" "+gameamount+" "+coinflipaddress+" 0x00;"+
		
		//NOW POST!	
		"txnpost "+txnid+";"+
		//And cleanup..
		"txndelete "+txnid+";";
		
	Minima.cmd(txncreator, function(resp){
		var json = JSON.parse(resp);
		if(!checkAllResponses(json)){
			console.log(resp);
			alert("Something went wrong! Check console.. :(");	
		}else{
			//Don't do this move again..
			MYGAME_COINID.push(coinid);
			console.log("ROUND 1 PLAYED OK");
		}
	});	
	
}

function roundTwo(coinid, gameamount, p1address, p1keys, p1hash, p2keys, p2hash, preimage ){
	console.log("ROUND 2!");
	
	//Get the preimage..
	var preimage2 = loadPreHash(p2hash);
	
	//WHO HAS WON the game..
	var script = "runscript \"LET paywinner = "+gameamount+" * 0.95 LET payloser =  "+gameamount+" - paywinner "
	+"LET preimageone = "+preimage+" LET preimagetwo = "+preimage2+" "
	+"LET rand = SHA3 ( 512 HEXCAT ( preimageone preimagetwo ) ) "
	+"LET val = NUMBER ( SUBSET ( 0 1 rand ) ) IF ( val LT 128 ) THEN LET winner = 1 ELSE LET winner = 2 ENDIF\"";
	
	console.log("SCRIPT : "+script);
	
	//Run it and see who WON!
	Minima.cmd(script+";newaddress", function(resp){
		console.log(resp);
		var json = JSON.parse(resp);
		
		//who wins!
		var winner    = json[0].response.variables.winner;
		var paywinner = json[0].response.variables.paywinner;
		var payloser  = json[0].response.variables.payloser;
		
		var p2address = json[1].response.address.hexaddress;
		
		console.log("WINNER IS : "+winner);
		console.log("PAYWINNER : "+paywinner);
		console.log("PAYLOSER  : "+payloser);
		
		//Construct the Final transaction..
		var txnid = Math.floor(Math.random()*1000000000);
			
		//Construct Transaction..
		var txncreator = 
			"txncreate "+txnid+";"+
			
			//STAGE 2
			"txnstate "+txnid+" 0 3;"+
			
			//Copy the previous details..
			"txnstate "+txnid+" 1 "+p1address+";"+
			"txnstate "+txnid+" 2 "+p1keys+";"+
			"txnstate "+txnid+" 3 "+p1hash+";"+
			"txnstate "+txnid+" 4 "+p2keys+";"+
			"txnstate "+txnid+" 5 "+p2hash+";"+
			"txnstate "+txnid+" 6 "+preimage+";"+
			
			//Add your preimage..
			"txnstate "+txnid+" 7 "+preimage2+";"+
			
			//Add the WINNER.. (this is checked but putting it here helps for later when checking
			"txnstate "+txnid+" 8 "+winner+";"+
			
			//Add the WIN AMOUNT.. (this is checked but putting it here helps for later when checking
			"txnstate "+txnid+" 9 "+paywinner+";"+
			
			//Now add the game as input
			"txninput "+txnid+" "+coinid+";";
			
		//ORDER of txnoutputs MATTER!
		if( winner == "1" ){
			//Player 1 WINS!
			txncreator += "txnoutput "+txnid+" "+paywinner+" "+p1address+" 0x00;"+
						  "txnoutput "+txnid+" "+payloser+" "+p2address+" 0x00;";
		}else{
			//Player 2 Wins!
			txncreator += "txnoutput "+txnid+" "+payloser+" "+p1address+" 0x00;"+
						  "txnoutput "+txnid+" "+paywinner+" "+p2address+" 0x00;";  
		}
		
		//And finally.. SIGN IT!
		txncreator += "txnsign "+txnid+" "+p2keys+";";
		
		//NOW POST!	
		txncreator +=   "txnpost "+txnid+";"+
						//And cleanup..
						"txndelete "+txnid+";";
		
		Minima.cmd(txncreator, function(resp){
			var json = JSON.parse(resp);
			if(!checkAllResponses(json)){
				console.log(resp);
				alert("Something went wrong! Check console.. :(");	
			}else{
				//Don't do this move again..
				MYGAME_COINID.push(coinid);
				console.log("ROUND 2 PLAYED OK");
			}
		});	
	});
}

function compareCoin(coin_a, coin_b) {
	var time_a = coin_a.data.inblock;
	var time_b = coin_b.data.inblock;
	if (time_a > time_b) {
        return -1;
    }
    if (time_b > time_a) {
        return 1;
    }
    return 0;
}