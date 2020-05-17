function cowsayRandom(){

	Minima.cmd("random", function(json) {

		const randomText = json.response.random;
        document.getElementById("output").innerHTML = randomText;
 	});
 }
