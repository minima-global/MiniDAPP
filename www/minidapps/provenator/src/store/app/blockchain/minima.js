/**
* Minima Finance JS lib for integrating Minima into  websites..
*
* MiFi
*
* Includes the QRCode library
*
* AND the Decimal.js lib for precise Maths.
*
* @spartacusrex
*/
import {Decimal} from 'decimal.js'
import {QRCode} from 'davidshimjs-qrcodejs'

/**
 * Are we running in MINIDAPP mode
 */
var MINIMA_IS_MINIDAPP = true;

/**
 * When running as MiniDAPP Where is the Server host RPC
 *
 * This replaced AUTOMATICALLY by the Minima App..
 */
var MINIMA_MINIDAPP_HOST = "127.0.0.1:8999";

/**
 * The Web Socket Host
 */
var MINIMA_WEBSOCKET_HOST = "ws://127.0.0.1:20999";

/**
 * MiFi Proxy Server for initial connect
 */
var MIFIHOST              = "mifi.minima.global";

/**
 * GLOBAL VARIABLES
 */
var MAIN_DIV 		= "MINIMA_MAIN_DIV";
var OVERLAY_DIV 	= "MINIMA_OVERLAY_DIV";
var LOGOUT_BUTTON   = "MINIMA_LOGOUT_BUTTON";


var WEBSOCK         = null;
var MINIMACONNECTED = false;

var MINIMA_COMMS_SOCK = null;
var MINIDAPP_FUNCSTORE_LIST = [];

/**
 * Main MINIMA Object for all interaction
 */
