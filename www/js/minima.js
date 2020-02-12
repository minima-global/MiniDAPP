/**
* Minima Finance JS lib for integrating Minima into  websites..
* 
* MiFi
* 
*/

var Minima = {
	status : "zero",	
	blocknumber : 0,
	host : "0.0.0.0",
	uuid : Math.floor(Math.random()*1000000000),
	logging : true,
	
	//Minima Startup
	init : function(){
		//Log a little..
		log("Initialisation started..");
		
		postMessage("init", "");
		
		//Show the Overlay divs
		showOverlayDivs();
		
		//Now start the Websocket
		startWebSocket();
	},
	
	//Runs a function on the phone
	cmd : function(minifunc, callback){
		//Create the string..
		var rpc = "http://"+Minima.host+"/"+minifunc;

		//log it..
		log("RPC call "+rpc);
		
		//And Call it..
		httpGetAsync(rpc, callback);
	},
	
	//Wipes the Locally stored details of the phone IP
	logout : function(){}
};

/**
 * Utility functions used by the Minima Object
 * 
 */
function log(info){
	if(Minima.logging){
		console.log("Minima : "+info);
	}
}

function setStatus(status){
	log("Status changed to "+status);
	Minima.status = status;
}

function postMessage(event, info){
   log("Event Dispatch "+event+" "+info);
	
   //And finally..
   var data = { "event": event, "info" : info }
   
   //And dispatch
   var custom = new CustomEvent("MinimaEvent", {detail:data});
   window.dispatchEvent(custom);
}

function showOverlayDivs(){
	var initText = "<center><h3>Minima - MiFi</h3>" + 
	window.location.host+" would like to access the Minima network via your phone.<br><br>" +
	"To get started you must first link your phone to this webpage<br><br>" +
	"Your phone and this computer must be running on the same WiFi<br><br>"+
	"To continue.. press<br><br>" + 
	"<button onclick='stage2();'>Proceed</button><br>" +
	"</center>";

	
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
}

function hideOverLayDivs(){
	//Hide the Divs..
   document.getElementById("MinimaDIV").style.display = "none";
   document.getElementById("MinimaOverlay").style.display = "none";
}

function startWebSocket(){
	//Open up a websocket to the main MINIMA proxy..
	var ws = new WebSocket("ws://127.0.0.1:8889");
	
	ws.onopen = function() {
	   log("WS Connection opened to the Minima Proxy..");
		
	   // Web Socket is connected, send data using send()
	   ws.send(Minima.uuid);
	   
	   //Change the Status
	   setStatus("uuid_sent");
	};
	
	ws.onmessage = function (evt) { 
	   //Now that we have the IP.. Set it.. 
	   window.localStorage.setItem('MinimaIP', evt.data);
	   
	   //Set it..
	   Minima.host = evt.data;
	   log("Host set "+Minima.host);
	   
	   //And close
	   ws.close();
	   
	   //Hide the Divs..
	   hideOverLayDivs();
	   
	   //Should be good..
	   setStatus("connected");
	   
	   //Send a message
	   postMessage("connected", "success")
	};
		
	ws.onclose = function() { 
		log("WS Connection is closed...");
	};

	ws.onerror = function(error) {
		//var err = JSON.stringify(error);
		var err = JSON.stringify(error, ["message", "arguments", "type", "name", "data"])
		// websocket is closed.
	    log("WS Error ... "+err); 
	};
}

function stage2(){
	var stageTwo = "<center><h3>Minima - MiFi</h3>\n" + 
	"<div id='miniqrcode' style='width:200px; height:200px; margin-top:15px;'></div><br>" + 
	"Open the Minnma app and choose <b>Weblink</b><br><br>" + 
	"OR<br><br>" +
	"Open the <b>Terminal</b> and type :<br><br>weblink "+Minima.uuid+ 
	"</center>";
	
	//Set the Text
	document.getElementById("MinimaDIV").innerHTML = stageTwo;
	
	//Create the QR Code
	var qrcode = new QRCode(document.getElementById("miniqrcode"), {
		width : 200,
		height : 200
	});
	qrcode.makeCode(Minima.uuid);
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