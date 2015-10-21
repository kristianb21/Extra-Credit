$( document ).ready(function() {
// This object groups all the AJAX calls or other forms of grabbing data to
// produce locations.
var mapData = {};
var iconBase = '../images/map-icons/';
var icons = {
    artgallery: {
      iconType: 'Art Gallery/Museum',
      icon: iconBase + 'artgallery.png'
    },
    library: {
      iconType: 'Library',
      icon: iconBase + 'library.png'
    },
    afterSchoolProgram: {
      iconType: 'Extra Credit',
      icon: iconBase + 'school.png'
    }
  };
// These styles will change Google Map's default styles
var styles = [
  {
    "featureType": "poi",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi.school",
    "icon": iconBase+ icons.library.icon,
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi.school",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#A1A0D8" }
    ]
  },{
    "featureType": "poi.school",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#A9CCE6" }
    ]
  },{
    "featureType": "poi.school",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "color": "#2B2D2A" },
      { "weight": 3 }
    ]
  },{
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#E3E4EF" }
    ]
  },{
    "featureType": "administrative",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "color": "#2B2D2A" },
      { "weight": 2 }
    ]
  },{
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#393F42" }
    ]
  },{
    "featureType": "landscape.man_made",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#E5DAB3" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "color": "#7C9CC5" }
    ]
  },{
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#4D565E" }
    ]
  },{
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      { "color": "#CAA958" }
    ]
  },{
    "featureType": "road",
    "elementType": "labels.text.stroke",
    "stylers": [
      { "color": "#2B2D2A" },
      { "weight": 2 }
    ]
  },{
    "featureType": "road.highway",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#595B5C" }
    ]
  },{
    "featureType": "poi.park"
  }
];

/* An array containing all markers/locations. */
var locations = [];


/** Represents a location.
 * @constructor
 */
var Location = function(title, content, latitude, longitude, group) {

  this.title = title;
  this.latitude = latitude;
  this.content = content;
  this.longitude = longitude;
  this.group = group;
  // By default, each location will not be on the map.
  this.onMap = false;
  // Create a unique ID for each location
  this.locationID = (this.latitude+"").toString().replace('-','0') + (this.longitude+"").toString().replace('-','0');
  this.createMarker('afterSchoolProgram');

};

/* This function constructs markers to be used on the map.
 */
Location.prototype.createMarker = function(mapIcon){
  console.log('Running createMarker');
  // console.log(this);
  // console.log(map);
  this.marker = new google.maps.Marker({
    position: {lat: Number(this.latitude), lng: Number(this.longitude)},
    title: this.title,
    map: map,
    icon: icons[mapIcon].icon,
    visible: true
  });
  // console.log(this.marker);
  this.mapThis();
  // locations.push(this);

};

/* This function adds the designated location to the map
 */
Location.prototype.mapThis = function(){
  console.log('Running mapThis');

  this.marker.setMap(map);

};

/* This function removes the designated location from the map
 */
Location.prototype.clearMap = function(mapIcon){

  this.marker.setMap(null);

};

/* Add event listner on locations on "click"
 */
Location.prototype.clickFunc = function(){

  this.marker.addListener('click', function() {
    // TODO
    // Update InfoWindow with this marker's info
    console.log(this);
  });
};

// Main view model
var ExtraCreditViewModel = function() {
  var self = this;
  // Editable data
  console.log(locations);
  self.locations = ko.observableArray(locations);

  self.currentFilter = ko.observableArray();
  self.searchFilter = ko.observable();
  self.categoryFilter = ko.observable();
  self.setFilter = function (filter) {
    console.log('Running setFilter');
    self.currentFilter(filter);
  };

  self.searchComputedFilter = ko.computed(function(){
    console.log('Running searchComputedFilter');
    if(self.currentFilter() == 'search'){
      // Searching locations by title
      console.log('True: self.currentFilter == \'search\'');
      if (!self.searchFilter()) {
        // Reset Locations
        self.currentFilter('all');
        ko.utils.arrayForEach(self.locations(), function(marker) {
            // marker.mapThis();
        });
        return self.locations();
      } else {
        var str = self.searchFilter();
        var regExp = new RegExp(str, 'ig');
        return ko.utils.arrayFilter(self.locations(), function (marker) {
          if(marker.title.match(regExp)){
            return true;
          }
        });
      }
    } else if(self.currentFilter() == 'category'){
      // Search locations by categoryFilter
      // Clear out search input
      self.searchFilter('');
      if (!self.categoryFilter()) {
        // Reset Locations
        self.currentFilter('all');

        return self.locations();
      } else {
        console.log('True: self.categoryFilter()');
        return ko.utils.arrayFilter(self.locations(), function (marker) {
          return marker.group == self.categoryFilter();
        });
      }
    } else {
      return self.locations();
    }
  }, self);

  self.filter = function (category) {
    console.log('Running filter');
    self.setFilter('category');
    self.categoryFilter(category);
  };

  // Let the user know how the locations are being filtered.
  self.filteringBy = ko.computed(function(){
    var filterLabel = '';
    if (self.currentFilter() == 'all') {
      return 'Showing all locations.';
    } else if (self.currentFilter() == 'search') {
      filterLabel = 'Title';
    } else {
      filterLabel = 'Category';
    }
    return 'Filtering by: '+ filterLabel+'.';
  }, self);
};
extraCreditViewModel = new ExtraCreditViewModel();
// Activate view model
ko.applyBindings(extraCreditViewModel);

