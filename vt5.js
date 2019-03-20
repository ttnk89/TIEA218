"use strict"; // estää pahimpia virheitä

window.onload = function() {
	hae_tietokanta();
}
//jos lomakkeella tekstiä, thän tarkistus piilotetaanko *-merkki
function onko_ok() {
	var span = $( "span" );
	for(i=0; i<span.length;i++) {
		if ( $(span[i]).attr("class") != "hidden" ) {
			$('#laheta').atrr("disabled", "disabled");
			return;
		}
	}
	$('#laheta').removeAttr("disabled");
}
	
function hae_tietokanta() {
$.ajax({
        // tämä on oltava aina true. synkronista versiota ei pidä käyttää koska se voi jumittaa koko ohjelman
        async: true,
        // osoite jota kutsutaan eli aiemmin tehdyn flask-sovelluksen osoite
        url: "http://users.jyu.fi/~tutanika/cgi-bin/vt5/flask.cgi/hae_tietokanta",
        // POST tai GET. Nyt vain pyydetään tietoja eikä tehdä muutoksia joten GET
        type: "GET",
        // tietotyyppi jossa muodossa odotetaan vastausta vrt. flask-sovelluksessa määritetty text/plain
        dataType: "html",
        // parametrina viety data avain:arvo 
        success: function(data) {
			console.log("data haettu")
			listaaelokuvat(data)
		}, // funktio jota kutsutaan jos kaikki onnistuu
        error: ajax_virhe  // funktio jota kutsutaan jos tulee virhe
});
}

function listaaelokuvat(data) {
	
  document.createElement('ul');
  document.getElementById('listaus').insertAdjacentHTML('beforeend', data);
}

function ajax_virhe(xhr, status, error) {
        console.log( "Error: " + error );
        console.log( "Status: " + status );
        console.log( xhr );
}

function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');

    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

function Lisays_OnClick()
{
	console.log("click")
    //Get Employee ID from text box
    var elokuvaid = encodeURIComponent(document.getElementById("elokuvaid").value);
    var jasenid = encodeURIComponent(document.getElementById("jasenid").value);
    var vpvm = encodeURIComponent(document.getElementById("vpvm").value);
    var ppvm = encodeURIComponent(document.getElementById("ppvm").value);
    var sum = encodeURIComponent(document.getElementById("sum").value);

	var array = [];
	array[0] = elokuvaid;
	array[1] = jasenid; 
	array[2] = vpvm;
	array[3] = ppvm;
	array[4] = sum;
	
	//virhetarkistus & ilmoitukset
	var errors = {};

	$('#ppvm_error').empty();
	$('#sum_error').empty();
	$('#vpvm_error').empty();
	
	errors = virheTarkistus(array, errors);
	
	console.log("virheitä: " + Object.keys(errors).length)
	console.log(errors)
	
	//lähetys v5.py:lle
	//console.log(arr)
	if (Object.keys(errors).length == 0) {
		sendToServer(array)
	}
	else {
		//virheilmoitukset
		
		if (errors.vpvm) {
			document.getElementById('vpvm_error').innerHTML = errors.vpvm.fontcolor("red");
		}
		if (errors.ppvm) {
			document.getElementById('ppvm_error').innerHTML = errors.ppvm.fontcolor("red");
		}
		if (errors.sum) {
			document.getElementById('sum_error').innerHTML = errors.sum.fontcolor("red");
		}
	}
	
}

function virheTarkistus(array, errors) {
	// vpvm = valid format, empty ok, default = current
    // ppvm = valid format, empty ok, default = none, >= vpvm
    // sum = valid format, empty ok, default = 5, >=0
	

	//jos sum =! null
	if (array[4] >= 0) {
		console.log("sum on >= 0")
	}
	else {
		errors.sum = "Anna positiivinen luku"
	}
	
	//jos vpvm =! null
	if (array[2]) {
		console.log("vpvm ei ole tyhjä")
		var dateRegEx = /^(19|20)\d\d[-](0[1-9]|1[012]|[1-9])[-](0[1-9]|[12][0-9]|3[01]|[1-9])$/
		if ((array[2].match(dateRegEx)) !== null) {
			console.log("vpvm on formatoitu oikein")
		}
		else {
			errors.vpvm = "Anna muodossa VVVV-KK-PP";
		}
	}
	else {
		console.log("vpvm on tyhjä")
		//käytä defaulttia (nykyinen päivä)
		//hoidetaan vt5.py:ssa
	}
	
	//jos ppvm =! null, < vpvm
	if (array[3]) {
		console.log("ppvm ei ole tyhjä")
		var dateRegEx = /^(19|20)\d\d[-](0[1-9]|1[012]|[1-9])[-](0[1-9]|[12][0-9]|3[01]|[1-9])$/
		if ((array[3].match(dateRegEx)) !== null) {
			console.log("ppvm on formatoitu oikein")
			//tarkista onko vanhempi kuin vpvm (tai tänään jos vpvm on null)
			var date1 = new Date(array[3]);
			if (array[2]) {
				var date2 = new Date(array[2]);
			}
			else {
				var date2 = new Date();
				date2.setHours(0, 0, 0, 0);
			}
			
			if (date1 >= date2) {
				console.log("ppvm " + date1 + " ei ole vanhempi kuin vpvm "+ date2);
			}
			else {
				console.log("ppvm " + date1 + " on vanhempi kuin vpvm "+ date2);
				errors.ppvm = "PalautusPVM ei saa olla vanhempi kuin VuokrausPVM";
			}
		}
		else {
			errors.ppvm = "Anna muodossa VVVV-KK-PP"; 
		}
	}
	else {
		errors.ppvm = "Puuttuva tieto";
	}
	return errors;
}

function sendToServer(data) {
	$.ajax(
		{
			type: "POST",
			data: {data: data},
			url: "http://users.jyu.fi/~tutanika/cgi-bin/vt5/flask.cgi/lisaa_tietokantaan",
			//contentType: ''
			success: function(data){
				console.log(data)
				$('#vpvm_error').empty();
				document.getElementById('vpvm_error').innerHTML = data.fontcolor("red");
				if (data.length == 0) {
					$('#listaus').empty();
					hae_tietokanta()
				}
			}
		}
	);
}