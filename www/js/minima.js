/**
* Minima Finance JS lib for integrating Minima into  websites..
* 
* MiFi
* 
*/

/**
 * The RPC host 
 */
var RPCHOST = "";

//The UUID
var UUID = Math.floor(Math.random()*1000000000);

var initText = "<center><h3>Minima - MiFi</h3>" + 
window.location.host+" would like to access the Minima network via your phone.<br>" + 
"<br>" +
"To get started you must first link your phone to this webpage<br>" + 
"<br>" +
"Your phone and this computer must be running on the same WiFi<br>" +
"<br>"+
"To continue.. press<br>" + 
"<br>" + 
"<button onclick='stage2();'>Next</button><br>" +
//"<br>" +
//"If this webpage is actually ON your phone..<br>" +
//"<br>" +
//"<button onclick='stageLink();'>Local Link</button><br>" + 
"</center>";

var stageTwo = "<center><h3>Minima - MiFi</h3>\n" + 
"<center>" +
"<div id='miniqrcode' style='width:200px; height:200px; margin-top:15px;'></div>"+
"<br>" + 
"Open the Minnma app and choose <b>Weblink</b><br>" + 
"<br>" + 
"OR<br><br>" +
"Open the <b>Terminal</b> and type :<br><br>" +
"weblink " + UUID+ 
"</center>";

/**
 * Initialise access to Minima
 * 
 * @param callback
 * @returns
 */
function MinimaStart(startcallback){
	//Log a little..
	console.log("Minima : Initialisation started..");
	
	//Do we already have an IP to talk to..
//	var ip = window.localStorage.getItem("phoneip");
//	if(ip == null){
//		ip = "none";
//	}else{
//		//Check if this connection still valid..
//		console.log("Minima : Previouis settings found.. testing..");
//	}
	
	//First add the total overlay div
	var overdiv = document.createElement('div');
	overdiv.className = "full-screen-div";
	overdiv.id = "MinimaOverlay";
	document.body.appendChild(overdiv);
	
	//Now add the main Minima MiFi setup div
	var div = document.createElement('div');
	div.className = "center-div";
	div.id = "MinimaDIV";
	div.innerHTML = initText;
	document.body.appendChild(div);

	//Open up a websocket to the main MINIMA proxy..
	var ws = new WebSocket("ws://127.0.0.1:8889");
	
	ws.onopen = function() {
		console.log("WS Connection opened to the Minima Proxy..");
		
		// Web Socket is connected, send data using send()
	   ws.send(UUID);
	};
	
	ws.onmessage = function (evt) { 
	   console.log("WS message received : "+evt.data);
	   
	   //Now that we have the IP.. Set it.. 
	   window.localStorage.setItem('phoneip', evt.data);
	   
	   //Set it..
	   RPCHOST = evt.data;
	   
	   //And close
	   ws.close();
	   
	   //Hide the Divs..
	   document.getElementById("MinimaDIV").style.display = "none";
	   document.getElementById("MinimaOverlay").style.display = "none";
	   
	   startcallback();
	   
//	   //And finally..
//	   var data = { "event":"startup" }
//	   
//	   //And dispatch
//	   var event = new CustomEvent('MinimaEvent', {detail:data});
//	   window.dispatchEvent(event);
	};
		
	ws.onclose = function() { console.log("Connection is closed..."); };

	ws.onerror = function(error) {
		//var err = JSON.stringify(error);
		var err = JSON.stringify(error, ["message", "arguments", "type", "name", "data"])
		
	    // websocket is closed.
	   console.log("Error ... "+err); 
	};
}

function stage2(){
	var md = document.getElementById("MinimaDIV");
	
	md.innerHTML = stageTwo;
	
	//Create the QR Code
	var qrcode = new QRCode(document.getElementById("miniqrcode"), {
		width : 200,
		height : 200
	});
	qrcode.makeCode(UUID);
	
//	window.localStorage.setItem('phoneip', 'Time : '+new Date());
}

function MinimaCMD(zRPCCommand, callback){
	//Create the string..
	var rpc = "http://"+RPCHOST+"/"+zRPCCommand;
	
	//And Call it..
	httpGetAsync(rpc, callback);
}


/**
 * Utility function for GET request
 * 
 * @param theUrl
 * @param callback
 * @returns
 */
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}