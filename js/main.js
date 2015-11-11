var map;
var infowindow;
/* An array containing all markers/locations. */
var locations = [];
var initApp = function() {
  // This object groups all the AJAX calls or other forms of grabbing data to
  // produce locations.
  var fetchData = {};
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

  /** This function sets and initializes a location.
   * @constructor
   */
  function Location (title, content, latitude, longitude, categories, venueID, venueIndex) {
    var self = this;
    self.title = title;
    self.latitude = latitude;
    self.content = content;
    self.longitude = longitude;
    self.categories = categories;
    // Default until an image is found for the venue/location
    self.imgURL = '';
    self.venueID = venueID;
    self.venueIndex = venueIndex;

  };

  // Add "click" behavior to markers
  Location.prototype.clickFunc = function(){
    var self = this;
    self.marker.addListener('click', function() {
      self.showInfoPanel();
    });
  };

  Location.prototype.showInfoPanel = function(){
    var self = this,
        content = '';

    if (self.marker.getAnimation() !== null) {
      self.marker.setAnimation(null);
    } else {
      self.marker.setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function(){
        self.marker.setAnimation(null);

        window.setTimeout(function(){
          content = '<div class="info-window-content">';
          content += '<h2>'+self.title+'</h2>';

          if(self.imgURL){
            content += '<img src="'+self.imgURL+'" />';
          }

          content += '</div>';
          infowindow.setContent(content);
          infowindow.open(map, self.marker);
          self.marker.setAnimation(null);
        }, 200);
      }, 600);
    }
  };

  // Main view model
  function ExtraCreditViewModel() {
    var self = this;
    /* Setup Map */
    map = new google.maps.Map(document.getElementById('map'), {
      // Start from home
      center: {lat: 40.835105, lng: -73.945388},
      zoom: 14
    });
    infowindow = new google.maps.InfoWindow();
    // Customize map
    map.set('styles', styles);

    self.locations = ko.observableArray(locations);
    self.currentFilter = ko.observable();
    self.searchFilter = ko.observable();
    self.categoryFilter = ko.observable();
    self.setFilter = function (filter, data) {
      self.currentFilter(filter);
    };

    self.setMarkers = ko.computed(function(){
      ko.utils.arrayForEach(this.locations(), function(location) {
        // Check if marker already exist so this only runs once.
        if(!location.marker){
          // Create Marker
          location.marker = new google.maps.Marker({
          position: {lat: Number(location.latitude), lng: Number(location.longitude)},
          map: map,
          title: location.title,
          animation: google.maps.Animation.DROP
          // icon: icons[mapIcon].icon
          });
          // Hide the markers by default
          location.marker.setMap(null);
          // Add event listener, now that marker exist
          location.clickFunc();
          // Get Location Photo
          // Get Venue Photo
          getVenuePhoto(location.venueIndex, location.venueID);
        }
      });
    }, self);
    // Filtered Markers
    self.filteredMarkers = function(){
      // SEARCH INPUT ----------------------------------------------------------
      if(self.currentFilter() == 'search'){
        // Searching locations by title
        // CHECK if search input is empty, so we may return the all locations
        if (!self.searchFilter()) {
          // Reset Locations by placing the markers back on the map
          ko.utils.arrayForEach(self.locations(), function(location) {
            location.marker.setMap(map);
          });
          return self.locations();
        } else {
          // CHECK if search input's string value to return locations which title's match
          var str = self.searchFilter();
          var regExp = new RegExp(str, 'ig');
          return ko.utils.arrayFilter(self.locations(), function (location) {
            if(location.marker.title.match(regExp)){
              // Place marker on map and return it to the list
              location.marker.setMap(map);
              return true;
            } else {
              // Remove location's marker from the map
              location.marker.setMap(null);
            }
          });
        }
      }
    };

    self.filter = function (category) {
      console.log('Running filter');
      self.setFilter('category');
      self.categoryFilter(category);
    };
    self.activateMarker = function (data, event) {
      console.log('event', event);
      console.log('data', data.marker);
      data.showInfoPanel();
    };
  };
  extraCreditViewModel = new ExtraCreditViewModel();

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
  buildMapLegend();


  // FourSquare API Get Venue List
  var fourSqGetVenues = 'https://api.foursquare.com/v2/venues/search?'+
  'client_id=XV0OVKSTK15ITPVJOMDIBPZYBYEI5OOKSXD0GTH4JFKIXYWZ'+
  '&client_secret=GRYWQV4WWFFVJ3VQPJX4TLMBCPXP3BFCPH4IWZGUTM4MCORP'+
  '&v=20151107'+
  '&ll=40.835105,-73.945388'+
  '&radius=800'+
  '&categoryId=4bf58dd8d48988d181941735,4bf58dd8d48988d1e2931735'+
  '&intent=browse'+
  '&limit=100';

  // FourSquare API Get Venu Images
  // https://api.foursquare.com/v2/venues/[venue-id]/photos?client_id=XV0OVKSTK15ITPVJOMDIBPZYBYEI5OOKSXD0GTH4JFKIXYWZ&v=20151107
  var fourSqGetVenueImgs = function(venueID){
    return 'https://api.foursquare.com/v2/venues/'+venueID+'/photos?'+
    'client_id=XV0OVKSTK15ITPVJOMDIBPZYBYEI5OOKSXD0GTH4JFKIXYWZ'+
    '&client_secret=GRYWQV4WWFFVJ3VQPJX4TLMBCPXP3BFCPH4IWZGUTM4MCORP'+
    '&v=20151107'+
    '&limit=1';
  }

  /* FourSquare Locations
  * ref. https://developer.foursquare.com/
  */
  fetchData.fourSquare = function(map){
    $.ajax({
      url: fourSqGetVenues,
      data: '',
      dataType: 'json',
      success: function(data) {
        var venueID,
            venueIndex,
            title,
            content,
            venuePhotoSuffix,
            venuePhotoPrefix,
            venuePhotoURL,
            latitude,
            longitude,
            categories;

        var venuesFound = data.response.venues.length;
        var i;
        for (i = 0; i < venuesFound; i++) {
          //console.log(data);
          // Construct Markers to be placed on the map.
          // title, content, latitude, longitude, type
          venueIndex = i;
          venueID = data.response.venues[i].id;
          title = data.response.venues[i].name;
          content = data.response.venues[i].location.address;
          latitude = data.response.venues[i].location.lat;
          longitude = data.response.venues[i].location.lng;
          categories = data.response.venues[i].categories;

          extraCreditViewModel.locations.push(new Location(title, content, latitude, longitude, categories, venueID, venueIndex));
        }
      },
      "error": {
        "message": "Access denied",
        "__type": "Authorization Error"
      }
    });
  };

  function getVenuePhoto(venueIndex, venueID){
    $.ajax({
      url: fourSqGetVenueImgs(venueID),
      data: '',
      dataType: 'json',
      success: function(data) {
        if(data.response.photos.items.length){
          venuePhotoPrefix = data.response.photos.items[0].prefix;
          venuePhotoSuffix = data.response.photos.items[0].suffix;
          venuePhotoURL = venuePhotoPrefix + '200x200' + venuePhotoSuffix;
          console.log(venueIndex);
          console.log(extraCreditViewModel.locations());
          extraCreditViewModel.locations()[venueIndex].imgURL = venuePhotoURL;
          console.log(venuePhotoURL);
        }
      },
      "error": {
        "message": "Access denied",
        "__type": "Authorization Error"
      }
    });
  }
  // Add markers from AJAX calls
  fetchData.fourSquare();
  // Activate view model
  ko.applyBindings(extraCreditViewModel);

};