export const Minima = {
	block : 0,
	txpowid : "0x00",
	host : "0.0.0.0",
	status : {},
	balance : {},
	uuid : Math.floor(Math.random()*1000000000),
	logging : false,
	showmining : false,

	//Minima Startup
	init : function(){
		//Log a little..
		Minimalog("Initialisation..");

		//Are we running in MINDAPPS MODE
		if(!MINIMA_IS_MINIDAPP){
			//Create the Overlay Divs - but don't show them yet
			createOverlayDivs();

			//Do we have an IP already
			var ip = window.localStorage.getItem('MinimaIP');
			if(ip !== null && ip !== ""){
				Minimalog("Previous host found "+ip);

				//Use it..
				Minima.host = ip;

				//Now set the websocket Host
			    var justhost = Minima.host.indexOf(":");
			    var justip   = Minima.host.substring(0,justhost);
			    MINIMA_WEBSOCKET_HOST = "ws://"+justip+":20999";
			    Minimalog("Minima Websocket set "+Minima.host);

				//Show Logout.. in case we need to as previous connection is broken
				show(LOGOUT_BUTTON);

				//Do the first call..
				initialStatus();

				//That's it.
				return;
			}

			//Set some text..
			setInitPage();

			show(OVERLAY_DIV);
			show(MAIN_DIV);
			hide(LOGOUT_BUTTON);
		}else{
			//Use it..
			Minima.host = MINIMA_MINIDAPP_HOST;

			//Do the first call..
			initialStatus();
		}
	},

	//Clean Shutdown..
	exit : function(){
		if(WEBSOCK != null){
			if(WEBSOCK.readyState == WebSocket.OPEN){
				WEBSOCK.close();
			}
		}

		if(MINIMA_COMMS_SOCK != null){
			if(MINIMA_COMMS_SOCK.readyState == WebSocket.OPEN){
				MINIMA_COMMS_SOCK.close();
			}
		}
	},

	//Runs a function on the phone
	cmd : function(minifunc, callback){
		//Encode ready for transmission..
		var enc = encodeURIComponent(minifunc);

		//Encoded copy
		var rpc = "http://"+Minima.host+"/"+enc;

		//And Call it..
		httpGetAsync(rpc, callback, true);
	},

	//Runs SQL in the Database created for this MiniDAPP
	sql : function(query, callback){
		//Encode ready for transmission..
		var enc = encodeURIComponent(query);

		//Encoded copy
		var rpc = "http://"+Minima.host+"/sql/"+enc;

		//And Call it..
		httpGetAsync(rpc, callback, true);
	},

	//Wipes the Locally stored details of the phone IP
	logout : function(){
		//Remove the locally stored IP
		window.localStorage.removeItem('MinimaIP');

		//And refresh the page..
		location.reload();
	},

	/**
	 * UTILITY FUNCTIONS
	 */
	util : {
			//Get the Balance string for a Tokenid..
			getBalance : function(tokenid){
				var ballen = Minima.balance.length;
				for(balloop=0;balloop<ballen;balloop++){
					if(Minima.balance[balloop].tokenid == tokenid){
						var bal     = Minima.balance[balloop].confirmed;
						var balsend = Minima.balance[balloop].sendable;
						var balun   = Minima.balance[balloop].unconfirmed;
						var mempool = Minima.balance[balloop].mempool;

						//Is there unconfirmed money coming..
						if(balun !== "0" || mempool !== "0" || balsend !== bal){
							return balsend+" ("+bal+") / "+balun+" / "+mempool;
						}else{
							return ""+bal;
						}
					}
				}

				//Not found..
				return "0";
			},

			checkAllResponses : function(responses){
				let len = responses.length;
				for(var i=0;i<len;i++){
					if(responses[i].status != true){
						alert(responses[i].message+"\n\nERROR @ "+responses[i].minifunc);
						Minimalog("ERROR in Multi-Command ["+i+"] "+JSON.stringify(responses[i],null,2));
						return false;
					}
				}

				return true;
			},

			getStateVariable : function(statelist, port){
				var pslen = statelist.length;
				for(psloop=0;psloop<pslen;psloop++){
					if(statelist[psloop].port == port){
						return statelist[psloop].data;
					}
				}

				//Not found
				return null;
			},

			notify : function(message,bgcolor){
				//Log it..
				Minimalog("Notify : "+message);

				//Show a little popup across the screen..
				if(bgcolor){
					createMinimaNotification(message,bgcolor);
				}else{
					createMinimaNotification(message);
				}
			},

			send : function(minidappid, message, callback){
				//Create a random number to track this function call..
				var funcid = ""+Math.floor(Math.random()*1000000000);

				//Construct a JSON object
				msg = { "type":"message", "to":minidappid, "funcid":funcid, "message":message };

				//Add this Funcid and this callback to the list.. when you receive a reply
				//you can respond to the correct callback
				funcstore = { "functionid":funcid, "callback":callback };
				MINIDAPP_FUNCSTORE_LIST.push(funcstore);

				//And send it..
				MINIMA_COMMS_SOCK.send(JSON.stringify(msg));
			},

			reply : function(evt, message){
				//Get the reply id
				var replyid = evt.detail.info.replyid;
				var replyto = evt.detail.info.from;

				//Construct a JSON object
				msg = { "type":"reply", "to":replyto, "replyid":replyid, "message":message };

				//And send it..
				MINIMA_COMMS_SOCK.send(JSON.stringify(msg));
			},

			setUID : function(uid){
				//UID JSON Message
				uid = { "type":"uid", "location": window.location.href, "uid":uid };

				//Send your name.. normally set automagically but can be hard set when debugging
				MINIMA_COMMS_SOCK.send(JSON.stringify(uid));
			}

	}

};

function postMinimaMessage(event, info){
   //And finally..
   var data = { "event": event, "info" : info }

   //And dispatch
   var custom = new CustomEvent("MinimaEvent", {detail:data});
   window.dispatchEvent(custom);
}

/**
 * The Fist connection status message
 *
 * @returns
 */
