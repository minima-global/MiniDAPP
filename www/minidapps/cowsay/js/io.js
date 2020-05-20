function getCow(cow) {

	const whichCow = {
		"COW": cowsay.DEFAULT,
		"BEAVIS_ZEN": cowsay.BEAVIS_ZEN,
		"BONG": cowsay.BONG,
		"BUD_FROGS": cowsay.BUD_FROGS,
		"BUNNY": cowsay.BUNNY,
		"CHEESE": cowsay.CHEESE,
		"COWER": cowsay.COWER,
		"DAEMON": cowsay.DAEMON,
		"DOGE": cowsay.DOGE,
		"DRAGON": cowsay.DRAGON,
		"DRAGON_AND_COW": cowsay.DRAGON_AND_COW,
		"EYES": cowsay.EYES,
		"FLAMING_SHEEP": cowsay.FLAMING_SHEEP,
		"GHOSTBUSTERS": cowsay.GHOSTBUSTERS,
		"GOAT": cowsay.GOAT,
		"HEDGEHOG": cowsay.HEDGEHOG,
		"HELLOKITTY": cowsay.HELLOKITTY,
		"KISS": cowsay.KISS,
		"KITTY": cowsay.KITTY,
		"KOALA": cowsay.KOALA,
		"KOSH": cowsay.KOSH,
		"LUKE_KOALA": cowsay.LUKE_KOALA,
		"MECH_AND_COW": cowsay.MECH_AND_COW,
		"MEOW": cowsay.MEOW,
		"MILK": cowsay.MILK,
		"MOOFASA": cowsay.MOOFASA,
		"MOOSE": cowsay.MOOSE,
		"MUTILATED": cowsay.MUTILATED,
		"REN": cowsay.REN,
		"SATANIC": cowsay.SATANIC,
		"SHEEP": cowsay.SHEEP,
		"SKELETON": cowsay.SKELETON,
		"SMALL": cowsay.SMALL,
		"SQUIRREL": cowsay.SQUIRREL,
		"STEGOSAURUS": cowsay.STEGOSAURUS,
		"STIMPY": cowsay.STIMPY,
		"SUPERMILKER": cowsay.SUPERMILKER,
		"SURGERY": cowsay.SURGERY,
		"TELEBEARS": cowsay.TELEBEARS,
		"TURKEY": cowsay.TURKEY,
		"TURTLE": cowsay.TURTLE,
		"TUX": cowsay.TUX,
		"VADER_KOALA": cowsay.VADER_KOALA,
		"WHALE": cowsay.WHALE,
		"WWW": cowsay.WWW
	}
	return whichCow[cow];
}

function cowSayRandom(cowsay) {

	Minima.cmd("random", function(json) {
		const cow = document.querySelector('#whichCow').value;
		const whichCow = getCow(cow);
	    document.getElementById("cowsay").innerHTML = cowsay.say({
			text: json.response.random,
			cow:  whichCow
		});
 	});
 }

 function cowThinkRandom(cowsay) {

 	Minima.cmd("random", function(json) {
 		const cow = document.querySelector('#whichCow').value;
		const whichCow = getCow(cow);
 	    document.getElementById("cowsay").innerHTML = cowsay.think({
 			text: json.response.random,
 			cow:  whichCow
 		});
  	});
  }
