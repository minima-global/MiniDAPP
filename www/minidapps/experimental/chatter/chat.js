/**
 * Net channel ID
 */
var netuid = 0;

/**
 * You chat name
 */
var chatname = "noname";
	
/** 
 * Deal with incoming chat messages
 */
function networkMessage(evt){
	
	Minima.log("Network event "+JSON.stringify(evt.detail.info));
	
	//What's happening'
	var action = evt.detail.info.action;
		 	
 	if(action == "client_new"){
	 	if(evt.detail.info.outbound == true){
		 	//Connect ed to server
			netuid = evt.detail.info.uid;
	
			Minima.log("NETUID set : "+netuid);
		}
 	
	}else if(action == "server_start"){ 
	
 	}else if(action == "client_shut"){ 
		netuid = 0;
		alert("Client Connection Shut..");
	
	}else if(action == "message"){ 
		//From the server.. ?
		if(evt.detail.info.message.server){
			//Message Received
			var msg = evt.detail.info.message.name+":"+evt.detail.info.message.message; 
			chatwindow.value = chatwindow.value+msg+"\n";	
		}else{
			//Else..
			braodcastMessage(evt.detail.info.message)	
		}
	}
}

function connect(){
	Minima.net.connect("127.0.0.1:10000");
}

function disconnect(){
	Minima.net.disconnect(netuid);
}

function start(){
	Minima.net.listen(10000);
}

function stop(){
	Minima.net.stop(10000);
}

function info(){
	Minima.net.info(function(json){console.log(JSON.stringify(json));});
}

function SendMessage(msg){
	Minima.log("Send Attempt : "+msg+" "+netuid);
	Minima.net.send(netuid, { "name" : chatname , "message" : msg, server : false });
}

function braodcastMessage(msgjson){
	Minima.log("Broadcast Attempt : "+JSON.stringify(msgjson));
	msgjson.server = true;
	Minima.net.broadcast(10000, msgjson);
}