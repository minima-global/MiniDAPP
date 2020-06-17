/**
 * COIN FLIP java script functions
 */

var coinflipcontract = "LET round = STATE ( 0 ) LET prevround = PREVSTATE ( 0 ) ASSERT round EQ INC ( prevround ) IF round EQ 1 THEN IF SIGNEDBY ( PREVSTATE ( 2 ) ) THEN RETURN TRUE ENDIF ASSERT SAMESTATE ( 1 3 ) RETURN VERIFYOUT ( @INPUT @ADDRESS ( @AMOUNT * 2 ) @TOKENID ) ELSEIF round EQ 2 THEN IF @BLKDIFF GT 64 AND SIGNEDBY ( PREVSTATE ( 4 ) ) THEN RETURN TRUE ENDIF ASSERT SAMESTATE ( 1 5 ) LET ponehash = STATE ( 3 ) LET preimage = STATE ( 6 ) ASSERT SHA3 ( 512 preimage ) EQ ponehash RETURN VERIFYOUT ( @INPUT @ADDRESS @AMOUNT @TOKENID ) ELSEIF round EQ 3 THEN IF @BLKDIFF GT 64 AND SIGNEDBY ( PREVSTATE ( 2 ) ) THEN RETURN TRUE ENDIF ASSERT SAMESTATE ( 1 6 ) LET ptwohash = STATE ( 5 ) LET ptwopreimage = STATE ( 7 ) ASSERT SHA3 ( 512 ptwopreimage ) EQ ptwohash LET ponepreimage = STATE ( 6 ) LET rand = SHA3 ( 512 HEXCAT ( ponepreimage ptwopreimage ) ) LET val = NUMBER ( SUBSET ( 0 1 rand ) ) IF ( val LT 128 ) THEN LET winner = 1 ELSE LET winner = 2 ENDIF LET paywinner = @AMOUNT * 0.95 LET payloser = @AMOUNT - paywinner ASSERT STATE ( 8 ) EQ winner ASSERT STATE ( 9 ) EQ paywinner LET poneaddress = STATE ( 1 ) IF winner EQ 1 THEN ASSERT VERIFYOUT ( @INPUT poneaddress paywinner @TOKENID ) ELSE ASSERT VERIFYOUT ( @INPUT poneaddress payloser @TOKENID ) ENDIF RETURN SIGNEDBY ( PREVSTATE ( 4 ) ) ENDIF";
var coinflipaddress  = "0x13F484D30BC6776A1050C90FF9B87CDB8EA8FC0333E206B4D2E71D012505BA43";

//These are kept permanently in SQL..
var MYGAME_KEYS      = [];

//These keep track of local games - so you don't repeat an action
var MYGAME_LIST      = [];
var MYJOIN_LIST      = [];
var MYGAME_COINID    = [];
var MYGAME_CANCELLED = [];

function coinFlipInit(){
	//Tell Minima about the smart contract so it knows how to spend it..
	Minima.cmd("extrascript \""+coinflipcontract+"\"");
	
	//Create the create database..
	var initsql = "CREATE TABLE IF NOT EXISTS preimage ( image VARCHAR(160) NOT NULL, hash VARCHAR(160) NOT NULL );" +
				  "CREATE TABLE IF NOT EXISTS gamekeys ( key VARCHAR(160) NOT NULL );" +
				  "SELECT * FROM gamekeys";
	
	//Run the initialising SQL
	Minima.sql(initsql,function(resp){
		if(!resp.status){
			alert("Error in Init SQL..\n\n"+resp.message);
			console.log(JSON.stringify(resp, null, 2));
		}
		
		//Add all the old games you know about..
		var rows = resp.response[2].count;
		for(i=0;i<rows;i++){
			key = resp.response[2].rows[i].KEY;
			MYGAME_KEYS.push(key);
		}
		
		//Clear it if growing to big - bit rough this..
		if(rows>50){
			console.log("CLEARING OUT OLD GAMES!");
			Minima.sql("DELETE FROM gamekeys");
		}
		
		//Continue startup
		setBalance();
		coinflipPollFunction();
	});
}

//Called on new block
function coinflipPollFunction(){
	setTime();
	updateMyGames();
}

function setTime(){
	document.getElementById("blocktime").innerHTML = "<b>BLOCKTIME : "+Minima.block+"</b>";	
}

function setBalance(){
	document.getElementById("balance").innerHTML = "<b>BALANCE : "+Minima.util.getBalance("0x00")+"</b>";
}

