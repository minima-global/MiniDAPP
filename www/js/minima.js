/**
* Minima Finance JS lib for integrating Minima into  websites..
* 
* MiFi
* 
*/

var initText = "<center><h3>Minima - MiFi</h3>\n" + 
window.location.host+" would like to access<br>the Minima network.<br>\n" + 
"<br>\n" +
"To get started you must link your phone<br>\n" + 
"<br>\n" + 
"To continue.. press<br>\n" + 
"<br>\n" + 
"<button onclick='setQRCOdeText();'>Continue</button>\n" + 
"</center>";

var stageTwo = "<center><h3>Minima - MiFi</h3>\n" + 
window.location.host+" would like to access<br>the Minima network.<br>\n" + 
"<br>\n" +
"To get started you must link your phone<br>\n" + 
"<br>\n" + 
"To continue.. press<br>\n" + 
"<br>\n" + 
"<button onclick='setQRCOdeText();'>Continue</button>\n" + 
"</center>";

/**
 * Initialise access to Minima
 * 
 * @param callback
 * @returns
 */
function initMinima(callback){
	
	//Load certain Libs..
	//..
	
	//Do we already have an IP to talk to..
	var ip = window.localStorage.getItem("phoneip");
	if(ip == null){
		ip = "none";
	}else{
		//Check if this connection still valid..
		//..
		
	}
	
	// just place a div at top right
	var div = document.createElement('div');
	div.className = "center-div";
	div.id = "MinimaDIV";
	
	//The Initial Text
	div.innerHTML = initText;
	
	//Add it to the page
	document.body.appendChild(div);
	
	
}

function check1(oldvalue) {
    undefined === oldvalue && (oldvalue = value);
    clearcheck = setInterval(repeatcheck,500,oldvalue);
    function repeatcheck(oldvalue) {
        if (value !== oldvalue) {
            // do something
            clearInterval(clearcheck);
            console.log("check1 value changed from " +
                oldvalue + " to " + value);
        }
    }
}

function setQRCOdeText(){
	var md = document.getElementById("MinimaDIV");
	
	md.innerHTML = "It Worked!";
	
	window.localStorage.setItem('phoneip', 'Time : '+new Date());

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