'use strict';
// Initate a Map for the App
var map;

var allMarkers = [];
function initMap() {

  /* Setup Map */
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.835105, lng: -73.945388},
    zoom: 14
  });

  /* Setup Infowindow */
  var infoContent = $('#info-content').html();
  console.log(infoContent);
  var infowindow = new google.maps.InfoWindow({
    content: infoContent
  });

  /* NYC Parks
   * ref. http://nycdoe.pediacities.com/dataset/map-of-parks
   */
  var layer = new google.maps.FusionTablesLayer({
    map: map,
    heatmap: { enabled: false },
    query: {
      select: "col0",
      from: "1RTCeAf_xUqj_d8dqgvsjYxPBZ7VFVdo2N2av0I6y",
      where: ""
    },
    options: {
      styleId: 2,
      templateId: 3
    }
  });
  layer.setMap(map);

  /* NYC Museum and Galleries
   * ref. http://nycdoe.pediacities.com/dataset/museums-and-galleries
   */
  $.getJSON('../datasets/museums-and-galleries-results.json', function(data){
    var i = data.length - 1;
    for (i; i >= 0; i--) {
      // Construct Markers to be placed on the map.
      createMarker(data[i], google, infowindow, allMarkers);
    }
  });


  // After School Program Data
  var aspData;
  // Location of all After School Programs.
  // Last updated September 30, 2013
  // ref: http://nycdoe.pediacities.com/dataset/after-school-upk-programs/resource/1e042827-d69d-48f0-a2ba-1df13c3c307e
  var data = {
    resource_id: '1e042827-d69d-48f0-a2ba-1df13c3c307e' // the resource id
    // limit: 5, // get 5 results
    // q: '*' // query for 'jon vhes'
  };

  $.ajax({
    url: 'http://nycdoe.pediacities.com/api/action/datastore_search',
    data: data,
    dataType: 'jsonp',
    success: function(data) {
      // Grab records from returned ajax data
      aspData = data.result.records;
      // Create a marker for each record
      var i = aspData.length - 1;
      console.log(allMarkers.length);
      for (i - 1; i >= 0; i--) {
        createMarker(aspData[i], google, infowindow, allMarkers);
      }
      console.log(allMarkers.length);
    },
    "error": {
      "message": "Access denied",
      "__type": "Authorization Error"
    }
  });

  // Add bindings for infowindow content.
}
var markerViewModel = {
  title: ko.observable('No Title'),
  content: ko.observable('Lorem ipsum Id aliqua incididunt laborum amet dolor ex voluptate.')
}
ko.applyBindings(markerViewModel, document.getElementById('info-content'));

/* This function constructs markers to be used on the map.
 */
 var infoWindowTitle;
function createMarker(obj, google, infowindow, allMarkers){
  if(obj.latitude && obj.longitude){
    obj.marker = new google.maps.Marker({
      position: {lat: Number(obj.latitude), lng: Number(obj.longitude)},
      map: map,
      title: obj.name
    });
    allMarkers.push(obj.marker);
    // Add infowindow on click to the marker

    obj.marker.addListener('click', function() {
      console.log(obj);
      infoWindowTitle = obj.name;
      console.log(infowindow);
      markerViewModel.title('infoWindowTitle');
      infowindow.content = $('#info-content').html();
      infowindow.open(map, obj.marker);
    });

  }
  return allMarkers;
}