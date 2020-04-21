/**
 * DEXXED java script functions!
 */

//Some Global variables..
var allTokens    = {};
var currentToken = {};
var dexcontract  = "LET owner = PREVSTATE ( 0 ) IF SIGNEDBY ( owner ) THEN RETURN TRUE ENDIF LET address = PREVSTATE ( 1 ) LET token = PREVSTATE ( 2 ) LET amount = PREVSTATE ( 3 ) RETURN VERIFYOUT ( @INPUT address amount token )";
var dexaddress   = "0xB68787A65D917793643F1F2E7D9E3DFA020767AA85CE38640135297A0A553C8C";

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
		tokenorders_sell.sort(comparePrice);
		tokenorders_buy.sort(comparePrice);
		
		//Make the Orderbook
		var cashtable="<table width=100%>";
		
		//Current block height
		var currblk = new Decimal(Minima.block);
		
		
		//Sell Orders
		for(i=0;i<tokenorders_sell.length;i++){
			//Trade details..
			var amount  = getOrderAmount(tokenorders_sell[i]);
			var price   = getOrderPrice(tokenorders_sell[i]);
			var total   = amount.mul(price);
			
			var coinid     = tokenorders_sell[i].coin.coinid;
			var coinamount = tokenorders_sell[i].coin.amount;
			var cointoken  = tokenorders_sell[i].coin.tokenid;
			
			var reqaddress = getCoinPrevState(tokenorders_sell[i],1);
			var reqtokenid = getCoinPrevState(tokenorders_sell[i],2);
			var reqamount  = getCoinPrevState(tokenorders_sell[i],3);
			
			//Are we deep enough..
			var inblk =  new Decimal(tokenorders_sell[i].inblock);
			var diff  =  currblk.sub(inblk);
			if(diff.gte(3)){
				//Create the order function
				var tkorder = "takeOrder('BUY', '"+coinid+"', '"+coinamount+"', '"+cointoken+"', '"+reqaddress+"', '"+reqamount+"', '"+reqtokenid+"', '"+price+"', '"+amount+"', '"+total+"' );";
				cashtable+="<tr style='cursor: pointer;' class='infoboxred' onclick=\""+tkorder+"\">"
						  +"<td width=33%>"+amount+"</td> <td width=34%>"+price+"</td> <td width=33%>"+total+"</td> </tr>";
			}else{
				cashtable+="<tr class='infoboxgrey'> "
					+"<td width=33%>"+amount+"</td> <td width=34%>"+price+"</td> <td width=33%>"+total+"</td> </tr>";
			}
		}
		
		//Then the middle..
		cashtable+="<tr class='infoboxblue'><td colspan=3>-------</td></tr>"
		
		//Buy orders
		for(i=0;i<tokenorders_buy.length;i++){
			//Trade details..
			var amount  = getOrderAmount(tokenorders_buy[i]);
			var price   = getOrderPrice(tokenorders_buy[i]);
			var total   = amount.mul(price);
			
			var coinid     = tokenorders_buy[i].coin.coinid;
			var coinamount = tokenorders_buy[i].coin.amount;
			var cointoken  = tokenorders_buy[i].coin.tokenid;
			
			var reqaddress = getCoinPrevState(tokenorders_buy[i],1);
			var reqtokenid = getCoinPrevState(tokenorders_buy[i],2);
			var reqamount  = getCoinPrevState(tokenorders_buy[i],3);
			
			//Are we deep enough..
			var inblk =  new Decimal(tokenorders_buy[i].inblock);
			var diff  =  currblk.sub(inblk);
			if(diff.gte(3)){
				//Create the order function
				var tkorder = "takeOrder('SELL', '"+coinid+"', '"+coinamount+"', '"+cointoken+"', '"+reqaddress+"', '"+reqamount+"', '"+reqtokenid+"', '"+price+"', '"+amount+"', '"+total+"' );";
				cashtable+="<tr style='cursor: pointer;' class='infoboxgreen' onclick=\""+tkorder+"\">"
						  +"<td width=33%>"+amount+"</td> <td width=34%>"+price+"</td> <td width=33%>"+total+"</td> </tr>";
			}else{
				cashtable+="<tr class='infoboxgrey'> "
					+"<td width=33%>"+amount+"</td> <td width=34%>"+price+"</td> <td width=33%>"+total+"</td> </tr>";
			}
		}
		
		//Finish up..
		cashtable+="</table>";
		
		//Set it..
		document.getElementById("dexxed_orderbook").innerHTML = cashtable;
	});
	
}