function initialStatus(){
	//Encoded rpc call
	var rpc = "http://"+Minima.host+"/"+encodeURIComponent("status;balance");

	//Check the Status - use base function so no log..
	httpGetAsync(rpc,function(json){
	    //Status is first..
		Minima.status  = json[0].response;
		Minima.balance = json[1].response.balance;

	    //Store this..
	    Minima.txpowid = Minima.status.tip;
	    Minima.block   = parseInt(Minima.status.lastblock,10);

	    //Hide the Divs..
	    if(!MINIMA_IS_MINIDAPP){
		    hide(MAIN_DIV);
		    hide(OVERLAY_DIV);
		    show(LOGOUT_BUTTON);
	    }

	    //Start Listening for messages..
		startWebSocketListener();
   });
}

function advancedConnect(){
	//Get the Value
	var host = document.getElementById("minimaconnect").value.trim();

	//Default to local host
	if(host == ''){
		alert("Connecting to 127.0.0.1:8999");
		host = "127.0.0.1:8999";
	}

	//Now that we have the IP.. Set it..
    window.localStorage.setItem('MinimaIP', host);

    //Set it..
    Minima.host = host;
    Minimalog("Host set "+Minima.host);

    //Now set the websocket Host
    var justhost = host.indexOf(":");
    var justip = host.substring(0,justhost);

    MINIMA_WEBSOCKET_HOST = "ws://"+justip+":20999";
    Minimalog("Minima Websocket set "+Minima.host);

    //Run Status once to populate the main details..
    initialStatus();
}

/**
 * Start the WebSocket Proxy Connector
 * @returns
 */
function startWebSocket(){
	MINIMACONNECTED = false;

	var sockhost = "ws://"+MIFIHOST+":8889";

	Minimalog("Starting WebSocket to "+sockhost+" uuid:"+Minima.uuid);

	//Open up a websocket to the main MINIMA proxy..
	WEBSOCK = new WebSocket(sockhost);

	WEBSOCK.onopen = function() {
		Minimalog("WS Connection opened to the Minima Proxy..");
	};

	WEBSOCK.onmessage = function (evt) {
	   //Now that we have the IP.. Set it..
	   window.localStorage.setItem('MinimaIP', evt.data);

	   //Set it..
	   Minima.host = evt.data;
	   Minimalog("Host set "+Minima.host);

	   //And close
	   WEBSOCK.close();

	   //Run Status once to populate the main details..
	   initialStatus();
	};

	WEBSOCK.onclose = function() {
		Minimalog("WS Connection is closed...");
	};

	WEBSOCK.onerror = function(error) {
		//var err = JSON.stringify(error);
		var err = JSON.stringify(error, ["message", "arguments", "type", "name", "data"])
		// websocket is closed.
	    Minimalog("WS Error ... "+err);
	};
}

function closeWebSocket(){
	if(WEBSOCK !== null){
		WEBSOCK.close();
		WEBSOCK = null;
	}
}

