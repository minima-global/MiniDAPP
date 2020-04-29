/**
 * SCRIPT IDE JS
 */

function runScript(){
	var txt = document.getElementById("scriptarea").value.trim();
	
	//Check for Killer Characters..
	if(txt.indexOf(",")!=-1){alert("NO commas Allowed in Scripts!");return;}
	if(txt.indexOf("\"")!=-1 || txt.indexOf("'")!=-1){alert("NO Quotes Allowed in Scripts!");return;}
	if(txt.indexOf(":")!=-1 || txt.indexOf(";")!=-1){alert("NO semi-colons Allowed in Scripts!");return;}
	
	//Save if you run..
	if(document.getElementById("autosave").checked){
		save();	
	}
	
	//Ready the RPC call
	//var nocomm = txt.replace(/\n/g," ");
	//nocomm =  nocomm.replace(/\/\*.*\*\//g, " ");
	//nocomm =  nocomm.replace(/\s+/g, " ").trim();
	var script     = txt.replace(/\n/g," ").trim();
	var state      = "state:"+document.getElementById("state").value.trim();
	var prevstate  = "prevstate:"+document.getElementById("prevstate").value.trim();
	var sigs       = "sigs:"+document.getElementById("sigs").value.trim();
	var scripts    = "scripts:"+document.getElementById("mastscripts").value.trim();
	var outputs    = "outputs:"+getOutputString();
	var globals    = "globals:"+getGlobals();
	
	if(script == ''){return;}
	Minima.cmd("runscript \""+script+"\" \""+outputs+"\" \""+globals+"\" \""+state+"\" \""+prevstate+"\" \""+sigs+"\" \""+scripts+"\" ",function(json){
		var brkscr = json.response.parse.replace(/\n/g,"<br>");
		
		var res = "---------------------------------<br>";
		if(json.response.parseok){
			res += "PARSE OK : ";	
		}else{
			res += "PARSE FAIL : ";	
		}
		
		if(!json.response.exception){
			res += "RUN OK : ";	
		}else{
			res += "RUN FAIL : ";	
		}
		
		if(json.response.result){
			res += "RESULT TRUE ";	
		}else{
			res += "RESULT FALSE ";	
		}
		
		//Set it
		document.getElementById("parse").innerHTML = res+"<br>---------------------------------<br>"+brkscr;	
		document.getElementById("parse").scrollTop = 0;
		
		document.getElementById("clean").innerHTML = json.response.clean;
		document.getElementById("clean").scrollTop = 0;
		
		//Set the global address
		document.getElementById("cleanaddress").innerHTML = json.response.address;
		document.getElementById("@ADDRESS").value = json.response.address;
	});
}

var globals = "";
function addGlobalIfValid(globalname){
	if(document.getElementById(globalname).value.trim() !== ""){
		globals += globalname+":"+document.getElementById(globalname).value.trim()+"#";
	} 
}
function getGlobals(){
	globals = "";
	
	addGlobalIfValid("@BLKNUM");
	addGlobalIfValid("@INBLKNUM");
	addGlobalIfValid("@INPUT");
	addGlobalIfValid("@AMOUNT");
	addGlobalIfValid("@TOKENID");
	addGlobalIfValid("@COINID");
	addGlobalIfValid("@TOTIN");
	addGlobalIfValid("@TOTOUT");
	
	return globals;
}

function clearGlobals(){
	document.getElementById("@BLKNUM").value = "";
	document.getElementById("@INBLKNUM").value = "";
	document.getElementById("@INPUT").value = "";
	document.getElementById("@ADDRESS").value = "";
	document.getElementById("@AMOUNT").value = "";
	document.getElementById("@TOKENID").value = "";
	document.getElementById("@COINID").value = "";
	document.getElementById("@TOTIN").value = "";
	document.getElementById("@TOTOUT").value = "";
}

function getOutputString(){
	var outputs    = "";
	var table = document.getElementById("outputtable");
	var rows  = table.getElementsByTagName("tr")
	var len   = rows.length;
	for(i=2;i<len;i++){
		var address = document.getElementById("table_address_"+i).innerHTML;
		var amount  = document.getElementById("table_amount_"+i).innerHTML;
		var tokenid = document.getElementById("table_tokenid_"+i).innerHTML;
		
		outputs += address+":"+amount+":"+tokenid+"#";
	}
	
	return outputs;
}

//Deafult - Save the selected 
function save(){
	saveScript(document.getElementById("scripts").selectedIndex);
}

