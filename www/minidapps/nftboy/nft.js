/**	
	NFT Functions
 */
function WeNFTInputCommand(command,callback){
	
	if(command == "help"){
		
		var helpstr = 
""
+"mint       - Mint an NFT\n"
+"nfts       - Show your NFTs\n"
+"send       - Send an NFT\n"
+"help       - Show the help..\n"
;
		//Create Data Object
   		var data = { "event": "text", "info" : helpstr};
		
		setTimeout(function(){callback(data)},0);
	
	}else{
		//Unknown command
		var data = { "event": "UnKnown Command", "info" : command};
		callback(data);
	}
}
