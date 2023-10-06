/**
* MAXCHAT JS lib for MiniDAPPs..
* 
* @spartacusrex
*/

var MY_NAME 				= "noname"; 

var CURRENT_ROOM_PUBLICKEY 	= "";
var CURRENT_ROOM_NAME 		= "";

function processMaximaEvent(msg){
	
	//Is it for us.. ?
	if(msg.data.application != "maxsolo"){
		return;
	} 
	
	//Who is this message from..
	var pubkey = msg.data.from;
	
	//Get the data packet..
	var datastr = msg.data.data;
	if(datastr.startsWith("0x")){
		datastr = datastr.substring(2);
	}
	
	//The JSON
	var jsonstr = hexToUtf8(datastr);
	
	//And create the actual JSON
	var maxjson = JSON.parse(jsonstr);
	
	//Add this to the DB
	insertMessage(maxjson.username, pubkey, maxjson.username, maxjson.message);
	
	//Are we in this room..
	if(CURRENT_ROOM_PUBLICKEY == pubkey){
		loadMessages(CURRENT_ROOM_PUBLICKEY);
	}else{
		loadRooms();
	}
	
	//Log it..
	MDS.log(jsonstr);
}


function insertMessage(roomname, frompubkey, name, message){
	
	//Insert into the DB
	MDS.sql("INSERT INTO messages (roomname, publickey,username,message,date) VALUES "
			+"('"+roomname+"','"+frompubkey+"','"+name+"','"+message+"', "+Date.now()+")");
	
}

function updateRead(frompubkey){
	
	//Set all messages to read
	MDS.sql("UPDATE messages SET read=1 WHERE publickey='"+frompubkey+"'");
	
}


function loadRooms(){
	
	//Load the last message in each room..
	MDS.sql("SELECT * from messages WHERE ID in "
		+"( SELECT max(ID) FROM messages GROUP BY publickey ) ORDER BY ID DESC", function(sqlmsg){
		
		//Get the data
		var sqlrows = sqlmsg.rows;
		
		//Create a table..
		var rowtable = "<div style='overflow-y:auto; height:500; width:300'><table border=0 width=100%>"
		
		//Create the Room List..
		for(var i = 0; i < sqlrows.length; i++) {
		    var sqlrow = sqlrows[i];
		
			//Start
			rowtable += "<tr><td class='roominlist' onclick='loadMessages(\""+sqlrow.PUBLICKEY+"\")'><font size='+3'><b>"+sqlrow.ROOMNAME+"</b></font><br><br>";
		
			//Is it unread
			if(sqlrow.READ == 0){
				rowtable += "<b>"+sqlrow.MESSAGE+"</b></td></tr>"	
			}else{
				rowtable += sqlrow.MESSAGE+"</td></tr>"
			}
		}
		
		rowtable += "</table></div>"
		
		//Set this as the room list
		document.getElementById("roomlist").innerHTML = rowtable;
		
		//MDS.log(JSON.stringify(sqlmsg));
	});
}

function loadMessages(publickey){

	//Store for later
	CURRENT_ROOM_PUBLICKEY = publickey;

	//Load the last message in each room..
	MDS.sql("SELECT * from messages WHERE publickey='"+publickey+"' ORDER BY ID ASC", function(sqlmsg){
		
		//Get the data
		var sqlrows = sqlmsg.rows;
		
		//Create a table..
		var rowtable = "<table border=0 width=100%>"
				+"<tr><td class='roomchat'><div id='roomdiv' style='overflow-y:auto; height:440; width:100%'>"
		
		//Create the Room List..
		for(var i = 0; i < sqlrows.length; i++) {
		    var sqlrow = sqlrows[i];
			rowtable += "<b>"+sqlrow.USERNAME+"</b> : "+sqlrow.MESSAGE+"<br><br>";
			
			//Store this for later
			CURRENT_ROOM_NAME = sqlrow.ROOMNAME;
		}
		
		//Close the table
		rowtable += "</div></td></tr>";
		
		//Add the chat line..
		rowtable += "<tr><td height=20 nowrap> "
			+"<input style='width:400;' id='chatline' maxlength='255'> "
			+"<input type=submit name='Send' onclick='sendMessage();'> </td></tr>";
		
		//Set this as the room list
		document.getElementById("roomchat").innerHTML = rowtable;
		
		//Scroll ot the bottom
		var obj = document.getElementById("roomdiv");
		obj.scrollTop = obj.scrollHeight;
		
		//MDS.log(JSON.stringify(sqlmsg));
	});
	
	//Update Messages
	updateRead(publickey);
	
	//Load the rooms .. again.. very inefficient..
	loadRooms();
}

function sendMessage(){
	
	//Are we empty
	if(CURRENT_ROOM_PUBLICKEY == ""){
		alert("No room chosen..");
		return;
	}
	
	//Get the message..
	var msg = document.getElementById('chatline').value;
	
	//And add it to Our DB..
	insertMessage(CURRENT_ROOM_NAME, CURRENT_ROOM_PUBLICKEY, MY_NAME, msg);
	
	//Load all the messages
	loadMessages(CURRENT_ROOM_PUBLICKEY);
	
	var data = {};
	data.username = MY_NAME;
	data.message  = msg;
	
	//Convert to a string..
	var datastr = JSON.stringify(data);
	
	//And now convert to HEX
	var hexstr = utf8ToHex(datastr);
	
	//Create the function..
	fullfunc = "maxima action:send publickey:"+CURRENT_ROOM_PUBLICKEY+" application:maxsolo data:"+hexstr;
	
	//Send the message via Maxima!..
	MDS.cmd(fullfunc, function(res){
		MDS.log(JSON.stringify(res));
	});
}

function startChat(){
	
	//Get the username and the publickey..
	var selobj = document.getElementById('maxcontacts');
	pkey 	= selobj.value;
	pname 	= selobj.options[selobj.selectedIndex].text;
	
	//Insert a message to start the room ( Could check if room already started!)
	insertMessage(pname, pkey, MY_NAME, "Start Room..");
	
	//And Set that room..
	loadMessages(pkey)
	
	//Load the rooms..
	loadRooms();
}
