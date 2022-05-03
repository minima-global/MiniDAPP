/**
* MDS JS lib for MiniDAPPs..
* 
* @spartacusrex
*/

/**
 * The MAIN Minima Callback function 
 */
var MDS_MAIN_CALLBACK = null;

/**
 * The Web Socket Host for PUSH messages
 */
var MDS_WEBSOCKET = null;

/**
 * Main MINIMA Object for all interaction
 */
var MDS = {
	
	//RPC Host for Minima
	rpchost : "",
	
	//RPC Host for Minima
	sqlhost : "",
	
	//WebSocket
	websockethost : "",
	
	//Is logging RPC enabled
	logging : false,
	
	/**
	 * Minima Startup - with the callback function used for all Minima messages
	 */
	init : function(callback){
		//Log a little..
		MDS.log("Initialising MDS..");
		
		//Store this for websocket push messages
		MDS_MAIN_CALLBACK = callback;

		//What is the host
		var endid   	= window.location.href.indexOf("/",10);
		MDS.rpchost 	= window.location.href.substring(0,endid)+"/mds/command";
		MDS.sqlhost 	= window.location.href.substring(0,endid)+"/mds/data";
		
		//Info.. 
		MDS.log("MDS RPCHOST : "+MDS.rpchost);
		
		//The WebSocket
		MDS.websockethost = "ws://"+window.location.hostname+":8091";
		MDSWebSocketListener();
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
	cmd : function(command, callback){
		//Send via POST to MDS
		httpPostAsync(MDS.rpchost, command, callback);
	},
		
		
	sql : function(sqlcommand, callback){
		//create 
		sqlcmd = {};
		sqlcmd.sql=sqlcommand;
		
		//Send via POST to MDS
		httpPostAsync( MDS.sqlhost, JSON.stringify(sqlcmd) , callback);
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
 * Post a message to the Minima Event Listeners
 */
function MDSPostMessage(json){
    //And dispatch
   if(MDS_MAIN_CALLBACK){
		MDS_MAIN_CALLBACK(json);	
   }      
}

/**
 * Start listening for PUSH messages
 */
function MDSWebSocketListener(){
	MDS.log("Starting WebSocket Listener @ "+MDS.websockethost);
	
	//Check connected
	if(MDS_WEBSOCKET !== null){
		MDS_WEBSOCKET.close();
	}
	
	//Open up a websocket to the main MINIMA proxy..
	MDS_WEBSOCKET = new WebSocket(MDS.websockethost);
	
	MDS_WEBSOCKET.onopen = function() {
		//Connected
		MDS.log("MDS WS Listener Connection opened..");	
		
		//And Post a message
		MDSPostMessage({ "event": "inited" });
	};
	
	MDS_WEBSOCKET.onmessage = function (evt) { 
		//Post it..
		if(MDS.logging){
			MDS.log("WebSocket : "+evt.data);	
		}
		
		//Post it..
		MDSPostMessage(evt.data);	
	};		

		
	MDS_WEBSOCKET.onclose = function() { 
		MDS.log("MDS WS Listener closed... reconnect attempt in 10 seconds");
	
		//Start her up in a minute..
		setTimeout(function(){ MDSWebSocketListener(); }, 10000);
	};

	MDS_WEBSOCKET.onerror = function(error) {
		//var err = JSON.stringify(error);
		var err = JSON.stringify(error, ["message", "arguments", "type", "name", "data"])
		
		// websocket is closed.
	    MDS.log("MDS WS Listener Error ... "+err); 
	};
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
        	if(MDS.logging){
        		MDS.log("RPC:"+theUrl+"\nPARAMS:"+params+"\nRESPONSE:"+xmlHttp.responseText);
        	}

        	//Send it to the callback function..
        	if(callback){
        		callback(JSON.parse(xmlHttp.responseText));
        	}
        }
    }
    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.setRequestHeader('Content-Type', 'application/json');    
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