function saveScript(sel){
	//Get all this different parts..
	var scriptarea = document.getElementById("scriptarea").value;
	var state      = document.getElementById("state").value;
	var prevstate  = document.getElementById("prevstate").value;
	var sigs       = document.getElementById("sigs").value;
	var scripts    = document.getElementById("mastscripts").value;
	var outputs    = getOutputString();
	var globals    = getGlobals();
	
	//Create a JSON out of it..
	var storejson = { "script":scriptarea, 
						"state":state, 
						"prevstate":prevstate, 
						"sigs":sigs, 
						"outputs":outputs,
						"scripts":scripts,
						"globals":globals
					};
	
	//Convert the whole thing to a tring
	var jsontext = JSON.stringify(storejson);
	//console.log("SAVE JSON:"+jsontext);
	
	//Now store it..
    window.localStorage.setItem('ScriptIDE'+sel,jsontext);
}

var prevsel = 0;
function loadScript(){
	//Load cached if available..
	var sel = document.getElementById("scripts").selectedIndex;
	
	//Save the OLD
	if(document.getElementById("autosave").checked){
		saveScript(prevsel);
	}
	prevsel = sel;
	
	//Load the JSON
	var jsontext = window.localStorage.getItem('ScriptIDE'+sel);
	//console.log("LOAD JSON:"+jsontext);
	
	if(jsontext != null){
		//Convert to a JSON
		var json = JSON.parse(jsontext);
		
		document.getElementById("scriptarea").value = json.script;
		document.getElementById("state").value      = json.state;
		document.getElementById("prevstate").value  = json.prevstate;
		document.getElementById("mastscripts").value  = json.scripts;
		document.getElementById("sigs").value       = json.sigs;
		
		//Load the OUTPUTS..
		clearAllOutputs();
		var outs = json.outputs.split("#");
		outlen   = outs.length;
		for(i=0;i<outlen;i++){
			if(outs[i] !== ""){
				var out = outs[i].split(":");
				addOutput(out[0],out[1],out[2]);	
			}
		}
		
		//Load the GLOBALS..
		clearGlobals();
		var globs = json.globals.split("#");
		globlen   = globs.length;
		for(i=0;i<globlen;i++){
			if(globs[i] !== ""){
				var glob = globs[i].split(":");
				document.getElementById(glob[0]).value = glob[1];
			}
		}
		
	}else{
		//Reset the values..
		document.getElementById("scriptarea").value = "";
		document.getElementById("state").value      = "";
		document.getElementById("prevstate").value  = "";
		document.getElementById("sigs").value       = "";
		
		clearGlobals();
		clearAllOutputs();
	}
	
	//reset..
	document.getElementById("parse").innerHTML = "";
	document.getElementById("clean").innerHTML = "";
}

/**
* The OUTPUTS table
*/
function addDefault(){
	var addr = document.getElementById("output_address").value;
	var amt  = document.getElementById("output_amount").value;
	var tok  = document.getElementById("output_tokenid").value;
	addOutput(addr,amt,tok);
}

function addOutput(addr,amt,tok){
	var table = document.getElementById("outputtable");
	var rows  = table.getElementsByTagName("tr")
	var len   = rows.length;
	var out   = len-2;
	
	var row     = table.insertRow(len);
	var output  = row.insertCell(0);
	var address = row.insertCell(1);
	var amount  = row.insertCell(2);
	var tokenid = row.insertCell(3);
	
	//Data..
	output.id = "table_output_"+len;
	output.innerHTML = ""+out;
	
	address.id = "table_address_"+len;
	address.innerHTML = ""+addr;
	
	amount.id = "table_amount_"+len;
	amount.innerHTML = ""+amt;
	
	tokenid.id = "table_tokenid_"+len;
	tokenid.innerHTML = ""+tok;
}

function deleteOutput(){
	var table = document.getElementById("outputtable");
	var rows  = table.getElementsByTagName("tr")
	var len   = rows.length;
	
	if(len>2){
		table.deleteRow(len-1);	
	}
}

function clearAllOutputs(){
	var table = document.getElementById("outputtable");
	var rows  = table.getElementsByTagName("tr")
	var len   = rows.length;
	
	for(i=2;i<len;i++){
		deleteOutput();
	}
	
	document.getElementById("output_address").value = "0x00";
	document.getElementById("output_amount").value = "0";
	document.getElementById("output_tokenid").value = "0x00";
}