function startWebSocketListener(){
	Minimalog("Starting WebSocket Listener @ "+MINIMA_WEBSOCKET_HOST);

	//Check connected
	if(MINIMA_COMMS_SOCK !== null){
		MINIMA_COMMS_SOCK.close();
	}

	//Open up a websocket to the main MINIMA proxy..
	MINIMA_COMMS_SOCK = new WebSocket(MINIMA_WEBSOCKET_HOST);

	MINIMA_COMMS_SOCK.onopen = function() {
		//Connected
		Minimalog("Minima WS Listener Connection opened..");

		//We Are Connected..
	    MINIMACONNECTED = true;

	    //Send a message
	    postMinimaMessage("connected", "success");
	};

	MINIMA_COMMS_SOCK.onmessage = function (evt) {
		//Convert to JSON
		var jmsg = JSON.parse(evt.data);

		if(jmsg.event == "newblock"){
			//Set the new status
			Minima.status  = jmsg.status;
			Minima.txpowid = jmsg.status.tip;
			Minima.block   = parseInt(jmsg.status.lastblock,10);

			//Post it
			postMinimaMessage("newblock",jmsg.txpow);

		}else if(jmsg.event == "newtransaction"){
			//New Transaction
			postMinimaMessage("newtransaction",jmsg.txpow);

		}else if(jmsg.event == "newbalance"){
			//Set the New Balance
			Minima.balance = jmsg.balance;

			//Post it..
			postMinimaMessage("newbalance",jmsg.balance);

		}else if(jmsg.event == "newmessage"){
			//Create a nice JSON message
			var msgdata = { "message":jmsg.message, "replyid":jmsg.functionid, "from":jmsg.from};

			//Post it..
			postMinimaMessage("newmessage",msgdata);

		}else if(jmsg.event == "newreply"){
			var funclen = MINIDAPP_FUNCSTORE_LIST.length;
			for(i=0;i<funclen;i++){
				if(MINIDAPP_FUNCSTORE_LIST[i].functionid == jmsg.functionid){
					//Get the callback
					callback = MINIDAPP_FUNCSTORE_LIST[i].callback;

					//Was there an ERROR
					if(jmsg.error !== ""){
						//Log the error
						Minimalog("Message Error : "+jmsg.error);
					}else{
						//call it with the reply message
						callback(jmsg.message);
					}

					//And remove it from the list..
					MINIDAPP_FUNCSTORE_LIST.splice(i,1);

					//All done
					return;
				}
			}

			//Not found..
			Minimalog("REPLY CALLBACK NOT FOUND "+JSON.stringify(jmsg));

		}else if(jmsg.event == "txpowstart"){
			Minima.util.notify("Mining Transaction Started..","#55DD55");

		}else if(jmsg.event == "txpowend"){
			Minima.util.notify("Mining Transaction Finished","#DD5555");
		}
	};

	MINIMA_COMMS_SOCK.onclose = function() {
		Minimalog("Minima WS Listener closed... reconnect attempt in 10 seconds");

		//Start her up in a minute..
		setTimeout(function(){ startWebSocketListener(); }, 10000);
	};

	MINIMA_COMMS_SOCK.onerror = function(error) {
		//var err = JSON.stringify(error);
		var err = JSON.stringify(error, ["message", "arguments", "type", "name", "data"])

		// websocket is closed.
	    Minimalog("Minima WS Listener Error ... "+err);
	};
}

/**
 * STAGE 1 Initial Pager that appears..
 */
function setInitPage(){
	//Close the WebSocket
	closeWebSocket();

	//Not Connected
	MINIMACONNECTED = false;

	//Set the Text
	var text = "<table border=0 width=350px height=100%>\n" +
	"	\n" +

	"	<tr>\n" +
	"		<td height=50 width='50px' style='text-align:left;vertical-align:middle;'><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"		<td height=50 width='250px' style='text-align:center;vertical-align:middle;'><br><h3>MINIMA MIFI</h3></td>\n" +
	"		<td height=50 width='50px' style='text-align:right;vertical-align:middle;'><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"	</tr>\n" +

	"	\n" +
	"	<tr>\n" +
	"		<td height=100% style='vertical-align:top;font-size:14;' colspan=3>\n" +
	"<br>\n" +

	"Welcome..<br>\n" +
	"<br>\n" +
	window.location.host+" would like to access the Minima Network.<br>\n" +
	"<br>\n" +
	"Unlike other centralised solutions MiFi is completely decentralised.<br>" +
	"<br>" +
	"You must be running Minima and then you can connect your phone to this webpage.<br>\n" +
	"<br>\n" +
	"Either make sure you are on the same unrestricted WiFi or start a WiFi hotspot on your phone and connect this computer to that.<br>\n" +
	"<br>\n" +
	"When you are ready..<br>\n" +
	"<br>\n" +
	"		</td>\n" +
	"	</tr>\n" +

	"	<tr>\n" +
	"		<td height=10 colspan=3 align=center><button onclick='setQRPage();'>P R O C E E D &GT;&GT;</button></td>\n" +
	"	</tr>\n" +

	"    <tr>" +
	"		<td width=80 height=40 onclick='setHelpPage();' style='cursor: pointer;color:#0000ff;font-size:12;text-align:left;vertical-align:bottom;'>" +
	"			HELP" +
	"		</td>" +
	"		<td>&nbsp</td>" +
	"		<td width=80 height=40 onclick='setAdvancedPage();' style='cursor: pointer;color:#0000ff;font-size:12;text-align:right;vertical-align:bottom;'>" +
	"			ADVANCED" +
	"		</td>" +
	"	</tr>"+

	"</table>"

	setMainDiv(text);
}

