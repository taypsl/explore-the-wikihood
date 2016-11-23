
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

  //initialize map
var geocoder;
var map;
  
function initialize() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(51.531703, -0.124310);
    var mapOptions = {
      zoom: 15,
      center: latlng
    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

// functions that retrieve information 
//user location automatically found with Geolocation
function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {

      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      state.userLocation = pos;


      getWikiUrl(state);
      getWikiGeoData(state);

      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
    } else {
     // Browser doesn't support Geolocation
     handleLocationError(false, infoWindow, map.getCenter());
    }
};

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
      'Error: The Geolocation service failed.' :
      'Error: Your browser doesn\'t support geolocation.');
};

// user inputs address
function geocodeSearch(state) {
    var addressSearch = document.getElementById('address').value;
    geocoder.geocode( { 'address': addressSearch}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        state.userLocation.lat = results[0].geometry.location.lat();
        state.userLocation.lng = results[0].geometry.location.lng();

        // get the wikipedia data now that the state var is updated
        getWikiUrl(state);
        getWikiGeoData(state);

        //display marker of user location (remove this later)
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });

        //change this alert text "Whoops, that address didn't work! Try your search again."
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
}

function getWikiUrl(state) {
    state.wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates%7Cpageimages%7Cpageterms&generator=geosearch&colimit=50&piprop=thumbnail&pithumbsize=144&pilimit=50&wbptterms=description' + '&ggscoord=' + state.userLocation.lat + '%7C' + state.userLocation.lng + '&ggsradius=10000&ggslimit=5&callback=?';
}

function getWikiGeoData(state) {
    $.ajax({
    	url: state.wikiUrl,
    	dataType: 'jsonp',
    	type: 'POST', 
    	success: function(data) {
    		var pageId = Object.keys(data.query.pages);
	        for (var i=0; i<pageId.length; i++) { 
	        	state.wikiData[i] = data.query.pages[pageId[i]]; 
	        	state.wikiData[i].coordinates[0].lat = Number(state.wikiData[i].coordinates[0].lat);
	        	state.wikiData[i].coordinates[0].lng = Number(state.wikiData[i].coordinates[0].lon);
        	}
        displayWikiMarkers(state);
        displayWikiList(state);
    	}
	})
};


// functions that display to screen
function displayWikiMarkers(state) {
	var markers = [];
	for (var j=0; j<state.wikiData.length; j++) {
		var marker = new google.maps.Marker({
			position: state.wikiData[j].coordinates[0],
			map: map,
			title: state.wikiData[j].title,
		});

		var infoWindow = new google.maps.InfoWindow({
			content: state.wikiData[j].title, 
			maxWidth: 200
		});

		marker.addListener('click', function() {
			infoWindow.open(map, marker);
		});
	}
}
function displayWikiList(state) {
    var resultElement = '';
    for (var j=0; j<state.wikiData.length; j++) {
      console.log(state.wikiData[j].title);
      resultElement += '<h1 class="title">' + state.wikiData[j].title + '</h1>';
    }
    $('#results-container').html(resultElement);
    console.log(resultElement);
};




//listeners
$('.submit').on('click', function(e) {
      initialize();
      geocodeSearch(state);
      $('.zipcode-search').addClass('new-search');
});

$('.find-me').on('click', function(e) {
      initialize();
      getCurrentLocation(state);
      $('.zipcode-search').addClass('new-search');
      $('.find-me').addClass('hidden');
});



