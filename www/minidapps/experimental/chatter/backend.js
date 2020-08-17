/**
 * BackEnd JS running in Block Time..  
 */
function MinimaEvent(evt){
	
	Minima.log("BACKEND Event "+JSON.stringify(evt));
	
	if(evt.detail.event == "connected"){
	
		//Run a command..	
		//Minima.cmd("random",function(resp){Minima.log("Backend Command "+JSON.stringify(resp));});
		//Minima.net.connect("127.0.0.1:10000");
		//Minima.net.get("http://www.google.com",function(resp){Minima.log("NET GET : "+JSON.stringify(resp));});
		
		Minima.log("STATUS : "+JSON.stringify(Minima.status));
		Minima.log("BALANCE : "+JSON.stringify(Minima.balance));
		
		/*//One time event at startup..
		Minima.log("BACKEND Event "+JSON.stringify(evt.detail));
	
		var obj = {"name":"paddy" , "age":45 };
	
		//File test
		//Minima.file.save(obj,"firettest",function(resp){Minima.log("File saved "+JSON.stringify(resp));});
		//Minima.file.load("firettest",function(resp){Minima.log("File load "+JSON.stringify(resp));});
		//Minima.file.list("/",function(resp){Minima.log("File list "+JSON.stringify(resp));});
		//Minima.file.delete("firettest",function(resp){Minima.log("File delete "+JSON.stringify(resp));});
		//Minima.file.list("/",function(resp){Minima.log("File list "+JSON.stringify(resp));});
		
		//NET Test
		//Minima.net.listen(10000);
		Minima.net.connect("127.0.0.1:10000");
		//Minima.net.stop(10000);
		Minima.net.info(function(resp){Minima.log("INFO "+JSON.stringify(resp));});
		
		Minima.net.get("http://www.google.com", function(resp){Minima.log("GET "+JSON.stringify(resp));});
		*/
	}
	
	//var decamt = new Decimal(10.12).sub(5).div(2);
	//Minima.log("BACKEND Event "+decamt);
	
}