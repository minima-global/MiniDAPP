function cowsayRandom(){

	Minima.cmd("random", function(json) {

		const randomText = json.response.random;
		const randomJson = ({text: randomText});
		//const outText = say(randomJson); 		//Set it
 		//document.getElementById("output").innerHTML = outText;
        document.getElementById("output").innerHTML = randomText;
 		document.getElementById("output").scrollTop = 0;
 	});
 }