function letsplay(){
	//Get the amount..
	var selectbox = document.getElementById("newamount");
	var selamount = selectbox.options[selectbox.selectedIndex].value;
	
	if(selamount == "" || selamount == "0"){
		alert("NO amount set..!");
		return;
	}
	
	var decamt = new Decimal(selamount);
	
	//Final Confirm..
	if(!confirm("Are you sure you want to play for "+decamt+" Minima ?")){
		return;
	}
	
	//Lets Play..!
	//You need a random number..
	//A winning payout address
	//A key to pay your next go..
	Minima.cmd("random;newaddress;keys new", function(json){
		var rand      = json[0].response.random;
		var myaddress = json[1].response.address.hexaddress;
		var mykey     = json[2].response.key.publickey;
		
		//Store keys for later
		addGameKey(mykey);
		
		//Now we can use that in a script and get the result to HASH the random number..
		var runscript = 'runscript "LET hash = SHA3 ( 512 '+rand+' )"';
		
		Minima.cmd(runscript, function(jsonrun){
			//get the value from variables in JSON
			var hash1 = jsonrun.response.variables.hash;
			
			//MUST STORE THIS NOW.. as we'll need it later
			storeHash(hash1,rand);
			
			//Now we can construct the transaction..
			var txnid1 = Math.floor(Math.random()*1000000000);
			
			//Construct Transaction..
			var txncreator1 = 
				"txncreate "+txnid1+";"+
				//STAGE 0
				"txnstate "+txnid1+" 0 0;"+
				//My details
				"txnstate "+txnid1+" 1 "+myaddress+";"+
				"txnstate "+txnid1+" 2 "+mykey+";"+
				"txnstate "+txnid1+" 3 "+hash1+";"+
				
				//Now set up the payment..
				"txnauto "+txnid1+" "+decamt+" "+coinflipaddress+";"+
				
				//And POST / DELETE
				"txnpost "+txnid1+";"+
				"txndelete "+txnid1+";";
			
			console.log("POST GAME "+txncreator1);
			
			Minima.cmd(txncreator1 , function(txnresp){
				Minima.util.checkAllResponses(txnresp);
		    });
		});	
	});
}

