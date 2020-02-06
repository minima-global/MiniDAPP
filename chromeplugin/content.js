//alert("Hello from your Chrome extension!");

////content.js
//chrome.runtime.onMessage.addListener(
//  function(request, sender, sendResponse) {
//    if( request.message === "clicked_browser_action" ) {
//      var firstHref = $("a[href^='http']").eq(0).attr("href");
//
//      console.log(firstHref);
//
//      // This line is new!
//      chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
//    }
//  }
//);
//
//function createMinima(){
//	console.log("Create Minima");
//}
//
//var poison = "poisson!!";
//
//

function injectJQuery() {
    var body   = document.getElementsByTagName('head')[0];
    var jquery = document.createElement('script');
    jquery.onload = function(){
    	console.log("loaded..");
    	var event = new CustomEvent('MinimaLoaded', {detail:"hello"});
    	window.dispatchEvent(event);
    }
    jquery.setAttribute("src","http://127.0.0.1/jquery-3.4.1.min.js");
    
    body.appendChild(jquery);
}

function injectScript(code) {
    var body = document.getElementsByTagName('head')[0];
    var s = document.createElement('script');
    s.innerHTML = code;
    body.appendChild(s);
}


injectScript("var Minima = " +
		"{" +
			"version:0.4, " +
			"lastName:'Doe', " +
			"age:50, " +
			"eyeColor:'blue'," +
			"cmd : function(command) { " +
				"$.get( 'http://127.0.0.1:8999/'+command, function( data ) {"+
				 "alert( 'Data Loaded: ' + data );"+
				"});" +
			"}" +
		"};");

injectJQuery();

////Content script
//window.addEventListener('LoadContent', function(evt) {
//	console.log("LoadContent:"+evt);
//});    

//var event = new CustomEvent('RecieveContent', {detail:"hello"});
//window.dispatchEvent(event);
