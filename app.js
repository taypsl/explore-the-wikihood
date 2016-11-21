
/*"use strict";


var zipcodeToLatLongUrl = 'https://www.zipcodeapi.com/rest/bnU0ZLm4gtxtgnEPnWC3gxSJdbx9mYeym8zlUVqbpXEFlivIf7LvEEfSPN1cMfL8/info.json/94703/degrees';

function getDataFromApi(searchTerm, callback) {
  var query = {
  }
  $.getJSON(zipcodetoLatLongUrl, query, callback);
} 


function callback(data) {
  console.log(data);
}

function findZipcode() {
  $('.zipcode-search').submit(function(e) {
    e.preventDefault();
    var query = $(this).find('.zipcode-input').val();
    getDataFromApi(query, callback);
  });

}


// wikipedia api 
$(function(){findZipcode();}); 

$(document).ready(function() {

	var wikiGeoDataUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates%7Cpageimages%7Cpageterms&generator=geosearch&colimit=50&piprop=thumbnail&pithumbsize=144&pilimit=50&wbptterms=description&ggscoord=37.786952%7C-122.399523&ggsradius=10000&ggslimit=50';

	function getWikiData(searchTerm, callback) {
	  var query = {
	  }
	  $.getJSON(wikiGeoDataUrl, query, callback);
	  console.log(query);
	} 

	$(function(){getWikiData();}); 

});
*/

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 6
  });
  var infoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

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
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}