function setHelpPage(){
	//Close the WebSocket
	closeWebSocket();

	//Set the Text
	var text = "<table border=0 width=350px height=100%>\n" +
	"	\n" +

	"	<tr>\n" +
	"		<td height=50 width='50px' style='text-align:left;vertical-align:middle;'><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"		<td height=50 width='250px' style='text-align:center;vertical-align:middle;'><br><h3>MINIMA MIFI</h3></td>\n" +
	"		<td height=50 width='50px' style='text-align:right;vertical-align:middle;'><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"	</tr>\n" +

	"	\n" +
	"	<tr>\n" +
	"		<td height=100% style='vertical-align:top;font-size:14;' colspan=3>\n" +
	"<br>\n" +


	"Help<br>" +
	"<br>" +
	"Trying to connect this webpage and your phone or instance of Minima can be tricky.<br>" +
	"<br>" +
	"If you are having issues it is probably because your WiFi is restricting your outbound and inbound traffic. Office WiFi normally does this.<br>" +
	"<br>" +
	"To get round this you can start a WiFi hotspot on your phone and then connect the computer you are sitting at to that WiFi." +
	"\n" +
	"<br>" +
	"<br>Home WiFi networks generally do not have these restrictions." +

	"		</td>\n" +
	"	</tr>\n" +

	"	<tr>\n" +
	"		<td height=10 colspan=3 align=center>&nbsp;</td>\n" +
	"	</tr>\n" +

	"    <tr>\n" +
	"		<td width=80 height=40 onclick='setInitPage();' style='cursor: pointer;color:#0000ff;font-size:12;text-align:left;vertical-align:bottom;'>\n" +
	"			HOME\n" +
	"		</td>\n" +
	"		<td>&nbsp</td>\n" +
	"		<td width=80 height=40 onclick='setAdvancedPage();' style='cursor: pointer;color:#0000ff;font-size:12;text-align:right;vertical-align:bottom;'>\n" +
	"			ADVANCED\n" +
	"		</td>\n" +
	"	</tr>"+

	"</table>\n" +
	"";

	setMainDiv(text);
}

function setAdvancedPage(){
	//Close the WebSocket
	closeWebSocket();

	//Set the Text
	var text = "<table border=0 width=350px height=100%>\n" +
	"	\n" +

	"	<tr>\n" +
	"		<td height=50 width='50px' style='text-align:left;vertical-align:middle;'><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"		<td height=50 width='250px' style='text-align:center;vertical-align:middle;'><br><h3>MINIMA MIFI</h3></td>\n" +
	"		<td height=50 width='50px' style='text-align:right;vertical-align:middle;'><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"	</tr>\n" +

	"	<tr>" +
	"		<td height=100% style='vertical-align:top;font-size:14;' colspan=3>" +
	"<br>" +

	"Advanced<br>" +
	"<br>" +
	"Here you can directly specify the address of the Minima instance you wish to connect to.<br>\n" +
	"<br>\n" +
	"This could be your phone or a command line version running locally or online.<br>\n" +
	"<br>\n" +
	"\n" +
	"<br><br>\n" +
	"<center>\n" +
	"	<input placeholder='127.0.0.1:8999' type=text id='minimaconnect'>\n" +
	"</center>\n" +

	"		</td>\n" +
	"	</tr>\n" +


	"	<tr>\n" +
	"		<td height=10 colspan=3 align=center><button onclick='advancedConnect();'>C O N N E C T &GT;&GT;</button></td>\n" +
	"	</tr>\n" +


	"    <tr>" +
	"		<td width=80 height=40 onclick='setHelpPage();' style='cursor: pointer;color:#0000ff;font-size:12;text-align:left;vertical-align:bottom;'>" +
	"			HELP" +
	"		</td>" +
	"		<td>&nbsp</td>" +
	"		<td width=80 height=40 onclick='setInitPage();' style='cursor: pointer;color:#0000ff;font-size:12;text-align:right;vertical-align:bottom;'>" +
	"			HOME" +
	"		</td>" +
	"	</tr>"+
	"</table>";

	setMainDiv(text);
}

