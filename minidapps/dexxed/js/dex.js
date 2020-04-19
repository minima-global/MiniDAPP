/**
 * DEXXED java script functions!
 */

//Some Global variables..
var allTokens    = {};
var currentToken = {};
var dexcontract  = "LET owner = PREVSTATE ( 0 ) IF SIGNEDBY ( owner ) THEN RETURN TRUE ENDIF LET address = PREVSTATE ( 1 ) LET token = PREVSTATE ( 2 ) LET amount = PREVSTATE ( 3 ) ASSERT VERIFYOUT ( @INPUT address amount token )";
var dexaddress   = "0x511A76500BB841B1D7F56EA90C7C23AB4CACA37DE98943924B8D613CAE8493D0";

//The INIT function called once connected
function dex_init(){
	//Tell Minima about this contract.. This allows you to spend it when the time comes
	Minima.cmd("extrascript \""+dexcontract+"\"");
	
	//Basics
	UpdateBlockTime();
	UpdateBalance();
	
	//Check for which Tokens are available..
	Minima.cmd("tokens", function(resp){
		//Set the new token List
		UpdateTokensList(JSON.parse(resp).response);
		
		//Run it once..
		dexPollFunction();
	});
}

//Update the Balance Window - you can alwyas get the JSON in Minima.balance..
function UpdateBalance(){
	var baltext = "<table width=100% border=0>"
	var len = Minima.balance.balance.length;
	for(var loop=0;loop<len;loop++){
		var json = Minima.balance.balance[loop];
		if(json.unconfirmed!="0" || json.mempool!="0"){
			baltext += "<tr class='infoboxblue'><td align=right width=30%>"+json.token
			+"&nbsp;&nbsp;</td> <td align=left>&nbsp;&nbsp;"+json.confirmed+" | "+json.unconfirmed+" | "+json.mempool+"</td>  </tr>";	
		}else{
			baltext += "<tr class='infoboxblue'><td align=right width=30%>"+json.token
			+"&nbsp;&nbsp;</td> <td align=left>&nbsp;&nbsp;"+json.confirmed+"</td>  </tr>";
		}
	}
	baltext += "</table>"

	//And set it..
	document.getElementById("minima_balance").innerHTML = baltext;
}

//Update the BlockTime
function UpdateBlockTime(){
	document.getElementById("minima_blocktime").innerHTML = "<b>BLOCKTIME : </b> "+Minima.block;
}

//Update Token List
function UpdateTokensList(tokens_json){
	//Store..
	allTokens = tokens_json;
	
	//How many are there
	var len = tokens_json.tokens.length;
	if(len<2){
		//No Tokens.. since Minima is first
		document.getElementById("minima_tokenlist").innerHTML = "NO TOKENS FOUND.. &nbsp;&nbsp;<button onclick='window.location.href=\"\";' class=cancelbutton>REFRESH</button>";
		return;
	}
	
	//Create the Select Box
	var toktext = "<b>TOKEN : </b> <select onchange='tokenSelectChange();' id='select_tokenlist'>"
	for(var loop=1;loop<len;loop++){
		var json = tokens_json.tokens[loop];
			toktext += "<option value='"+json.tokenid+"'>"+json.token+" ( "+json.total+" ) "+json.tokenid.substr(0,40)+"..</option>";
	}
	toktext += "</select> &nbsp;&nbsp;<button onclick='window.location.href=\"\";' class=cancelbutton>REFRESH</button>";
	
	//And set it..
	document.getElementById("minima_tokenlist").innerHTML = toktext;
	
	//Set the Token..
	tokenSelectChange();
}

function UpdateOrderBook(orderbook){
	
}

function getCoinPrevState(coinproof, prevstate){
	var pslen = coinproof.prevstate.length;
	for(psloop=0;psloop<pslen;psloop++){
		if(coinproof.prevstate[psloop].port == prevstate){
			return coinproof.prevstate[psloop].data;
		}
	}
	return null;
}

function getTokenName(tokenid){
	var toklen = allTokens.tokens.length;
	for(tokloop=0;tokloop<toklen;tokloop++){
		//check it
		if(allTokens.tokens[tokloop].tokenid == tokenid){
			return allTokens.tokens[tokloop].token;
		}
	}
	
	return "NOT FOUND!";
}

