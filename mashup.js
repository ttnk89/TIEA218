"use strict";
var kaupunkisijainnit = {Jyväskylä: new google.maps.LatLng(62.24, 25.75), Kuopio: new google.maps.LatLng(62.89, 27.68), Tampere: new google.maps.LatLng(61.50, 23.79)};
var map

window.onload = function() {
	var valittu_kaupunki = aseta_kaupunki();
	
	aseta_kartta(valittu_kaupunki);
	
}
 
function aseta_kaupunki() {
	var input = document.getElementById('Kaupunki');
	
	//if job is set
	if (localStorage['Kaupunki']) {
		//set the value
		input.value = localStorage['Kaupuki'];
	}
	
	input.onchange = function () {
		//change localStorage on change
		console.log("localStorage set to: " + this.value);
		localStorage['Kaupunki'] = this.value;
		map.setCenter(kaupunkisijainnit[this.value])
	}
	
	if (localStorage['Kaupunki']) {
		console.log("loaded from localStorage")
		input.value = localStorage['Kaupunki'];
	}
	else {
		console.log("no localStorage")
	}
	
	console.log("got Kaupunki value: " + input.value)
	return input.value;
}
 
function aseta_kartta(valittu_kaupunki) {
	
	// Jyväskylän koordinaatit
    //var latlng = new google.maps.LatLng(62.24, 25.75);
	var latlng = kaupunkisijainnit[valittu_kaupunki];
	// asetetaan kartan asetukset ja keskipisteeksi Jyväskylä
	var myOptions = {
      zoom: 13,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);
}