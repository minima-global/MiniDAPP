/**
* MAXCHAT utility functions
* 
* @spartacusrex
*/

const utf8encoder = new TextEncoder();

function hexToUtf8(s)
{
  return decodeURIComponent(
     s.replace(/\s+/g, '') // remove spaces
      .replace(/[0-9A-F]{2}/g, '%$&') // add '%' before each 2 characters
  );
}

function utf8ToHex(s)
{
  const rb = utf8encoder.encode(s);
  let r = '';
  for (const b of rb) {
    r += ('0' + b.toString(16)).slice(-2);
  }
  return r;
}

function showDiv(id,show) {
  var x = document.getElementById(id);
  if (show) {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function showNotification(from, message){
	
	//if(document.hasFocus()) {
	 //    return;
	// }
	
	if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        //var notification = new Notification($message);

		const notification = new Notification(from,{
		  body: message,
		  //icon: './img/goodday.png'
		});
    }
	
}