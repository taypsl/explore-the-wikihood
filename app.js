
"use strict";

// From Google API: 'Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.'

var state = {
  userLocation: {},
  wikiUrl: "",
  wikiData: [], // array of objects { title: object.title,  url: .url, img: , desc: }
  markers: []
};

  //initialize map
var geocoder;
var map;
  
function initialize() {
    geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(51.531703, -0.124310);
    var mapOptions = {
      zoom: 14,
      center: latlng,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
      },
    };
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

        //change this alert text "Whoops, that address didn't work! Try your search again."
      } else {
        alert('Geocode was not successful. Try a new location!');
      }
    });
}

function getWikiUrl(state) {
    state.wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates%7Cpageimages%7Cpageterms%7Cextracts&generator=geosearch&colimit=50&piprop=thumbnail&pithumbsize=144&pilimit=50&wbptterms=description&exchars=300&exlimit=20&exintro=1&' + '&ggscoord=' + state.userLocation.lat + '%7C' + state.userLocation.lng + '&ggsradius=10000&ggslimit=15'
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
  for (var j=0; j<state.wikiData.length; j++) {
    var pageId = state.wikiData[j].pageid;
    var pageTitle = state.wikiData[j].title;
    var extract = state.wikiData[j].extract;
    var latlon = state.wikiData[j].coordinates[0];
    var contentString = '<div id="content">'+
          '<h1 class="markerHeading">' + pageTitle+ '</h1>'+
          '<p>' + extract + '</p>'+
          '<p><a href="https://en.wikipedia.org/?curid=' + pageId+ '" target="_blank">' + 'Read more</a></p>'+
          '</div>';
  	var myinfowindow = new google.maps.InfoWindow({
     	content: contentString,
      	maxWidth: 300,
    });

    var marker = new google.maps.Marker({
      position: latlon,
      map: map,
      title: pageTitle,
      infowindow: myinfowindow,
      icon: 'images/icn_blue.png'
    });

    google.maps.event.addListener(marker, 'click', function() {
    	this.infowindow.open(map, this);
    })

    state.markers.push(marker)
  }
}

function displayWikiList(state) {
    var resultElement = '';
    for (var j=0; j<state.wikiData.length; j++) {
      resultElement += '<h1 class="results-title">' + state.wikiData[j].title + '</h1>';
    }
    $('#results-container').html(resultElement);
};

$('#results-container').on('mouseover', '.results-title', function(e) {
  var index = $(this).index();
  state.markers[index].setIcon('images/icn_orange.png');
})

$('#results-container').on('mouseout', '.results-title', function(e) {
  var index = $(this).index();
  state.markers[index].setIcon('images/icn_blue.png');
})

//listeners
$('.markerHeading').on('click', function(e) {
  for (var j=0; j<state.wikiData.length; j++) {
  }  
})

$('#results-container').on('click', '.results-title', function(e) {
  var index = $(this).index();
  state.markers[index].infowindow.open(map, state.markers[index]);
})


$('.submit').on('click', function(e) {
      initialize();
      geocodeSearch(state);
      $('.zipcode-search').addClass('new-search');
      $('.sidebar').removeClass('hidden');
      $('html').css({'background': 'none'});
      $('.or-img').addClass('hidden');
      $('.submit').addClass('new-submit');
      $('.find-me').addClass('hidden');
      $('.page-title').addClass('new-page-title');
      $('.page-title').text('WikiHood');
      $('#address').addClass('new-address');
      $('#address').val('');
      $('.search-container').addClass('display');
      $('hr').removeClass('hidden');
      $('.logo').removeClass('hidden');
      $('.search-container').css({'margin': '0'});
});

$('input').keydown( function(e) {
    if (e.which == 13) {
      $('#address').submit();
      initialize();
      geocodeSearch(state);
      $('.zipcode-search').addClass('new-search');
      $('.sidebar').removeClass('hidden');
      $('html').css({'background': 'none', 'overflow': ''});
      $('.or-img').addClass('hidden');
      $('.submit').addClass('new-submit');
      $('.find-me').addClass('hidden');
      $('.page-title').addClass('new-page-title');
      $('.page-title').text('WikiHood');
      $('#address').addClass('new-address');
      $('#address').val('');
      $('.search-container').addClass('display').removeClass('search-container');
      $('hr').removeClass('hidden');
      $('.logo').removeClass('hidden');
      $('.search-container').css({'margin': '0'});
      return false; 
    }
});

$('.find-me').on('click', function(e) {
      initialize();
      getCurrentLocation(state);
      $('.zipcode-search').addClass('new-search');
      $('.sidebar').removeClass('hidden');
      $('html').css({'background': 'none', 'overflow': ''});
      $('.or-img').addClass('hidden');
      $('.submit').addClass('new-submit');
      $('.find-me').addClass('hidden');
      $('.page-title').addClass('new-page-title');
      $('.page-title').text('WikiHood');
      $('#address').addClass('new-address');
      $('.search-container').addClass('display');
      $('hr').removeClass('hidden');
      $('.logo').removeClass('hidden');
      $('.search-container').css({'margin': '0'});
});





