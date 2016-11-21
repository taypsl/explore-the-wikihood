
"use strict";

// From Google API: 'Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.'

var state = {
	userLocation: {},
	wikiUrl: "",
	wikiData: [], // array of objects { title: object.title,  url: .url, img: , desc: }
};

function initMap() {
  var startingLocation = {lat: 51.531703, lng: -0.124310}

  var map = new google.maps.Map(document.getElementById('map'), {
		center: startingLocation,
		zoom: 6
  });
  
  //maxWidth info window -- this might be different than wiki info window. slash I'll get rid of it after zipcodeapi implemented	
  var infoWindow = new google.maps.InfoWindow({
  		map: map,
  		content: contentString, //this should definitely go with wiki article part
  		maxWidth: 200
  	});

  // Try HTML5 geolocation.--- this will be replaced with zipcode API code. 
  if (navigator.geolocation) {
  	navigator.geolocation.getCurrentPosition(function(position) {

  		var pos = {
  			lat: position.coords.latitude,
  			lng: position.coords.longitude
  		};
  		console.log(pos)
  		state.userLocation = pos;


  		getWikiUrl(state);
  		getWikiData(state);
  		displayWikiList(state);
  		console.log(state.wikiUrl);

  		infoWindow.setPosition(pos);
  		infoWindow.setContent('Location found.');
  		map.setCenter(pos);
  	}, function() {
  		handleLocationError(true, infoWindow, map.getCenter());
  	});
  } else {
	   // Browser doesn't support Geolocation
	   handleLocationError(false, infoWindow, map.getCenter());
  }




  // wiki call with hardcode coordinates
  function getWikiUrl(state) {
	state.wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates%7Cpageimages%7Cpageterms&generator=geosearch&colimit=50&piprop=thumbnail&pithumbsize=144&pilimit=50&wbptterms=description' + '&ggscoord=' + state.userLocation.lat + '%7C' + state.userLocation.lng + '&ggsradius=10000&ggslimit=50&callback=?';
  }


  function getWikiData(state) {
	  $.ajax({
	  	url: state.wikiUrl,
	  	dataType: 'jsonp',
	  	type: 'POST', 
	  	success: function(data) {
	  		var pageId = Object.keys(data.query.pages);
	  		for (var i=0; i<pageId.length; i++) { //would this be a good place to use map( )?
	  			state.wikiData[i] = data.query.pages[pageId[i]]; 
	  		}
	  		console.log(state.wikiData)
	  	}
	  })
  };


  function displayWikiList(state) {
  	var resultElement = '';
  	for (var j=0; j<state.wikiData.length; j++) {
  		console.log(state.wikiData[j].title);
  		resultElement = '<h1 class="title">' + state.wikiData[j].title + '</h1>';
  	}
  	$('#results-container').html(resultElement);
  };


//infoWindow text. work in progress...
  var infoTitle = "";
  var infoMainText = "";
  var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
	        '<h1 id="firstHeading" class="firstHeading">' + infoTitle + '</h1>'+
	        '<div id="bodyContent">'+
	        	'<p>' + infoMainText + '</p>'+
	        '</div>'+
        '</div>';


}//end initMap function






function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
		'Error: The Geolocation service failed.' :
		'Error: Your browser doesn\'t support geolocation.');
}



