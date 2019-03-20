"use strict"; // estää pahimpia virheitä

window.onload = function() {
  var el = document.getElementById('luo');
  el.addEventListener("click", klikkaus, false);
  
  numeroi();
};



function klikkaus(e) {
	e.preventDefault();
	
	var levValue = document.getElementsByName('x')[0].value;
	
	if (levValue >= 8 && levValue <= 16) {
		//virheilmoituksen poisto
		var txtkent = document.getElementsByName('x');
		txtkent[0].className = "valk"
		rakennus(levValue);
	}
	else {
		//virheilmoitus
		var txtkent = document.getElementsByName('x');
		txtkent[0].className = "virhe"
	}
}

function rakennus(levValue) {
	// Find a <table> element
	var tables = document.getElementsByTagName("table");
	tables[0].id = "taulu";
	var table = document.getElementById("taulu");
	
	//delete previous rows
	var trlist = document.getElementsByTagName("tr");
	var koko = trlist.length;
	for (var i=0;i<koko;i++) {
		table.deleteRow(0);
	}
	

	
	for (var i=0;i<levValue;i++) {
		
		// Create an empty <tr> element and add it to the table:
		var row = table.insertRow(i);
		
		// Insert new cells (<td> elements) at the "new" <tr> element:
		for (var j=0;j<levValue;j++) {
			var cell = row.insertCell(j);
			
			//lisää nappulat päätyihin
			if (j<2){
				var img = document.createElement('img');
				img.src = "red.svg";
				cell.appendChild(img);
			}
			if (j>levValue-3) {
				var img = document.createElement('img');
				img.src = "blue.svg";
				cell.appendChild(img);
			}
		}

	}

	//väritä ruudut uudestaan
	numeroi();
}



function numeroi() {
	
	// lisää tr elementteihin parillinen & pariton tagi
	var trlist = document.getElementsByTagName("tr");
	for (var i=0;i<trlist.length;i++) {
		trlist[i].className = "odd";
		i++;
	}
	
	for (var i=1;i<trlist.length;i++) {
		trlist[i].className = "even";
		i++;
	}
	
	//muuta rivien taustakuvat
	for (var i=0;i<trlist.length;i++)
	{
	
		if (trlist[i].className == "even") {
			for (var j=0;j<trlist[i].children.length;j++) {
				trlist[i].children[j].className = "must";
				j++;
			}
			for (var j=1;j<trlist[i].children.length;j++) {
				trlist[i].children[j].className = "valk";
				j++;
			}
		}
	
		else {
			for (var k=0;k<trlist[i].children.length;k++) {
				trlist[i].children[k].className = "valk";
				k++;
			}
			for (var k=1;k<trlist[i].children.length;k++) {
				trlist[i].children[k].className = "must";
				k++;
			}
		}
	}
}