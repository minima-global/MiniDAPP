

/*
  Initialise the 
*/

function setMyTokens(){
}

function setCreateToken(){
	
	var createpage = "<table align=center border=1 width=600 height=300 name=\"createtoken\">\n" + 
	"<tr>\n" + 
	"	<td style='text-align:right;'> Name : </td> <td> <input type=text id=createname size=40> </td>\n" + 
	"</tr>\n" + 
	"<tr>\n" + 
	"	<td style='text-align:right;'> Icon : </td> <td> <input type=text id=createicon size=40> </td>\n" + 
	"</tr>\n" + 
	"<tr>\n" + 
	"	<td style='text-align:right;'> Description : </td> <td> <textarea maxlength='255' style='resize:none;' rows='4' cols='40' id=createdesc></textarea> </td>\n" + 
	"</tr>\n" + 
	"<tr>\n" + 
	"	<td style='text-align:right;'> NFT : </td> <td> <input type=checkbox id=createnft> (Is this token divisiable by less than 1 unit ?) </td>\n" + 
	"</tr>\n" + 
	"<tr>\n" + 
	"	<td style='text-align:right;'> Total Tokens : </td> <td> <input value=1000 type=number id=createtotal> </td>\n" + 
	"</tr>\n" + 
	"<tr>\n" + 
	"	<td style='text-align:right;'> Proof : </td> <td> <input type=text id=createproof size=40> </td>\n" + 
	"</tr>\n" + 
	"<tr>\n" + 
	"	<td style='text-align:right;' colspan=2> <button onclick='createToken();'> CREATE TOKEN </button></td>\n" + 
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