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
		//Store..
		allTokens = JSON.parse(resp).response;
		
		//How many are there
		var len = allTokens.tokens.length;
		if(len<2){
			//No Tokens.. since Minima is first
			document.getElementById("minima_tokenlist").innerHTML = "NO TOKENS FOUND.. &nbsp;&nbsp;<button onclick='window.location.href=\"\";' class=cancelbutton>REFRESH</button>";
			return;
		}
		
		//Create the Select Box
		var toktext = "<b>TOKEN : </b> <select onchange='tokenSelectChange();' id='select_tokenlist'>"
		for(var loop=1;loop<len;loop++){
			var json = allTokens.tokens[loop];
				toktext += "<option value='"+json.tokenid+"'>"+json.token+" ( "+json.total+" ) "+json.tokenid.substr(0,40)+"..</option>";
		}
		toktext += "</select> &nbsp;&nbsp;<button onclick='window.location.href=\"\";' class=cancelbutton>REFRESH</button>";
		
		//And set it..
		document.getElementById("minima_tokenlist").innerHTML = toktext;
		
		//Set the Token..
		tokenSelectChange();
		
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

function UpdateMyOrders(){
	//Update YOUR Order Book
	Minima.cmd( "coins "+dexaddress, function(resp){
		coinsjson = JSON.parse(resp);
		
		//Get the details..
		var cashtable="<table width=100% border=0>"+
		"<tr> <th>TYPE</th> <th>TOKEN</th> <th>AMOUNT</th> <th>PRICE</th> <th>TOTAL</th> <th>&nbsp;</th> </tr>";
		
		//Current block height
		var currblk = new Decimal(Minima.block);
		
		//Cycle through the results..
		var coinlen = coinsjson.response.coins.length;
		for(i=0;i<coinlen;i++){
			var coinproof = coinsjson.response.coins[i].data;
			
			//get the PREVSTATE details that define the trade
			var owner      = getCoinPrevState(coinproof,0);
			var address    = getCoinPrevState(coinproof,1);
			var token      = getCoinPrevState(coinproof,2);
			var amount     = new Decimal(getCoinPrevState(coinproof,3));
			
			//The Order
			var coin_id     = coinproof.coin.coinid;
			var coin_amount = new Decimal(coinproof.coin.amount);
			var coin_token  = coinproof.coin.tokenid;
			
			//Calculate the price..
			var dec_amount = new Decimal(0);
			var dec_price  = new Decimal(0);
			var dec_total  = new Decimal(0);
			
			//BUY OR SELL
			buysellclass = "infoboxred";
			buysellword  = "SELL";
			tradetoken   = getTokenName(coin_token);
			
			if(coin_token == "0x00"){
				//BUY
				buysellclass = "infoboxgreen";
				buysellword  = "BUY";
				tradetoken   = getTokenName(token);
				dec_amount   = amount;
				dec_price    = coin_amount.div(dec_amount);
				
			}else{
				//SELL
				scale        = getTokenScale(coin_token);
				dec_amount   = coin_amount.mul(scale);
				dec_price    = amount.div(dec_amount);
			}
			
			//The total
			dec_total = dec_amount.mul(dec_price);
			
			//Build it
			cashtable+="<tr class='"+buysellclass+"'><td>"+buysellword+"</td>"
			+" <td style='text-align:left'>"+tradetoken+"</td>"
			+" <td style='text-align:left'>"+dec_amount+"</td>"
			+"<td style='text-align:left'>"+dec_price+"</td> "
			+"<td style='text-align:left'>"+dec_total+"</td> ";
			
			//Are we deep enough..
			var inblk =  new Decimal(coinproof.inblock);
			var diff  =  currblk.sub(inblk);
			if(diff.gte(3)){
				cashtable+="<td><button onclick='cancelOrder(\""+coin_id+"\",\""+owner+"\",\""+address+"\",\""+coin_amount+"\",\""+coin_token+"\");' class='cancelbutton'>CANCEL</button> </td></tr>";	
			}else{
				cashtable+="<td>waiting..</td></tr>";
			}
		}
		
		//Close the table
		cashtable+="</table>";
		
		//And set it..
		document.getElementById("minima_myorders").innerHTML = cashtable;
	});
}

