/**
 * TOKENATOR JS
 */
var NONFUNGIBLESCRIPT = "ASSERT FLOOR ( @AMOUNT ) EQ @AMOUNT LET checkout = 0 WHILE ( checkout LT @TOTOUT ) DO IF GETOUTTOK ( checkout ) EQ @TOKENID THEN LET outamt = GETOUTAMT ( checkout ) ASSERT FLOOR ( outamt ) EQ outamt ENDIF LET checkout = INC ( checkout ) ENDWHILE RETURN TRUE";

function initTokenator(){
	//Create the create database..
	var initsql = "CREATE TABLE IF NOT EXISTS validation ( tokenid VARCHAR(160) NOT NULL, result INTEGER NOT NULL )";
	
	//Run the initialising SQL
	Minima.sql(initsql,function(resp){
		if(!resp.status){
			alert("Error in Init SQL..\n\n"+resp.message);
			console.log(JSON.stringify(resp, null, 2));
		}
		
		//Set the create page
		setMyTokens();
	});
	
}

function setMyTokens(){
	var mytokens = createTokenList(Minima.balance);	
	document.getElementById("mainpage").innerHTML = mytokens;
}

function setAllTokens(){
	Minima.cmd("tokens",function(respjson){
		var mytokens = createTokenList(respjson.response.tokens);	
		document.getElementById("mainpage").innerHTML = mytokens;	
	});
}

function createTokenList(TokenJSON){
	//Cycle through the balance
	var len = TokenJSON.length;

	var createpage = "<table align=center border=0 width=700>";
	
	//Only Minima?
	if(len <= 1){
		createpage += "<tr> <td style='text-align:center;'> <b>NO TOKENS FOUND</b> </td> </tr> </table>";
		return createpage;
	}
	
	for(bal=0;bal<len;bal++){
		//Get the balance object
		var balobj = TokenJSON[bal];
		
		//Don't show Minima..
		if(balobj.tokenid == "0x00"){
			continue;
		}
		
		//icon
		var icon = "http://mifi.minima.global/images/icon.png";
		if(balobj.icon && balobj.icon!= ""){
			icon = balobj.icon;
		}
		
		//Description..
		var desc = "No description..";
		if(balobj.description && balobj.description!= ""){
			desc = balobj.description;
		}
		desc = desc.replace(/\n/g,"<br>");
		
		//Fungible..
		var fungible = "UNKNOWN";
		if(balobj.script == "RETURN TRUE"){
			fungible = "FUNGIBLE";
		}else if(balobj.script == NONFUNGIBLESCRIPT){
			fungible = "NON FUNGIBLE";
		}
		
		//proof
		var proof = "No proof URL provided";
		var proofprov = " disabled " 
		if(balobj.proof && balobj.proof!= ""){
			proof = balobj.proof;
			proofprov = "";
		}
		
		createpage += 
		"<tr class='tokenrow'>\n" + 
		"	<td rowspan=3 width=120 style='padding:10px;'><img width=100 src='"+icon+"'></td>  \n" + 
		"	<td colspan=2 height=100 style='font-weight:bold;font-size:38px;text-align:center;'>"+balobj.token+"</td>\n" + 
		"</tr>\n" + 
		"<tr class='tokenrow'>\n" + 
		"	<td colspan=2 style='font-size:10px;'> "+balobj.tokenid+" </td>\n" + 
		"</tr>\n" + 
		"<tr class='tokenrow'>\n" + 
		"	<td width=600> "+balobj.confirmed+" / "+balobj.total+" total coins</td>\n" + 
		"	<td style='text-align:center;white-space: nowrap;'>&nbsp;"+fungible+"&nbsp;</td>\n" +
		"</tr>\n" + 
		"<tr class='tokenrow'>\n" + 
		"	<td colspan=3 style='padding:10px;'>"+desc+"</td>\n" + 
		"</tr>"+
		"<tr class='tokenrow'>\n" + 
		"	<td width=650 style='padding:10px;' colspan=2>"+proof+"</td> <td style='text-align:center;'><button onclick='validate(\""+balobj.tokenid+"\");' "+proofprov+"> VALIDATE </button></td> \n" + 
		"</tr>"+
		"<tr class='tokenrow'>\n" + 
		"	<td colspan=3 style='padding:10px;'>"+balobj.script+"</td>\n" + 
		"</tr>"+
		"<tr><td>&nbsp;</td></tr>";
	}
	
	createpage += "</table>";
	
	return createpage;
}

