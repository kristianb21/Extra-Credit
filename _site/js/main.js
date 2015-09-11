'use strict';
// Initate a Map for the App
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.835105, lng: -73.945388},
    zoom: 14
  });
  // marker = new google.maps.Marker({
  //   position: {lat: 40.835105, lng: -73.945388},
  //   map: map,
  //   title: 'Hello World!'
  // });
  layer = new google.maps.FusionTablesLayer({
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
}
var test = true;
function aspDataMarker(obj){

  if(obj.latitude && obj.longitude && test){
    console.log(obj);
    obj.marker = new google.maps.Marker({
      position: {lat: Number(obj.latitude), lng: Number(obj.longitude)},
      map: map,
      title: obj.NAME
    });
    // test--;
  }

}

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
    for (i - 1; i >= 0; i--) {
      aspDataMarker(aspData[i]);
    }
  },
  "error": {
    "message": "Access denied",
    "__type": "Authorization Error"
  }
});



// Structure for creating a marker object
// marker = new google.maps.Marker({
//   position: {lat: 40.835105, lng: -73.945388},
//   map: map,
//   title: 'Hello World!'
// });
  // Latitude: 40.835105 | Longitude: -73.945388 (158)

  var myLatLng = {lat: 40.835105, lng: -73.945388};
  // var markers = new google.maps.Marker({

  //     position: px,
  //     map: map,
  //     title: 'Hello World!'
  //   });
  // After-school programs