function UpdateOrderBook(){
	
	//Search for all the coins of this address
	Minima.cmd( "search "+dexaddress, function(resp){
		coinsjson = JSON.parse(resp);
		
		//Cycle through the results..
		var tokenorders_buy  = [];
		var tokenorders_sell = [];
		var coinlen = coinsjson.response.coins.length;
		for(i=0;i<coinlen;i++){
			var coindata = coinsjson.response.coins[i].data;
			
			var token      = coindata.coin.tokenid;
			var swaptoken  = getCoinPrevState(coindata,2);
			
			if(token == currentToken.tokenid){
				tokenorders_sell.push(coindata);
			}else if(swaptoken==currentToken.tokenid){
				tokenorders_buy.push(coindata);
			}
		}
		
		//Now ORDER the list..
//		tokenorders_buy.sort(function (a, b) {
//			var amount = new Decimal(getCoinPrevState(coinproof,3));
			
//			if (a.coin. > b) {
//		        return -1;
//		    }
//		    if (b > a) {
//		        return 1;
//		    }
//		    return 0;
//		});
		
		//Get the details..
		var cashtable="<table width=100%>";
		
		//Sell Orders first
		for(i=0;i<tokenorders_sell.length;i++){
			cashtable+="<tr style='cursor: pointer;' class='infoboxred'> <td width=33%>10</td> <td width=34%>0.02</td> <td width=33%>2</td> </tr>";
		}
		
		//Then the middle..
		cashtable+="<tr class='infoboxblue'><td colspan=3>-------</td></tr>"
		
		//Then the Buy orders
		for(i=0;i<tokenorders_buy.length;i++){
			cashtable+="<tr style='cursor: pointer;' class='infoboxgreen'> <td width=33%>10</td> <td width=34%>0.02</td> <td width=33%>2</td> </tr>";
		}
		//Finish up..
		cashtable+="</table>";
		
		//Set it..
		document.getElementById("dexxed_orderbook").innerHTML = cashtable;
	});
	
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

function getTokenScale(tokenid){
	var toklen = allTokens.tokens.length;
	for(tokloop=0;tokloop<toklen;tokloop++){
		//check it
		if(allTokens.tokens[tokloop].tokenid == tokenid){
			temptokenscale       = new Decimal(allTokens.tokens[tokloop].scale); 
			temptokenscalefactor = new Decimal(10).pow(temptokenscale); 
			return temptokenscalefactor;
		}
	}
	
	return new Decimal(0);
}

function dexPollFunction(){
	UpdateBlockTime();
	
	UpdateMyOrders();
	
	UpdateOrderBook();
	
	//UpdateMyTrades();
	
	//UpdateTrades();
}

function tokenSelectChange(){
	var tokenSel  = document.getElementById("select_tokenlist").selectedIndex;
	currentToken  = allTokens.tokens[tokenSel+1];
	console.log("Token Selected : "+currentToken.token);
}

function cancelOrder(coinid, owner, address, amount, tokenid){
	if(!confirm("Are you sure you want to cancel this order ?")){
		return;
	}
	
	//Now create the txn..
	var txnid = Math.floor(Math.random()*1000000000);
	
	//Script to create transaction..
	var txncreator =    
		"txncreate "+txnid+";"+
		"txninput "+txnid+" "+coinid+";"+
		"txnoutput "+txnid+" "+amount+" "+address+" "+tokenid+";"+
		"txnsign "+txnid+" "+owner+";"+
		"txnpost "+txnid+";"+
		"txndelete "+txnid+";";
	
	//And Run it..
	Minima.cmd( txncreator , function(resp){
		respjson = JSON.parse(resp);
		if(respjson[4].status != true){
			alert("Something went wrong.. ?\n\n"+respjson[4].error+"\n\nCheck console log.. ");
			console.log(resp);
		}else{
			alert("ORDER CANCELLED!");
		}
	});
}

function buysellaction(buyorsell){
	//Get the Values..
	var amount;
	var price;
	
	//The token we are trading
	var token        = currentToken.token;
	tokenscale       = new Decimal(currentToken.scale); 
	tokenscalefactor = new Decimal(10).pow(tokenscale); 
	
	//The transaction tokens..
	var transtokenid = "0x00";
	var wanttokenid  = currentToken.tokenid;
	
	//BUY or SelL order
	if(buyorsell){
		//BUY
		amount = document.getElementById("buyamt").value.trim();
		price  = document.getElementById("buyprice").value.trim();
	}else{
		//SELL
		transtokenid     = currentToken.tokenid;
		wanttokenid      = "0x00";
		
		amount = document.getElementById("sellamt").value.trim();
		price  = document.getElementById("sellprice").value.trim();
	}
	
	if(amount=="" || price==""){
		alert("Cannot have BLANK inputs!");
		return;
	}
	
	//Lets do this! - use Big Boy Maths Lib
	var dec_amount = new Decimal(amount);
	var dec_price  = new Decimal(price);
	var dec_total  = dec_amount.mul(dec_price);
	
	if(dec_amount.lte(0) || dec_price.lte(0)){
		alert("Cannot have ZERO or Less inputs!");
		return;
	}
	
	//Check is OK
	if(buyorsell){
		if(!confirm("Please Confirm :\n\nBUY "+amount+" "+token+" @ "+price+" Minima\n\nTotal Order Value : "+dec_total)){
			return;
		}	
	}else{
		if(!confirm("Please Confirm :\n\nSELL "+amount+" "+token+" @ "+price+" Minima\n\nTotal Order Value : "+dec_total)){
			return;
		}
		
		//Swap them.. it's a SELL
		var swap   = dec_total;
		dec_total  = dec_amount;
		dec_amount = swap;
	}
	
	//We need a new key and a new address
	Minima.cmd( "keys new;newaddress;" , function(resp){
		keysjson = JSON.parse(resp);
		
		var pubkey  = keysjson[0].response.key.publickey;
		var address = keysjson[1].response.address.hexaddress;

		//Now create the txn..
		var txnid = Math.floor(Math.random()*1000000000);
		
		//Script to create transaction..
		//TXNAUTO automatically scales the values.. 
		var txncreator =    
			"txncreate "+txnid+";\n"+
			"txnstate "+txnid+" 0 "+pubkey+";\n"+
			"txnstate "+txnid+" 1 "+address+";\n"+
			"txnstate "+txnid+" 2 "+wanttokenid+";\n"+
			"txnstate "+txnid+" 3 "+dec_amount+";\n"+
			"txnauto "+txnid+" "+dec_total+" "+dexaddress+" "+transtokenid+";\n"+
			"txnpost "+txnid+";\n"+
			"txndelete "+txnid+";\n";
		
		//console.log(txncreator);
		
		//And Run it..
		Minima.cmd( txncreator , function(resp){
			respjson = JSON.parse(resp);
			if(respjson[5].status != true){
				alert("Something went wrong.. Insufficient funds ?");
			}else{
				document.getElementById("buyamt").value = "";
				document.getElementById("buyprice").value = "";
				document.getElementById("sellamt").value = "";
				document.getElementById("sellprice").value = "";	
				alert("ORDER POSTED!");
			}
		});	
	});
}