function setCreateToken(){
	
	var createpage = "<table align=center border=0 width=700>\n" + 
	"<tr class='createtablerow'><td colspan=2>&nbsp;</td></tr>\n" +
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Name : </td>" +
	"   <td class='createtableright'><input type=text id=createname size=60 required> <br> The main name for the token </td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Icon : </td>" +
	"   <td class='createtableright'><input  placeholder='optional' type=text id=createicon size=60> <br> An URL to web hosted icon, *.png, *.jpg </td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Description : </td>" +
	"   <td class='createtableright'><textarea placeholder='optional' maxlength='255' style='resize:none;' rows='6' cols='60' id=createdesc></textarea> <br> Plain description of the token </td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> NFT : </td>" +
	"   <td class='createtableright'><input type=checkbox id=createnft><br>Non Fungible Token - NOT divisiable by less than 1 unit</td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Amount : </td>" +
	"   <td class='createtableright'><input type=number id=createtotal size=40 value='1000' required> <br> Number of total tokens there are</td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Proof : </td>" +
	"   <td class='createtableright'><input type=text id=createproof size=60 placeholder='optional'> <br> HTTP link to a text file with this 'tokenid' in it<br>MUST set this now.. but create and edit file later</td>" + 
	"</tr>\n" + 
	
	"<tr class='createtablerow'><td colspan=2>&nbsp;</td></tr>\n" +
	
	"<tr class='createtablerow'>\n" + 
	"	<td  class='createtableleft' colspan=2> <button class='createtokenbutton' onclick='createToken();'> CREATE TOKEN </button></td>\n" + 
	"</tr>\n" + 
	"</table>";
	
	document.getElementById("mainpage").innerHTML = createpage;
}

function createToken(){
	var name   = document.getElementById("createname").value.trim().replace(/;/g,"");
	var amount = document.getElementById("createtotal").value.trim();
	if(name == "" || amount==""){
		alert("Must specify Name and Amount");
		return;
	}
	
	//Ask for confirmation
	if(!confirm("Confirm you wish to create this token ?")){
		return;
	}
	
	//Get the details..
	var icon   = document.getElementById("createicon").value.trim().replace(/;/g,"");
	var desc   = document.getElementById("createdesc").value.trim().replace(/;/g,"");
	var proof  = document.getElementById("createproof").value.trim().replace(/;/g,"");
	
	//Is it fungible..
	var nft    = document.getElementById("createnft").checked;
	var script = "RETURN TRUE";
	if(nft){
		script = NONFUNGIBLESCRIPT;
	}
	
	//Create the function call..
	var createtoken = "tokencreate name:\""+name+"\" amount:"+amount+" description:\""+desc+"\" script:\""+script+"\" icon:"+icon+" proof:"+proof;
	
	//Run it!
	Minima.cmd(createtoken,function(respjson){
		if(!respjson.status){
			console.log(JSON.stringify(respjson,null,2));
			alert(respjson.message);
			return;
		}
		
		Minima.util.notify("Token created..");
		
		document.getElementById("createname").value  = "";
		document.getElementById("createtotal").value = "1000";
		document.getElementById("createicon").value  = "";
		document.getElementById("createdesc").value  = "";
		document.getElementById("createproof").value = "";
	});
}

function validate(tokenid){
	var cmd = "tokenvalidate "+tokenid;
	console.log(cmd);
	
	Minima.cmd(cmd,function(jsonresp){
		
		if(jsonresp.response.valid){
			//Get the HOST
			var host = jsonresp.response.host;
			
			alert("VALID\n\nBacked by : "+host);
			
		}else{
			alert("INVALID..");
		}
	});	
}

function insertProof(){
	
}