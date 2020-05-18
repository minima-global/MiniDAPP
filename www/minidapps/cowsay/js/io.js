function cowsayRandom(){

	Minima.cmd("random", function(json) {
        document.getElementById("output").innerHTML = json.response.random;
 	});
 }
