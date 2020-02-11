/**
* Minima Finance JS lib for integrating Minima into  websites..
* 
* MiFi
* 
*/

//The UUID
var UUID = Math.floor(Math.random()*100000);

var initText = "<center><h3>Minima - MiFi</h3>" + 
window.location.host+" would like to access the Minima network via your phone.<br>" + 
"<br>" +
"To get started you must first link your phone to this webpage<br>" + 
"<br>" + 
"To continue.. press<br>" + 
"<br>" + 
"<button onclick='stage2();'>Next</button>" + 
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
function MinimaStart(){
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
	   // Web Socket is connected, send data using send()
	   ws.send(UUID);
	   console.log("WS Connection opened to the Minima Proxy..");
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