function dexPollFunction(){
	//Update the block time..
	UpdateBlockTime();
	
	//Update YOUR Order Book
	Minima.cmd( "coins "+dexaddress, function(resp){
		coinsjson = JSON.parse(resp);
		
		//Get the details..
		var cashtable="<table width=100% border=0>"+
		"<tr> <th>TYPE</th> <th>TOKEN</th> <th>AMOUNT</th> <th>PRICE</th> <th>TOTAL</th> <th>&nbsp;</th> </tr>";
		
		//Cycle through the results..
		var coinlen = coinsjson.response.coins.length;
		for(i=0;i<coinlen;i++){
			var coinproof = coinsjson.response.coins[i].data;
			
			//get the PREVSTATE details that define the trade
			var owner      = getCoinPrevState(coinproof,0);
			var address    = getCoinPrevState(coinproof,1);
			var token      = getCoinPrevState(coinproof,2);
			var amount     = getCoinPrevState(coinproof,3);
			
			//How much is this output for
			var amountcoin = coinproof.coin.amount;
			
			//What token is it.
			var basetok    = coinproof.coin.tokenid;
			
			//Calculate the price..
			decorderamt =  new Decimal(amount);
			decamt      =  new Decimal(amountcoin);
			price       = decamt.div(decorderamt);
			
			//BUY OR SELL
			buysell     = "infoboxred";
			buysellword = "SELL";
			tradetoken  = getTokenName(basetok);
			if(basetok == "0x00"){
				//It's a BUY
				buysell = "infoboxgreen";
				buysellword = "BUY";
				tradetoken  = getTokenName(token);
			}
			
			cashtable+="<tr class='"+buysell+"'><td>"+buysellword+"</td> <td style='text-align:left'>"+tradetoken
			+"</td> <td style='text-align:left'>"+amount+"</td> <td style='text-align:left'>@"+price+"</td> <td style='text-align:left'>"
			+amountcoin+"</td> <td><button class='cancelbutton'>CANCEL</button> </td></tr>";
		}
		
		//Close the table
		cashtable+="</table>";
		
		//And set it..
		document.getElementById("minima_myorders").innerHTML = cashtable;
	});
	
}

function tokenSelectChange(){
	var tokenSel  = document.getElementById("select_tokenlist").selectedIndex;
	currentToken  = allTokens.tokens[tokenSel+1];
	console.log("Token Selected : "+currentToken.token);
}

function buysellaction(buyorsell){
	//Get the Values..
	var amount;
	var price;
	
	//The token we are trading
	var token        = currentToken.token;
	
	//The transaction tokens..
	var transtokenid = "0x00";
	var wanttokenid  = currentToken.tokenid;
	
	//BUY or SelL order
	if(buyorsell){
		amount = document.getElementById("buyamt").value.trim();
		price  = document.getElementById("buyprice").value.trim();
	}else{
		//Switch thetokens around
		transtokenid = currentToken.tokenid;
		wanttokenid  = "0x00";
		
		amount = document.getElementById("sellamt").value.trim();
		price  = document.getElementById("sellprice").value.trim();
	}
	
	
	if(amount=="" || price==""){
		alert("Cannot have BLANK inputs!");
		return;
	}
	
	//Lets do this! - use Big Boy Maths Lib
	var tamount = new Decimal(amount);
	var tprice  = new Decimal(price);
	var total = tamount.mul(tprice);
	
	if(tamount.lte(0) || tprice.lte(0)){
		alert("Cannot have ZERO inputs!");
		return;
	}
	
	//Check is OK
	if(buyorsell){
		if(!confirm("Please Confirm :\n\nBUY "+amount+" "+token+" @ "+price+" Minima\n\nTotal Order Value : "+total)){
			return;
		}	
	}else{
		if(!confirm("Please Confirm :\n\nSELL "+amount+" "+token+" @ "+price+" Minima\n\nTotal Order Value : "+total)){
			return;
		}
	}
	
	//We need a new key and a new address
	Minima.cmd( "keys new;newaddress;" , function(resp){
		keysjson = JSON.parse(resp);
		
		var pubkey  = keysjson[0].response.key.publickey;
		var address = keysjson[1].response.address.hexaddress;

		//Now create the txn..
		//The TXN ID is a random number..
		var txnid = Math.floor(Math.random()*1000000000);
		
		//Script to create transaction..
		var txncreator =    
			"txncreate "+txnid+";"+
			"txnstate "+txnid+" 0 "+pubkey+";"+
			"txnstate "+txnid+" 1 "+address+";"+
			"txnstate "+txnid+" 2 "+wanttokenid+";"+
			"txnstate "+txnid+" 3 "+tamount+";"+
			"txnauto "+txnid+" "+total+" "+dexaddress+" "+transtokenid+";"+
			"txnpost "+txnid+";"+
			"txndelete "+txnid+";";
			
		//And Run it..
		Minima.cmd( txncreator , function(resp){
			respjson = JSON.parse(resp);
			if(respjson[6].status != true){
				alert("Something went wrong.. Insufficient funds ?");
			}else{
				document.getElementById("buyamt").value = "";
				document.getElementById("buyprice").value = "";
				document.getElementById("sellamt").value = "";
				document.getElementById("sellprice").value = "";					
			}
		});	
	});
	
	
	
}