/**
* Backend JS for the COin Flip app..
*
*/
function MinimaEvent(EventJSON){
	//Convert the JSON to a string
	var jsonstr = JSON.stringify(EventJSON,null,2);
	Minima.log("Coin Flip v2 Event received : "+jsonstr);
	
	//What event is this
	event = EventJSON.event;
	
	//Process it..
	if(event == "newblock"){
		
	}else if(event == "newtransaction"){
	
	}else if(event == "newbalance"){
	
	} 
}
