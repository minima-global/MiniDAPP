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
			
		if(mMultiFuctionType == "moveoff"){
			
			if(mMultiFuctionStage == 0){
				
				//The state has replied with it's KEY
				sendTextResponse("State Entity Key : "+command,callback);		
			
				//Store this..
				mOffChainNFTCurrent['entitypublickey'] = command;
				
				//Now create the MultiSig..
				var multi = "RETURN MULTISIG(2 "
				+mOffChainNFTCurrent['userpublickey']+" "
				+mOffChainNFTCurrent['entitypublickey']+")";
				
				sendTextResponse("Trigger TXN     : "+multi,callback);
				
				//Now create that address..
				Minima.cmd('scripts action:addscript track:true script:"'+multi+'"',function(jsonresp){
					
					var triggeraddress = jsonresp.response.address;
					mOffChainNFTCurrent['triggeraddress'] = triggeraddress; 
					sendTextResponse("Trigger Address : "+triggeraddress,callback);
					
					//Now create a transaction that send the NFT to this address.. 
					var txnid = Math.floor(Math.random() * 1000000);
					
					var txncreator = 
					
					//Create the Txn
					"txncreate id:"+txnid+";"
					
					//Add the input coin for the NFT
					+"txninput id:"+txnid+" coinid:"+mOffChainNFTCurrent['coinid']
					
					//Add the output
					
					
				
					
				});
				
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
						+"onchain                 - Show your on-chain NFTs\n"
						+"offchain                - Show your off-chain NFTs\n"
						+"moveoff (tokenid)       - Move an on-chain NFT off-chain\n"
						+"moveon  (tokenid)       - Move an on-chain NFT off-chain\n"
						+"send (tokenid)          - Send an off-chain NFT\n"
						+"receive                 - Receive an off-chain NFT\n"
						+"help                    - Show the help..";

		sendTextResponse(helpstr,callback);
	
	}else if(command.startsWith("offchain")){
		
		//For Now..
		setTimeout(function(){callback(mOffChainNFTs)},0);
		
	}else if(command.startsWith("onchain")){
		
		//Run it..
		Minima.cmd("balance",function(jsonresp){
			
			//Get the response array..
			balarr = jsonresp.response;
			
			var totnft = [];
			//Now find the tokens.. that have 1 unit.. 
			for(var i=0;i<balarr.length;i++){
				
				var token 	= balarr[i];
				tokid 		= token.tokenid;
				
				if(tokid != "0x00" && token.total == 1 && token.sendable == 1){
					
					//Create a new JSON..
					var tokjson = {};
					tokjson['name'] 		= token.token.name;
					tokjson['description'] 	= token.token.description;
					tokjson['image'] 		= token.token.url;
					tokjson['id'] 			= token.tokenid;
					
					totnft.push(tokjson);	
				}
			}
			
			//Now send this back
			callback(totnft);
		});
		
	}else if(command.startsWith("moveoff")){
		
		//Split the command up
		cmdarray = command.split(" ");
		
		//The TokjenId we are trying to move off chain
		tokenid = cmdarray[1];
	
		mMultiFuction 		= true;
		mMultiFuctionType 	= "moveoff";
		mMultiFuctionStage 	= 0;
		
		//Reset..
		mOffChainNFTCurrent = {};
		
		//Find the CoinID..
		Minima.cmd("coins tokenid:"+tokenid,function(jsonresp){
		
			//What is the CoiniD..
			var coinid = jsonresp.response[0].coinid;
			mOffChainNFTCurrent['coinid'] = coinid;
			
			//Run it..
			Minima.cmd("newaddress",function(jsonresp){
			
				//Get the new address..
				var newaddress = jsonresp.response.publickey;
			
				mOffChainNFTCurrent['userpublickey'] = newaddress;
			
				sendTextResponse("Moving token "+tokenid+" off-chain",callback);
				sendTextResponse("NFT coinid "+coinid,callback);
				sendTextResponse("Your PUBLIC KEY : "+newaddress,callback);
				sendTextResponse("Enter Entity Response Here : ",callback);
			});	
		});
			
	}else{
		//Just run as a regular Minima Cmd
		Minima.cmd(command,callback);
	}
}

function sendTextResponse(text,callback){
	//Create Data Object
	var data = { "event": "text", "info" : text};
	setTimeout(function(){callback(data)},0);
}