function setQRPage(){
	//Close the WebSocket
	closeWebSocket();

	//New UUID
	Minima.uuid = Math.floor(Math.random()*1000000000);

	//Connect..
	startWebSocket();

	var text = "<table border=0 width=100% height=100%>\n" +
	"	\n" +

	"	<tr>\n" +
	"		<td height=50 width='50px' style='text-align:left;vertical-align:middle;'><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"		<td height=50 width='250px' style='text-align:center;vertical-align:middle;'><br><h3>MINIMA MIFI</h3></td>\n" +
	"		<td height=50 width='50px' style='text-align:right;vertical-align:middle;'><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"	</tr>\n" +

	"	\n" +
	"	<tr>\n" +
	"		<td style='vertical-align:top;font-size:14;' colspan=3>\n" +
	"<br>\n" +
	"<center>" +
	"<div id='miniqrcode' style='width:200px; height:200px;'></div>" +
	"<br>" +
	"Open the Minima app and choose <b>Web</b><br>" +
	"<br>OR<br><br>" +
	"Open the <b>Terminal</b> and type :<br><br>weblink "+Minima.uuid+
	"</center>" +
	"		</td>\n" +
	"	</tr>\n" +
	"	\n" +

	"	<tr>\n" +
	"		<td height=20 onclick='setInitPage();' colspan=3 style='cursor: pointer;color:#0000ff;font-size:12;text-align:right;vertical-align:bottom;'>\n" +
	"			<div>HOME</div>\n" +
	"		</td>\n" +
	"	</tr>\n" +

	"	\n" +
	"</table>\n" +
	"";

	setMainDiv(text);

	//Create the QR Code
	var qrcode = new QRCode(document.getElementById("miniqrcode"), {
		width : 200,
		height : 200,
		colorDark : "#000000",
	    colorLight : "#ffffff",
	    correctLevel : QRCode.CorrectLevel.H
	});
	qrcode.makeCode(Minima.uuid+"");

	//Place a 2 minute timer..
	setTimeout(function() {
	    //If we have not connected go back to home page - close websocket free resources
		if(!MINIMACONNECTED){
			setInitPage();
		}
	 }, 120000);
}


/**
 * Add the Overlay DIVS - but do not show them
 */
function createOverlayDivs(){
	//First add the total overlay div
	var overdiv = document.createElement('div');
	overdiv.id  = OVERLAY_DIV;

	overdiv.style.position 	 = "absolute";
	overdiv.style.top 		 = 0;
	overdiv.style.left 		 = 0;
	overdiv.style.width 	 = "100%";
	overdiv.style.height 	 = "100%";
	overdiv.style.opacity 	 = "25%";
	overdiv.style.background = "#777777";

	//Add it to the Page
	document.body.appendChild(overdiv);

	//Now add the main Minima MiFi setup div
	var div = document.createElement('div');
	div.id  = MAIN_DIV;

	div.style.position 	= "absolute";
	div.style.margin   	= "auto";
	div.style.padding  	= 10;
	div.style.top  		= 0;
	div.style.right 	= 0;
	div.style.bottom  	= 0;
	div.style.left  	= 0;

	div.style.fontSize   = "14px";
	div.style.fontFamily = "monospace";

	div.style.width  	= "350px";
	div.style.height  	= "450px";
	div.style.background   = "#cccccc";
	div.style.borderRadius = "10px";

	//Add it to he page
	document.body.appendChild(div);

	//Logout Button
	var button = document.createElement("button");
	button.id  = LOGOUT_BUTTON;

	button.innerHTML 		= "<table>\n" +
	"	<tr>\n" +
	"		<td align=center><img width=50 src='http://mifi.minima.global/images/icon.png'></td>\n" +
	"	</tr>\n" +
	"	<tr>\n" +
	"		<td style='font-size:16;text-align:left;vertical-align:middle;'>MIFI LOGOUT</td>\n" +
	"	</tr>\n" +
	"</table>";

	button.style.position 	= "absolute";
	button.style.padding 	= "5px";
	button.style.top 		= "10px";
	button.style.left 		= "10px";
	button.style.fontFamily = "monospace";

	button.addEventListener ("click", function() {
		  Minima.logout();
	});
	document.body.appendChild(button);

	//Hide them all for now..
	hide(MAIN_DIV);
	hide(OVERLAY_DIV);
	hide(LOGOUT_BUTTON);
}