function takeOrder(type, coinid, coinamount, cointokenid, reqaddress, reqamount, reqtokenid,  price, amount, total){
	var order ="";
	if(type == 'SELL'){
		var tokenname = getTokenName(reqtokenid);
		var order = type+" "+reqamount+" "+tokenname+" @ "+price+"\n\n"+"You RECEIVE "+total+" Minima";
	}else{
		var tokenname = getTokenName(cointokenid);
		var order = type+" "+amount+" "+tokenname+" @ "+price+"\n\n"+"You SPEND "+total+" Minima";
	}
	
	if(!confirm("Please confirm Acceptance of this Order..\n\n"+order)){
		return;
	}
	
	//Create the TXN
	var txnid = Math.floor(Math.random()*1000000000);
	
	//First create a transaction paying him.. and an new address for you..
	var txncreator =    
		"txncreate "+txnid+";"+
		"txnauto "+txnid+" "+reqamount+" "+reqaddress+" "+reqtokenid+";";
	
	//Create this first stage
	Minima.cmd(txncreator, function(resp){
		respjson = JSON.parse(resp);
		if(respjson[1].status != true){
			alert("Something went wrong.. ?\n\n"+respjson[1].error+"\n\nCheck console log.. ");
			console.log(resp);
		}else{
			//Create a new address..
			Minima.cmd("newaddress" , function(resp){
				addrjson = JSON.parse(resp);
				var myaddress = addrjson.response.address.hexaddress;
				
				//Now add the final bits to the transaction..
				txncreator =    
					//Input the order
					"txninput "+txnid+" "+coinid+" 0;"+
					//Send it to yourself..
					"txnoutput "+txnid+" "+coinamount+" "+myaddress+" "+cointokenid+";"+
					//Re Sign it.. 
					"txnsignauto "+txnid+";"+
					//POST IT!
					"txnpost "+txnid+";"+
					"txdelete "+txnid+";";
				
				Minima.cmd(txncreator , function(resp){
					alert("ORDER COMMITED");
				});
			});
		}
	});
}


function comparePrice(a, b) {
	var price_a = getOrderPrice(a);
	var price_b = getOrderPrice(b);
	if (price_a > price_b) {
        return -1;
    }
    if (price_b > price_a) {
        return 1;
    }
    return 0;
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
	if(tokenid == "0x00"){
		return "Minima";
	}
	
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

function getOrderPrice(coinproof){
	//get the PREVSTATE details that define the trade
	var amount      = new Decimal(getCoinPrevState(coinproof,3));
	var coin_amount = new Decimal(coinproof.coin.amount);
	var coin_token  = coinproof.coin.tokenid;
	
	//Calculate the price..
	var dec_amount = new Decimal(0);
	var dec_price  = new Decimal(0);
	
	if(coin_token == "0x00"){
		//BUY
		dec_amount   = amount;
		dec_price    = coin_amount.div(dec_amount);
	}else{
		//SELL
		scale        = getTokenScale(coin_token);
		dec_amount   = coin_amount.mul(scale);
		dec_price    = amount.div(dec_amount);
	}
	
	return dec_price;
}

function getOrderAmount(coinproof){
	//get the PREVSTATE details that define the trade
	var amount      = new Decimal(getCoinPrevState(coinproof,3));
	var coin_amount = new Decimal(coinproof.coin.amount);
	var coin_token  = coinproof.coin.tokenid;
	
	//Calculate the price..
	var dec_amount = new Decimal(0);
	var dec_price  = new Decimal(0);
	
	if(coin_token == "0x00"){
		//BUY
		dec_amount   = amount;
		dec_price    = coin_amount.div(dec_amount);
		
	}else{
		//SELL
		scale        = getTokenScale(coin_token);
		dec_amount   = coin_amount.mul(scale);
		dec_price    = amount.div(dec_amount);
	}
	
	return dec_amount;
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
//	console.log("Token Selected : "+currentToken.token);
	UpdateOrderBook();
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
		if(!confirm("Please Confirm :\n\nBUY "+amount+" "+currentToken.token+" @ "+price+" Minima\n\nTotal Order Value : "+dec_total)){
			return;
		}	
	}else{
		if(!confirm("Please Confirm :\n\nSELL "+amount+" "+currentToken.token+" @ "+price+" Minima\n\nTotal Order Value : "+dec_total)){
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
			"txncreate "+txnid+";"+
			"txnstate "+txnid+" 0 "+pubkey+";"+
			"txnstate "+txnid+" 1 "+address+";"+
			"txnstate "+txnid+" 2 "+wanttokenid+";"+
			"txnstate "+txnid+" 3 "+dec_amount+";"+
			"txnauto "+txnid+" "+dec_total+" "+dexaddress+" "+transtokenid+";"+
			"txnpost "+txnid+";"+
			"txndelete "+txnid+";";
		
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


