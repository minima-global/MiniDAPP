/**
 * Split line into a JSON object
 */
function splitLineToJSON(commandline){

	//Split the line up - keeping the quoted areas..
	words = commandline.match(/(?:[^\s"']+|['"][^'"]*["'])+/g);
	
	//The function is the FIRST
	name = words[0];
	
	//The final JSON
	var jsoncommand  = {};
	
	//The main function is always first
	jsoncommand.name = name;
	
	//The arguments
	var args = {};
	for (var i = 0; i < words.length; i++) { 
		
		//Get the word
		word = words[i].trim();
		
		//Now break it down..
		if(word!=""){
			
			//remove the quotes if any
			if(word.startsWith('"') || word.endsWith("'")){
				word = word.substring(1);
			}
			
			if(word.endsWith('"') || word.endsWith("'")){
				word = word.substring(0,word.length-1);
			}
			
			//Now split with the :
			splitter = word.split(":");
			
			//Add to the json
			args[splitter[0]] = splitter[1].trim();
		}
	}
	
	//Now add the args
	jsoncommand.args = args;
	
	return jsoncommand;
}