

/*
  Initialise the 
*/

function setMyTokens(){
	var createpage = "All your tokens!";
	document.getElementById("mainpage").innerHTML = createpage;
}

function setAllTokens(){
	var createpage = "All tokens!";
	document.getElementById("mainpage").innerHTML = createpage;
}

function setCreateToken(){
	
	var createpage = "<table align=center border=0 width=700 height=300 name=\"createtoken\">\n" + 
	"<tr class='createtablerow'><td colspan=2>&nbsp;</td></tr>\n" +
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Name : </td>" +
	"   <td class='createtableright'><input type=text id=createname size=60> <br> The main name for the token </td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Icon : </td>" +
	"   <td class='createtableright'><input type=text id=createicon size=60> <br> An URL to web hosted icon, *.png, *.jpg </td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Description : </td>" +
	"   <td class='createtableright'><textarea maxlength='255' style='resize:none;' rows='6' cols='60' id=createdesc></textarea> <br> Plain description of the token </td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> NFT : </td>" +
	"   <td class='createtableright'><input type=checkbox id=createnft><br>Non Fungible Token - NOT divisiable by less than 1 unit</td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Amount : </td>" +
	"   <td class='createtableright'><input type=number id=createtotal size=40 value='1000'> <br> Number of total tokens there are</td>" + 
	"</tr>\n" + 
	"<tr class='createtablerow'>" + 
	"	<td class='createtableleft'> Proof : </td>" +
	"   <td class='createtableright'><input type=text id=createproof size=60> <br> Web link to a text file with this tokens tokenid in it<br>Must set now.. but you create this later</td>" + 
	"</tr>\n" + 
	
	"<tr class='createtablerow'><td colspan=2>&nbsp;</td></tr>\n" +
	
	"<tr class='createtablerow'>\n" + 
	"	<td  class='createtableleft' colspan=2> <button onclick='createToken();'> CREATE TOKEN </button></td>\n" + 
	"</tr>\n" + 
	"</table>";
	
	document.getElementById("mainpage").innerHTML = createpage;
}

function createToken(){
	var name = document.getElementById("createname").value.trim();
	var icon = document.getElementById("createicon").value.trim();
	var desc = document.getElementById("createdesc").value.trim();
	
	var createjson = '{\\"name\\":\\"'+name+'\\",\\"icon\\":\\"'+icon+'\\"}';
	
	console.log(createjson);
}