// Construct legend for map
var buildMapLegend = function(){
  var legend = document.getElementById('legend');
  var iconType;
  var icon;
  var div;

  for (var item in icons) {
    iconType = item.iconType;
    icon = item.icon;
    div = document.createElement('div');
    div.innerHTML = '<img src="' + icons[item].icon + '"> ' + icons[item].iconType;
    legend.appendChild(div);
  }
};

/* After School Program Data
 * ref: http://nycdoe.pediacities.com/dataset/after-school-upk-programs/resource/1e042827-d69d-48f0-a2ba-1df13c3c307e
 */
afterSchoolProgram = function(){
  var aspData;
  var data = {
    resource_id: '1e042827-d69d-48f0-a2ba-1df13c3c307e' // the resource id to the dataset
  };

  $.ajax({
    url: 'http://nycdoe.pediacities.com/api/action/datastore_search',
    data: data,
    dataType: 'json',
    success: function(data) {
      console.log('JSON get afterSchoolProgram success!');
      // Grab records from returned ajax data
      aspData = data.result.records;
      // console.log(aspData);
      // Create a marker for each record
      var i = aspData.length - 1;
      var debug = 3;
      console.log('After School Program Data');
      for (debug; debug >= 0; debug--) {
        // Construct locations to be placed on the map.
        // Location(title, content, latitude, longitude, group)
        extraCreditViewModel.locations.push( new Location(aspData[debug].NAME, 'testing', aspData[debug].latitude, aspData[debug].longitude, 'Education Event'));
        // console.log(aspData[debug]);
        console.log(locations);
      }
    },
    "error": {
      "message": "Access denied",
      "__type": "Authorization Error"
    }
  });
};


/* NYC Museum and Galleries
* ref. http://nycdoe.pediacities.com/dataset/museums-and-galleries
*/
mapData.theArts = function(){
  $.ajax({
    url: '../datasets/museums-and-galleries-results.json',
    data: data,
    dataType: 'json',
    success: function(data) {
      var i = data.length - 1;
      var debug = 3;
      console.log('NYC Museum and Galleries');
      for (debug; debug >= 0; debug--) {
        // Construct Markers to be placed on the map.
        // title, content, latitude, longitude, type
        console.log(data[debug]);
        console.log(data[debug]['@type']);
      }
    },
    "error": {
      "message": "Access denied",
      "__type": "Authorization Error"
    }
  });
};

/* NYC Parks
 * ref. http://nycdoe.pediacities.com/dataset/map-of-parks
 */
mapData.nycParks = function(){
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
};

/* Initializes Google Maps and Creates all the needed markers
*/
window.initMap = function() {

  /* Setup Map */
  this.map = new google.maps.Map(document.getElementById('map'), {
    // Start from home
    center: {lat: 40.835105, lng: -73.945388},
    zoom: 14
  });
  tmarker = new google.maps.Marker({
    position: {lat: Number(40.835105), lng: Number(-73.945388)},
    map: map,
    title: 'this.title',
    // icon: icons[mapIcon].icon
  });

  console.log(tmarker);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
  document.getElementById('legend'));

  // Customize map
  map.set('styles', styles);

  // Build Map Legend
  buildMapLegend();

  // Add markers from AJAX calls
  afterSchoolProgram();
  console.log(locations);
  // mapData.theArts();
  // mapData.nycParks();
};

window.initMap();

});
