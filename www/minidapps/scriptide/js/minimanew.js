/**
* Minima JS lib for MiniDAPPs..
* 
* Includes the Decimal.js lib for precise Maths.
* 
* @spartacusrex
*/

/**
 * The MAIN Minima Callback function 
 */
var MINIMA_MAIN_CALLBACK = null;

/**
 * Main MINIMA Object for all interaction
 */
var Minima = {
	
	//RPC Host for Minima
	rpchost : "http://127.0.0.1:9002/",
	
	/**
	 * Minima Startup - with the callback function used for all Minima messages
	 */
	init : function(callback){
		//Log a little..
		Minima.log("Initialising..");
		
		//Info.. 
		Minima.log("RPCHOST : "+Minima.rpchost);
		
		//All done..
		MINIMA_MAIN_CALLBACK = callback;
		
		//And Post a message
		MinimaPostMessage("connected", "");
	},
	
	/**
	 * Log some data with a timestamp in a consistent manner to the console
	 */
	log : function(output){
		console.log("Minima @ "+new Date().toLocaleString()+" : "+output);
	},
	
	/**
	 * Runs a function on the Minima Command Line
	 */
	cmd : function(minifunc, callback){
		MinimaRPC(minifunc,callback);
	},
		
	/**
	 * Form GET / POST parameters..
	 */
	form : {
		
		//Return the GET parameter by scraping the location..
		getParams : function(parameterName){
			    var result = null,
		        tmp = [];
			    var items = location.search.substr(1).split("&");
			    for (var index = 0; index < items.length; index++) {
			        tmp = items[index].split("=");
			        //console.log("TMP:"+tmp);
				   if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
			    }
			    return result;
		}		
	}
};

/**
 * GET the RPC call - can be cmd/sql/file/net
 */
function MinimaRPC(command, callback){
	//And now fire off a call saving it 
	httpGetAsync(Minima.rpchost+command, callback, false);
}

/**
 * Post a message to the Minima Event Listeners
 */
function MinimaPostMessage(event, info){
   //Create Data Object
   var data = { "event": event, "info" : info };

   //And dispatch
   if(MINIMA_MAIN_CALLBACK){
		MINIMA_MAIN_CALLBACK(data);	
   }      
}

/**
 * Notification Div
 */
var TOTAL_NOTIFICATIONS     = 0;
var TOTAL_NOTIFICATIONS_MAX = 0;
function MinimaCreateNotification(text, bgcolor){
	//First add the total overlay div
	var notifydiv = document.createElement('div');
	
	//Create a random ID for this DIV..
	var notifyid = Math.floor(Math.random()*1000000000);
	
	//Details..
	notifydiv.id  = notifyid;
	notifydiv.style.position 	 = "absolute";
	
	notifydiv.style.top 		 = 20 + TOTAL_NOTIFICATIONS_MAX * 110;
	TOTAL_NOTIFICATIONS++;
	TOTAL_NOTIFICATIONS_MAX++;
	
	notifydiv.style.right 		 = "0";
	notifydiv.style.width 	     = "400";
	notifydiv.style.height 	     = "90";
	
	//Regular or specific color
	if(bgcolor){
		notifydiv.style.background   = bgcolor;
	}else{
		notifydiv.style.background   = "#bbbbbb";	
	}
	
	notifydiv.style.opacity 	 = "0";
	notifydiv.style.borderRadius = "10px";
	notifydiv.style.border = "thick solid #222222";
	
	//Add it to the Page
	document.body.appendChild(notifydiv);
	
	//Create an HTML window
	var notifytext = "<table border=0 width=400 height=90><tr>" +
	"<td style='width:400;height:90;font-size:16px;font-family:monospace;color:black;text-align:center;vertical-align:middle;'>"+text+"</td></tr></table>";

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
		if(TOTAL_NOTIFICATIONS<=0){
			TOTAL_NOTIFICATIONS=0;
			TOTAL_NOTIFICATIONS_MAX=0;
		}
		
		document.getElementById(notifyid).style.display = "none";  
	 }, 4000);
}

/**
 * Utility function for GET request
 * 
 * @param theUrl
 * @param callback
 * @param params
 * @returns
 */
function httpPostAsync(theUrl, params, callback){
		
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
			//Do we log it..
        	if(Minima.logging){
        		Minima.log("RPC:"+theUrl+"\nPARAMS:"+params+"\nRESPONSE:"+xmlHttp.responseText);
        	}

        	//Send it to the callback function..
        	if(callback){
        		callback(JSON.parse(xmlHttp.responseText));
        	}
        }
    }
    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');    
	xmlHttp.send(params);
}

/**
 * Utility function for GET request (UNUSED for now..)
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
        	if(logenabled){
				console.log("RPC      : "+theUrl);
				console.log("RESPONSE : "+xmlHttp.responseText);
			}

			//Always a JSON ..
        	var rpcjson = JSON.parse(xmlHttp.responseText);
        	
        	//Do we log it..
        	//if(Minima.logging && logenabled){
        	//	var logstring = JSON.stringify(rpcjson, null, 2).replace(/\\n/g,"\n");
        	//	Minima.log(theUrl+"\n"+logstring);
        	//}
        	
        	//Send it to the callback function..
        	if(callback){
        		callback(rpcjson);
        	}
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
