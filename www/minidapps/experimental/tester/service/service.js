


Minima.init(function(msg){
		
	//Deal with each message type
	if(msg.event == "connected"){
		
		Minima.log("WE CONNECTED");
		
		Minima.cmd("help",function(resp){
			Minima.log(JSON.stringify(resp));
		});
		
			
	}else if(msg.event == "newtransaction"){
		
	}	

});