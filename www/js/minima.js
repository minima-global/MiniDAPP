/**
* Minima Finance JS lib for integrating Minima into  websites..
* 
* MiFi
* 
*/

/**
 * Initialise access to Minima
 * 
 * @param callback
 * @returns
 */
function initMinima(callback){
	
	// just place a div at top right
	var div = document.createElement('div');
	div.className = "center-div";
	div.id = "MinimaDIV";
	
	//The Text
	div.innerHTML = "<center><h3>Minima - MiFi</h3>\n" + 
	"This website would like to access the Minima network.<br>\n" + 
	"<br>\n" + 
	"To get started you must link your phone<br>\n" + 
	"<br>\n" + 
	"To start the process.. press<br>\n" + 
	"<br>\n" + 
	"<button onclick='setQRCOdeText();'>Continue</button>\n" + 
	"</center>"
	
	document.body.appendChild(div);
	
	
}

function setQRCOdeText(){
	var md = document.getElementById("MinimaDIV");
	
	md.innerHTML = "It Worked!";
	
}






/**
 * Utility function for GET request
 * 
 * @param theUrl
 * @param callback
 * @returns
 */
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}