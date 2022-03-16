/**	
	NFT Functions
 */

var mMultiFuction 		= false;
var mMultiFuctionType 	= "";
var mMultiFuctionStage 	= "0";

var mOffChainNFTs 		= [];
var mOffChainNFTCurrent = {};

function WeNFTInputCommand(command,callback){
	
	//Are we in a multi Function
	if(mMultiFuction){
		
		//Are we cancelling..
		if(command == "cancel"){
			mMultiFuction = false;
			sendTextResponse("Function cancelled..",callback);
			return;
		}
		
		if(mMultiFuctionType == "newnft"){
			
			if(mMultiFuctionStage == 0){
				
				sendTextResponse("2 Please first enter the nfttxn data",callback);		
				
			}else if(mMultiFuctionStage == 1){
			
				sendTextResponse("3 Please first enter the nfttxn data",callback);
			
			}else if(mMultiFuctionStage == 2){
				
				sendTextResponse("All Done!",callback);
				mMultiFuction = false;
			} 
			
			//Next stage..
			mMultiFuctionStage++;
			
		}
		
		
		return;
	}
	
	
	if(command.startsWith("help")){
		
		var helpstr = ""
						+"newnft (PUBLIC KEY)     - Start onboarding an NFT\n"
						+"help                    - Show the help..";

		sendTextResponse(helpstr,callback);
	
	}else if(command.startsWith("mint")){
	
		cmdarray = command.split(" ");
	
		name = cmdarray[1];
	
		minimacmd = "tokencreate name:"+name+" amount:1";

		//Run it..
		Minima.cmd(minimacmd,function(jsonresp){
			
			if(jsonresp.status){
				sendTextResponse("NFT "+name+" Created..",callback);
			}else{
				sendTextResponse(jsonresp.error,callback);
			}
			
		});
	
	}else if(command.startsWith("newnft")){
		
		//Get the Key
		cmdarray = command.split(" ");
		key = cmdarray[1];
		if(key==undefined || key.trim()==""){
			sendTextResponse("Invalid KEY "+key,callback);
			return;
		}
		
		sendTextResponse("User Public KEY "+key,callback);
		
		//Reset..
		mOffChainNFTCurrent = {};
		
		//Start the process of onbaording an NFT..
		mMultiFuction 		= true;
		mMultiFuctionType 	= "newnft";
		mMultiFuctionStage 	= "0";
		
		//Run it..
		Minima.cmd("newaddress",function(jsonresp){
		
			//Get the new address..
			var newaddress = jsonresp.response.publickey;
		
			mOffChainNFTCurrent['entitypublickey'] 	= newaddress;
			mOffChainNFTCurrent['userpublickey'] 	= key;
		
			sendTextResponse("Entity Response : "+newaddress,callback);
			sendTextResponse("Enter User Response Here : ",callback);
		});
	}
}

function sendTextResponse(text,callback){
	//Create Data Object
	var data = { "event": "text", "info" : text};
	
	setTimeout(function(){callback(data)},0);
}


