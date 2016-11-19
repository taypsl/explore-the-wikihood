
"use strict";


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