function setMainDiv(html){
	if(!MINIMA_IS_MINIDAPP){
		document.getElementById(MAIN_DIV).innerHTML = html;
	}
}

function show(id){
	if(!MINIMA_IS_MINIDAPP){
		document.getElementById(id).style.display = "block";
	}
}

function hide(id){
	if(!MINIMA_IS_MINIDAPP){
		document.getElementById(id).style.display = "none";
	}
}

/**
 * Utility functions used by the Minima Object
 *
 */
function Minimalog(info){
	console.log("Minima @ "+new Date().toLocaleString()+"\n"+info);
}

/**
 * Notification Div
 */
var TOTAL_NOTIFICATIONS = 0;
function createMinimaNotification(text, bgcolor){
	//First add the total overlay div
	var notifydiv = document.createElement('div');

	//Create a random ID for this DIV..
	var notifyid = Math.floor(Math.random()*1000000000);

	//Details..
	notifydiv.id  = notifyid;
	notifydiv.style.position 	 = "absolute";

	notifydiv.style.top 		 = 20 + TOTAL_NOTIFICATIONS * 110;
	TOTAL_NOTIFICATIONS++;

	notifydiv.style.right 		 = "-20";
	notifydiv.style.width 	     = "400";
	notifydiv.style.height 	     = "90";

	//Regular or specific color
	if(bgcolor){
		notifydiv.style.background   = bgcolor;
	}else{
		notifydiv.style.background   = "#777777";
	}

	notifydiv.style.opacity 	 = "0";
	notifydiv.style.borderRadius = "10px";

	//Add it to the Page
	document.body.appendChild(notifydiv);

	//Create an HTML window
	var notifytext = "<table border=0 width=100% height=100%><tr>" +
			"<td style='font-size:16px;font-family:monospace;color:black;text-align:center;vertical-align:middle;'>"+text+"</td></tr></table>";

	//Now get that element
	var elem = document.getElementById(notifyid);

	//Set the Text..
	elem.innerHTML = notifytext;

	//Fade in..
	elem.style.transition = "all 1s";

	// reflow
	elem.getBoundingClientRect();

	// it transitions!
	elem.style.opacity = 0.8;
	elem.style.right   = 40;

	//And create a timer to shut it down..
	setTimeout(function() {
		TOTAL_NOTIFICATIONS--;
		document.getElementById(notifyid).style.display = "none";
	 }, 4000);
}

/**
 * Utility function for GET request
 *
 * @param theUrl
 * @param callback
 * @returns
 */
function httpGetAsync(theUrl, callback, logenabled)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
        	//Always a JSON ..
        	var rpcjson = JSON.parse(xmlHttp.responseText);

        	//Do we log it..
        	if(Minima.logging && logenabled){
        		var logstring = JSON.stringify(rpcjson, null, 2).replace(/\\n/g,"\n");
        		Minimalog(theUrl+"\n"+logstring);
        	}

        	//Send it to the callback function..
        	if(callback){
        		callback(rpcjson);
        	}
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}
