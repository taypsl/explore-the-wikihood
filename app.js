$(document).ready(function() {
	"use strict";

	//initialize map
	var geocoder;
	var map;

	var state = {
		userLocation: {},
		wikiData: [],
		markers: [],
	};

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

	//================================================================================
	// Functions that set State
	//================================================================================

	//user location automatically found with Geolocation
	function getCurrentLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {

				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				state.userLocation = pos;
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
				getWikiGeoData(state);
			} else {
				alert("Whoops, that address didn't work! Try searching by a city, state, or zipcode.");
			}
		});
	}

	function getWikiUrl(state) {
		return 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates%7Cpageimages%7Cpageterms%7Cextracts&generator=geosearch&colimit=50&piprop=thumbnail&pithumbsize=144&pilimit=50&wbptterms=description&exchars=300&exlimit=20&exintro=1&' + '&ggscoord=' + state.userLocation.lat + '%7C' + state.userLocation.lng + '&ggsradius=10000&ggslimit=15'
	}

	function getWikiGeoData(state) {
		$.ajax({
			url: getWikiUrl(state),
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

	function cleanMarkers(){
		state.markers=[];
	}

	//================================================================================
	// Functions that Display Markers + Info Windows + List
	//================================================================================

	var myinfowindow = new google.maps.InfoWindow({
		content: "contentString",
		maxWidth: 300,
	});

	function createMarker(latlon, pageTitle, contentString){
		var marker = new google.maps.Marker({
			position: latlon,
			map: map,
			title: pageTitle,
			infowindow: myinfowindow,
			contentString: contentString,
			icon: 'images/icn_blue.png'
		});
		google.maps.event.addListener(marker, 'click', function() {
			this.infowindow.setContent(marker.contentString);
			this.infowindow.open(map, this);
		})
		state.markers.push(marker)
	}
	// functions that display to screen
	function displayWikiMarkers(state) {
		for (var j=0; j<state.wikiData.length; j++) {
			var wikiListing =state.wikiData[j];
			var contentString = '<div id="content">'+
			'<h1 class="markerHeading">' + wikiListing.title + '</h1>'+
			'<p>' + wikiListing.extract + '</p>'+
			'<p><a href="https://en.wikipedia.org/?curid=' +  wikiListing.pageid + '" target="_blank">' + 'Read more</a></p>'+
			'</div>';
			createMarker(wikiListing.coordinates[0], wikiListing.title, contentString);
		}
	}

	function displayWikiList(state) {
		var resultElement = ''
		for (var j=0; j<state.wikiData.length; j++) {
			resultElement += '<h1 class="results-title" id="' + j +'">' + state.wikiData[j].title + '</h1><div class="list-paragraph hidden">' + state.wikiData[j].extract +
			'<p><a href="https://en.wikipedia.org/?curid=' +  state.wikiData[j].pageid + '" target="_blank">' + 'Read more</a></p></div>';
		}
		$('#results-container').html('<div id="accordion">' + resultElement + '</div>');
	};

	//================================================================================
	// Display Event Listeners
	//================================================================================

	$('#results-container').on('mouseover', '.results-title', function(e) {
		var index = $(this).attr('id');
		state.markers[index].setIcon('images/icn_orange.png');
	});

	$('#results-container').on('mouseout', '.results-title', function(e) {
		var index = $(this).attr('id');
		state.markers[index].setIcon('images/icn_blue.png');
	});

	$('#results-container').on('click', 'h1', function(e) {
		$(this).next('div').toggleClass('hidden');
	});

	$('.submit').on('click', function(e) {
		cleanMarkers();
		initialize();
		geocodeSearch(state);
		updateDisplay()
	});


	$('input').keydown( function(e) {
		if (e.which == 13) {
			$('#address').submit();
			cleanMarkers()
			console.log(state)
			initialize();
			geocodeSearch(state);
			updateDisplay()
		}
	});

	$('.find-me').on('click', function(e) {
		initialize();
		getCurrentLocation(state);
		updateDisplay()
	});

	function updateDisplay(){
		$('.zipcode-search').addClass('new-search');
		$('.sidebar').removeClass('hidden');
		$('html').css({'background': 'none', 'overflow': ''});
		$('.or-img').addClass('hidden');
		$('.or-img-mobile').addClass('hidden');
		$('.submit').addClass('new-submit');
		$('.find-me').css({'display':'none'});
		$('.page-title').addClass('new-page-title');
		$('.page-title').text('WikiHood');
		$('#address').addClass('new-address');
		$('#address').val('');
		$('.search-container').addClass('display');
		$('hr').removeClass('hidden');
		$('.logo').removeClass('hidden');
		$('.search-container').css({'margin': '0'});
	}
});