function updateMyGames(){
	Minima.cmd("coins  type:unspent address:"+coinflipaddress+";coins relevant type:all", function(alljson){
		//FIRST DO MY GAMES.. And fill up MYGAME_LIST..
		var mygames = '<table width=100% border=0>'
			+'<tr style="height:20;font-size:20;"> '
			+'<th width=30%>AMOUNT</th> <th width=30%>ROUND</th> <th width=30%>STAGE</th> </tr>';
		
		//Clear the list..
		MYGAME_LIST = [];	
		
		var coinlist = alljson[1].response.coins;
		var len = coinlist.length;
		
		//Sort by time..
		coinlist.sort(compareCoin);
		for(i=0;i<len;i++){
			coin = coinlist[i];
		
			//Is this the Coin Flip Address
			var rightaddress = ( coin.data.coin.address == coinflipaddress );
			
			//get the round - if it exists..
			var round = Minima.util.getStateVariable(coin.data.prevstate,0);
			
			//Could be a NON coin flip..
			if(round == null){
				continue;
			}
			
			var amount  = new Decimal(coin.data.coin.amount);
			var coinid  = coin.data.coin.coinid;
			var depth   = Minima.block - coin.data.inblock;
			if(depth<0){
				depth = 0;
			}
			
			var spent   = coin.data.spent;
			
			//Add to my list 
			MYGAME_LIST.push(coinid); 
			
			if(round == 0  && !spent && rightaddress){
				var p1keysr1 = Minima.util.getStateVariable(coin.data.prevstate,2);
				
				if(depth<=3){
					mygames +='<tr class="bluebox"><td class="bluebox">'+amount+'</td> '
					+'<td class="bluebox">0 / 3</td> <td class="bluebox">Waiting.. '+depth+' / 3 .. </td> </tr>';	
				}else{
					if(!MYGAME_CANCELLED.includes(coinid)){
						mygames +='<tr class="bluebox"><td class="bluebox">'+amount+'</td> '
						+'<td class="bluebox">Waiting 4 Player..</td> '
						+'<td class="bluebox"><button class="smalluserbutton" id=\''+coinid+'\' onclick="collectItAll(\''+coinid+'\', 0, \''+amount+'\', \''+p1keysr1+'\');">Cancel</button></td> </tr>';	
					}
				}				
			}else if(round == 1 && !spent && rightaddress){
				mygames+='<tr class="bluebox"><td class="bluebox">'+amount+'</td><td class="bluebox">2 / 3</td>';
				
				//STATE details that need to be kept..
				var p1addrr1   = Minima.util.getStateVariable(coin.data.prevstate,1);
				var p1keysr1   = Minima.util.getStateVariable(coin.data.prevstate,2);
				var p1hashr1   = Minima.util.getStateVariable(coin.data.prevstate,3);
				var p2keysr1   = Minima.util.getStateVariable(coin.data.prevstate,4);
				var p2hashr1   = Minima.util.getStateVariable(coin.data.prevstate,5);
				
				//Are we deep enuogh to play on..
				if(depth>5){
					mygames +=' <td class="bluebox">PLAYER 1 REVEAL</td> </tr>';
					
					//MUST be in a function as otherwise the ASYNC function screws up..
					roundOneChecker(coinid, amount, p1addrr1, p1keysr1, p1hashr1, p2keysr1, p2hashr1);
					
					//Safety mechanism is P1 tries not to complete
					if(depth>64){
						//PLAYER 2 CAN JUST COLLECT EVERYTHING!
						collectItAll(coinid, 1, amount, p2keysr1);
					}
					
				}else{
					mygames +=' <td class="bluebox">'+depth+' / 5 .. </td> </tr>';	
				}
				
			}else if(round == 2 && !spent && rightaddress){
				mygames+='<tr class="bluebox"><td class="bluebox">'+amount+'</td><td class="bluebox">3 / 3</td>';
				
				var p1addrr2   = Minima.util.getStateVariable(coin.data.prevstate,1);
				var p1keysr2   = Minima.util.getStateVariable(coin.data.prevstate,2);
				var p1hashr2   = Minima.util.getStateVariable(coin.data.prevstate,3);
				var p2keysr2   = Minima.util.getStateVariable(coin.data.prevstate,4);
				var p2hashr2   = Minima.util.getStateVariable(coin.data.prevstate,5);
				var p1preimage = Minima.util.getStateVariable(coin.data.prevstate,6);
				
				//Are we deep enuogh to play on..
				if(depth>5){
					mygames +=' <td class="bluebox">PLAYER 2 REVEAL</td> </tr>';
					
					roundTwoChecker(coinid, amount, p1addrr2, p1keysr2, p1hashr2, p2keysr2, p2hashr2, p1preimage);
					
					//Safety mechanism if P2 tries not to complete
					if(depth>64){
						//PLAYER 1 CAN JUST COLLECT EVERYTHING!
						collectItAll(coinid, 2, amount, p1keysr2);
					}	
					
				}else{
					mygames +=' <td class="bluebox">'+depth+' / 5 .. </td> </tr>';	
				}
				
			}else if(round == 3){
				if(coin.data.prevstate.length>9){
					//Check if the key is yours..
					var p1keysr3    = Minima.util.getStateVariable(coin.data.prevstate,2);
					var p2keysr3    = Minima.util.getStateVariable(coin.data.prevstate,4);
					var winnerr3    = Minima.util.getStateVariable(coin.data.prevstate,8);
					var winamountr3 = Minima.util.getStateVariable(coin.data.prevstate,9);
					
					//Only want to show ONE of these but there are always 2 - a winner and a loser..
					var result    = "";
					var ok        = (amount == winamountr3);
					var relamount = amount.sub(new Decimal(amount).div(2).div(0.95));;
					
					if(MYGAME_KEYS.includes(p1keysr3)){
						if(winnerr3 == 1){
							result = "WIN";
						}else{
							result = "LOSE";
						}
						
						if(ok){
							mygames+='<tr class="bluebox"><td class="bluebox">'+relamount+'</td> '
							+'<td class="bluebox">GAME OVER</td><td class="bluebox">'+result+'</td> </tr>';		
						}
						
					}else if(MYGAME_KEYS.includes(p2keysr3)){
						if(winnerr3 == 1){
							result = "LOSE";
						}else{
							result = "WIN";
						}
						
						if(ok){
							mygames+='<tr class="bluebox"><td class="bluebox">'+relamount+'</td> '
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
			var coin = json.response.coins[i];
			
			//Is this at ROUND 0
			var round  = Minima.util.getStateVariable(coin.data.prevstate,0);
			
			//P1 details
			var p1addressag = Minima.util.getStateVariable(coin.data.prevstate,1);
			var p1keysag    = Minima.util.getStateVariable(coin.data.prevstate,2);
			var p1hashag    = Minima.util.getStateVariable(coin.data.prevstate,3);
			
			var amount = new Decimal(coin.data.coin.amount);
			var coinid = coin.data.coin.coinid;
			var depth  = Minima.block - coin.data.inblock;
			
			if(depth>3){
				if(!MYGAME_LIST.includes(coinid) && !MYJOIN_LIST.includes(coinid)){
					if(round == 0){
						//Its available!
						avail+='<tr><td class="availablebox" '
						+'onclick="acceptGame(\''+coinid+'\', \''+amount+'\' , \''+p1addressag+'\', \''+p1keysag+'\', \''+p1hashag+'\');">'+amount+'</td></tr>';
					}	
				}
			}
		}
		avail+="</table>"
		document.getElementById("availablegames").innerHTML = avail;	
	});
}

function acceptGame(acceptcoinid, acceptgameamount, acceptp1address, acceptp1keys, acceptp1hash){
	if(!confirm("Confirm accept game for "+acceptgameamount+" Minima ?")){
		return;
	}
	
	//First get all the details..
	Minima.cmd("random;keys new", function(json){
		//Now you have that coin + details..
		var amtx2  = new Decimal(acceptgameamount).mul(2);
		var rand   = json[0].response.random;
		var p2keys = json[1].response.key.publickey;
		
		//Store keys for later
		addGameKey(p2keys);
		
		//Now we can use that in a script and get the result to HASH the random number..
		var runscript = 'runscript "LET hash = SHA3 ( 512 '+rand+' )"';
		
		Minima.cmd(runscript, function(respjson){
			//get the value from variables in JSON
			var hash = respjson.response.variables.hash;
			
			//MUST STORE THIS NOW.. as we'll need it later
			storeHash(hash,rand);
			
			//Now we can construct the transaction..
			var txnid2 = Math.floor(Math.random()*1000000000);
				
			//Construct Transaction..
			var txncreator2 = 
				"txncreate "+txnid2+";"+
				
				//STAGE 1
				"txnstate "+txnid2+" 0 1;"+
				
				//Copy the previous details..
				"txnstate "+txnid2+" 1 "+acceptp1address+";"+
				"txnstate "+txnid2+" 2 "+acceptp1keys+";"+
				"txnstate "+txnid2+" 3 "+acceptp1hash+";"+
				
				//Add your details..
				"txnstate "+txnid2+" 4 "+p2keys+";"+
				"txnstate "+txnid2+" 5 "+hash+";"+
				
				//Now create.. but not for right amount..
				"txnauto "+txnid2+" "+acceptgameamount+" "+coinflipaddress+" 0x00;"+
				//Now add the game output at pos 0
				"txninput "+txnid2+" "+acceptcoinid+" 0;"+
				//Now remove the old output
				"txnremoutput "+txnid2+" 0;"+
				//And ADD a double amount.. at pos 0
				"txnoutput "+txnid2+" "+amtx2+" "+coinflipaddress+" 0x00 0;"+
				
				//NOW SIGN
				"txnsignauto "+txnid2+";"+
				//NOW POST!	
				"txnpost "+txnid2+";"+
				//And cleanup..
				"txndelete "+txnid2+";";
				
				//PHEW.!! ;-p
			
			console.log("ACCEPT GAME "+txncreator2);
			
			Minima.cmd(txncreator2, function(txnresp){
				if(Minima.util.checkAllResponses(txnresp)){
					//It's one of your games now..
					MYJOIN_LIST.push(acceptcoinid);
					
					//Update..
					updateMyGames();
				}
			});
		});
	});
}


function collectItAll(coinid, round, amount, collectkeys){
	if(MYGAME_COINID.includes(coinid)){
		//You've already done this..!
		return;
	}
	
	//Player was too slow.. take ALL the funds..
	Minima.cmd("check "+collectkeys, function(json){
		//Are you the lucky player ?
		if(json.response.relevant == true){
				
			//Create an address and take the money..
			Minima.cmd("newaddress", function(addrjson){
				var collectoraddr = addrjson.response.address.hexaddress;
				
				//Construct the Final transaction..
				var txnid5 = Math.floor(Math.random()*1000000000);
				
				//The round..
				var rr = new Decimal(round).add(1);
				
				//Construct Transaction..
				var txncreator5 = 
					"txncreate "+txnid5+";"+
					"txnstate "+txnid5+" 0 "+rr+";"+
					"txninput "+txnid5+" "+coinid+";"+
					"txnoutput "+txnid5+" "+amount+" "+collectoraddr+" 0x00;"+
					"txnsign "+txnid5+" "+collectkeys+";"+
					"txnpost "+txnid5+";"+
					"txndelete "+txnid5+";";
				
				console.log("COLLECT IT ALL "+txncreator5);
				
				Minima.cmd(txncreator5, function(txnresp){
					if(Minima.util.checkAllResponses(txnresp)){
						//Only do this action once.
						MYGAME_COINID.push(coinid);
						if(round==0){
							//Remove from action..
							document.getElementById(coinid).disabled = 'true';
							MYGAME_CANCELLED.push(coinid);
							alert("Collection Transaction Posted. Game Cancelled..");	
						}else{
							alert("ALL Funds Collected from slow player!\n\nYou win it all -> "+amount+" !!");	
						}
					}
				});
			});
		}
	});
}

function roundOneChecker(zChecker_coinid, zChecker_gameamount, zChecker_p1address, 
						zChecker_p1keys, zChecker_p1hash, zChecker_p2keys, zChecker_p2hash ){
	
	//Do the ASYNC function in a function.. so variables can't change..
	Minima.cmd("check "+zChecker_p1keys, function(json){
		//Are you player 1 ?
		if(json.response.relevant == true){
			if(!MYGAME_COINID.includes(zChecker_coinid)){
				roundOne(zChecker_coinid, zChecker_gameamount, zChecker_p1address, 
						zChecker_p1keys, zChecker_p1hash, zChecker_p2keys, zChecker_p2hash );
			}	
		}
	});
}

function roundOne(r1coinid, r1gameamount, r1p1address, p1keys, p1hash, p2keysprev, p2hash ){
	//Get the preimage..
	loadPreHash(p1hash,function(preimage){
		//Now we can construct the transaction..
		var txnid3 = Math.floor(Math.random()*1000000000);
			
		//Construct Transaction..
		var txncreator3 = 
			"txncreate "+txnid3+";"+
			
			//STAGE 2
			"txnstate "+txnid3+" 0 2;"+
			
			//Copy the previous details..
			"txnstate "+txnid3+" 1 "+r1p1address+";"+
			"txnstate "+txnid3+" 2 "+p1keys+";"+
			"txnstate "+txnid3+" 3 "+p1hash+";"+
			"txnstate "+txnid3+" 4 "+p2keysprev+";"+
			"txnstate "+txnid3+" 5 "+p2hash+";"+
			"txnstate "+txnid3+" 6 "+preimage+";"+
			
			//Now add the game as input
			"txninput "+txnid3+" "+r1coinid+";"+
			//And the same amount/address as an output
			"txnoutput "+txnid3+" "+r1gameamount+" "+coinflipaddress+" 0x00;"+
			
			//NOW POST!	
			"txnpost "+txnid3+";"+
			//And cleanup..
			"txndelete "+txnid3+";";
		
		//Create the TXN.. 
		CreateRoundTxn(txncreator3, r1coinid, 1);	
	});	
}

function CreateRoundTxn(ztxncreator, zcoinid, zRound){
	console.log("CREATE ROUND TXN : "+zRound+" "+ztxncreator);
	
	Minima.cmd(ztxncreator, function(json){
		if(!Minima.util.checkAllResponses(json)){
			//hmmm.. something went wrong.. will try agin..
			console.log("ROUND "+zRound+" SOMETHING WRONG! Check Logs..");
		}else{
			//Only NOW add it to your game list
			MYGAME_COINID.push(zcoinid);
			
			//Don't do this move again..
			console.log("ROUND "+zRound+" PLAYED OK");
		}
	});
}

function roundTwoChecker(zChecker2_coinid, zChecker2_gameamount, zChecker2_p1address, zChecker2_p1keys, zChecker2_p1hash, 
						 zChecker2_p2keys, zChecker2_p2hash, zChecker2_preimage ){
	Minima.cmd("check "+zChecker2_p2keys, function(json){
		//Are you player 1 ?
		if(json.response.relevant == true){
			if(!MYGAME_COINID.includes(zChecker2_coinid)){
				roundTwo(zChecker2_coinid, zChecker2_gameamount, zChecker2_p1address, zChecker2_p1keys, zChecker2_p1hash, 
									 zChecker2_p2keys, zChecker2_p2hash, zChecker2_preimage);
			}
		}
	});
}

function roundTwo(r2coinid, r2gameamount, r2p1address, p1keys, p1hash, p2keysprev2, p2hash, preimage ){
	//WHO HAS WON the game..
	loadPreHash(p2hash,function(pimage){
		var script = "runscript \"LET paywinner = "+r2gameamount+" * 0.95 LET payloser =  "+r2gameamount+" - paywinner "
		+"LET preimageone = "+preimage+" LET preimagetwo = "+pimage+" "
		+"LET rand = SHA3 ( 512 HEXCAT ( preimageone preimagetwo ) ) "
		+"LET val = NUMBER ( SUBSET ( 0 1 rand ) ) IF ( val LT 128 ) THEN LET winner = 1 ELSE LET winner = 2 ENDIF\"";
		
		//Run it and see who WON!
		Minima.cmd(script+";newaddress", function(json){
			//who wins!
			var winner    = json[0].response.variables.winner;
			var paywinner = json[0].response.variables.paywinner;
			var payloser  = json[0].response.variables.payloser;
			var preimg2   = json[0].response.variables.preimagetwo;
			
			var p2address = json[1].response.address.hexaddress;
			
			//Construct the Final transaction..
			var txnid4 = Math.floor(Math.random()*1000000000);
				
			//Construct Transaction..
			var txncreator4 = 
				"txncreate "+txnid4+";"+
				
				//STAGE 2
				"txnstate "+txnid4+" 0 3;"+
				
				//Copy the previous details..
				"txnstate "+txnid4+" 1 "+r2p1address+";"+
				"txnstate "+txnid4+" 2 "+p1keys+";"+
				"txnstate "+txnid4+" 3 "+p1hash+";"+
				"txnstate "+txnid4+" 4 "+p2keysprev2+";"+
				"txnstate "+txnid4+" 5 "+p2hash+";"+
				"txnstate "+txnid4+" 6 "+preimage+";"+
				
				//Add your preimage..
				"txnstate "+txnid4+" 7 "+preimg2+";"+
				
				//Add the WINNER.. (this is checked but putting it here helps for later when checking
				"txnstate "+txnid4+" 8 "+winner+";"+
				
				//Add the WIN AMOUNT.. (this is checked but putting it here helps for later when checking
				"txnstate "+txnid4+" 9 "+paywinner+";"+
				
				//Now add the game as input
				"txninput "+txnid4+" "+r2coinid+";";
				
			//ORDER of txnoutputs MATTER!
			if( winner == "1" ){
				//Player 1 WINS!
				txncreator4 += "txnoutput "+txnid4+" "+paywinner+" "+r2p1address+" 0x00;"+
							  "txnoutput "+txnid4+" "+payloser+" "+p2address+" 0x00;";
			}else{
				//Player 2 Wins!
				txncreator4 += "txnoutput "+txnid4+" "+payloser+" "+r2p1address+" 0x00;"+
							  "txnoutput "+txnid4+" "+paywinner+" "+p2address+" 0x00;";  
			}
			
			//And finally.. SIGN IT!
			txncreator4 += "txnsign "+txnid4+" "+p2keysprev2+";";
			
			//NOW POST!	
			txncreator4 +=   "txnpost "+txnid4+";"+
							//And cleanup..
							"txndelete "+txnid4+";";
			
			//Create the TXN.. 
			CreateRoundTxn(txncreator4, r2coinid, 2);	
		});	
	});
}

function addGameKey(key){
	//Add locally
	MYGAME_KEYS.push(key);
	
	//Add to the database..
	var storesql = "INSERT INTO gamekeys (key) VALUES ('"+key+"')";
	Minima.sql(storesql,function(resp){
		if(!resp.status){alert("ERROR in SQL\n\n"+resp.message);}
	});
}

function removeCoinID(coinID){
	index = MYGAME_COINID.indexOf(coinID);
	if (index > -1) {
		MYGAME_COINID.splice(index, 1);
	}
}

//Store the preimage of the hash value
function storeHash(hash, value){
	var storesql = "INSERT INTO preimage (image, hash) VALUES ('"+value+"','"+hash+"')";
	Minima.sql(storesql,function(resp){
		if(!resp.status){
			alert("ERROR in SQL\n\n"+resp.message);
		}
	});
}

//get the preimage..
function loadPreHash(hash, callback){
	var loadsql = "SELECT * FROM preimage WHERE hash='"+hash+"'";
	Minima.sql(loadsql,function(resp){
		if(!resp.status){
			alert("ERROR in SQL\n\n"+resp.message);
		}else{
			//Call the callback with the preimage..
			callback(resp.response.rows[0].IMAGE);	
		}
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