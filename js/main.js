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
        iconType: 'Art Gallery',
        icon: iconBase + 'artgallery.png'
      },
      museum: {
        iconType: 'Museum',
        icon: iconBase + 'museum.png'
      },
      monument: {
        iconType: 'Monument',
        icon: iconBase + 'monument.png'
      },
      library: {
        iconType: 'Library',
        icon: iconBase + 'library.png'
      },
      university: {
        iconType: 'College & University',
        icon: iconBase + 'university.png'
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
  function Location (title, content, latitude, longitude, stats, venueID, venueIndex , mapIcon) {
    var self = this;
    self.title = title;
    self.latitude = latitude;
    self.content = content;
    self.longitude = longitude;
    self.stats = stats;
    // Default until an image is found for the venue/location
    self.imgURL = '';
    self.venueID = venueID;
    self.venueIndex = venueIndex;
    self.mapIcon = mapIcon;

  }

  // Add "click" behavior to markers
  Location.prototype.clickFunc = function(){
    var self = this;
    self.marker.addListener('click', function() {
      self.showInfoPanel();
    });
  };

  Location.prototype.showInfoPanel = function(){
    var self = this,
        content = '',
        address = '';

    if(self.content){
      address = '<p>'+self.content+'</p>';
    }

    if (self.marker.getAnimation() !== null) {
      self.marker.setAnimation(null);
    } else {
      map.setCenter({lat: self.latitude, lng: self.longitude});
      self.marker.setAnimation(google.maps.Animation.BOUNCE);
      window.setTimeout(function(){
        self.marker.setAnimation(null);

        window.setTimeout(function(){
          content = '<div class="info-window-content">';
          content += '<div class="info-subtitle">Data provided by FourSquare:</div>';
          content += '<div class="info-title">'+self.title+'</div>';
          content += '<div class="info-content">';
          content += address;
          content += '<p><ul>';
          content += '<li>Checkins Count: '+self.stats.checkinsCount+'</li>';
          content += '<li>Tip Count: '+self.stats.tipCount+'</li>';
          content += '<li>Users Count: '+self.stats.usersCount+'</li>';
          content += '</ul></p>';
          content += '</div>';

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
    self.results = ko.observable(0);

    self.setMarkers = ko.computed(function(){

      ko.utils.arrayForEach(this.locations(), function(location) {
        // Check if marker already exist so this only runs once.
        if(!location.marker){
          // Create Marker
          location.marker = new google.maps.Marker({
          position: {lat: Number(location.latitude), lng: Number(location.longitude)},
          map: map,
          title: location.title,
          animation: google.maps.Animation.DROP,
          icon: icons[location.mapIcon].icon
          });
          // Hide the markers by default
          location.marker.setMap(null);
          // Add event listener, now that marker exist
          location.clickFunc();
          // Get Location Photo
          getVenuePhoto(location.venueIndex, location.venueID);

        }
      });
    }, self);
    // Filtered Markers
    self.filteredMarkers = function(){
      var resulted = 0;
      // SEARCH INPUT ----------------------------------------------------------
      if(self.currentFilter() == 'search'){
        // Searching locations by title
        // CHECK if search input is empty, so we may return the all locations
        if (!self.searchFilter()) {
          // Reset Locations by placing the markers back on the map
          ko.utils.arrayForEach(self.locations(), function(location) {
            location.marker.setMap(map);

          });
          resulted = self.locations().length;
          self.results(resulted);
          return self.locations();
        } else {
          // CHECK if search input's string value to return locations which title's match
          var str = self.searchFilter();
          var regExp = new RegExp(str, 'ig');
          resulted = 0
          self.results(resulted);
          return ko.utils.arrayFilter(self.locations(), function (location) {

            if(location.marker.title.match(regExp)){
              // Place marker on map and return it to the list
              location.marker.setMap(map);
              resulted++;
              self.results(resulted);
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
      self.setFilter('category');
      self.categoryFilter(category);
    };
    self.activateMarker = function (data, event) {
      data.showInfoPanel();
    };
  }
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
  /**
   * FourSquare API
   * Multiple Request: https://developer.foursquare.com/docs/multi/multi
   * Venue Search: https://developer.foursquare.com/docs/venues/search
   */
  // Declare common variables so we can extend features later and allow flexibility
  var fsLatLng = '40.835105,-73.945388',
      fsRadius = '800',
      fsLimit = '10',
      fsVersion = '20151107',
      fsCategories = ['museum', 'university', 'library', 'monument', 'artgallery'];

  var fourSqGetVenues = 'https://api.foursquare.com/v2/multi'+
    '?client_id=XV0OVKSTK15ITPVJOMDIBPZYBYEI5OOKSXD0GTH4JFKIXYWZ'+
    '&client_secret=GRYWQV4WWFFVJ3VQPJX4TLMBCPXP3BFCPH4IWZGUTM4MCORP'+
    '&v='+fsVersion+
    '&requests='+
    // [0] Museums
    encodeURIComponent('/venues/search?v='+fsVersion+'&ll='+
    encodeURIComponent(fsLatLng)+
    '&radius='+fsRadius+
    '&categoryId='+
    '4bf58dd8d48988d181941735'+
    '&limit='+fsLimit)+
    // [1] College & University
    encodeURIComponent(',/venues/search?v='+fsVersion+'&ll='+
    encodeURIComponent(fsLatLng)+
    '&radius='+fsRadius+
    '&categoryId='+
    '4d4b7105d754a06372d81259'+
    '&limit='+fsLimit)+
    // [2] Library
    encodeURIComponent(',/venues/search?v='+fsVersion+'&ll='+
    encodeURIComponent(fsLatLng)+
    '&radius='+fsRadius+
    '&categoryId='+
    '4bf58dd8d48988d12f941735'+
    '&limit='+fsLimit)+
    // [3] Monument / Landmark
    encodeURIComponent(',/venues/search?v='+fsVersion+'&ll='+
    encodeURIComponent(fsLatLng)+
    '&radius='+fsRadius+
    '&categoryId='+
    '4bf58dd8d48988d12d941735'+
    '&limit='+fsLimit)+
    // [4] Art Gallery
    encodeURIComponent(',/venues/search?v='+fsVersion+'&ll='+
    encodeURIComponent(fsLatLng)+
    '&radius='+fsRadius+
    '&categoryId='+
    '4bf58dd8d48988d1e2931735'+
    '&limit='+fsLimit);

  // FourSquare API Get Venu Images
  // https://api.foursquare.com/v2/venues/[venue-id]/photos?client_id=XV0OVKSTK15ITPVJOMDIBPZYBYEI5OOKSXD0GTH4JFKIXYWZ&v=20151107
  var fourSqGetVenueImgs = function(venueID){
    return 'https://api.foursquare.com/v2/venues/'+venueID+'/photos?'+
    'client_id=XV0OVKSTK15ITPVJOMDIBPZYBYEI5OOKSXD0GTH4JFKIXYWZ'+
    '&client_secret=GRYWQV4WWFFVJ3VQPJX4TLMBCPXP3BFCPH4IWZGUTM4MCORP'+
    '&v=20151107'+
    '&limit=1';
  };

  /* FourSquare Locations
   * ref. https://developer.foursquare.com/
   */
  fetchData.fourSquare = function(map){
    $.ajax({
      url: fourSqGetVenues,
      data: '',
      dataType: 'json',
      success: function(data) {
        console.log(data);
        var venueID,
            venueIndex,
            title,
            content,
            latitude,
            longitude,
            stats,
            mapIcon,
            item,
            responses = data.response.responses.length,
            venueIndex = 0;

        for (response = 0; response < responses; response++) {
          venuesFound = data.response.responses[response].response.venues.length;

          for (item = 0; item < venuesFound; item++) {
            //console.log(data);
            // Construct Markers to be placed on the map.
            // title, content, latitude, longitude, type
            venueID   = data.response.responses[response].response.venues[item].id;
            title     = data.response.responses[response].response.venues[item].name;
            content   = data.response.responses[response].response.venues[item].location.address;
            latitude  = data.response.responses[response].response.venues[item].location.lat;
            longitude = data.response.responses[response].response.venues[item].location.lng;
            stats = data.response.responses[response].response.venues[item].stats;
            mapIcon = fsCategories[response];
            extraCreditViewModel.locations.push(
              new Location(title, content, latitude, longitude, stats, venueID, venueIndex, mapIcon)
            );
            venueIndex++;
          }
        }
      },
      error: function(jqXHR, status, statusText){
        // console.log(jqXHR);
        // console.log(status);
        // console.log(statusText);
      },
      complete: function(jqXHR, textStatus){
      }
    });
  };

  function getVenuePhoto(venueIndex, venueID){
    $.ajax({
      url: fourSqGetVenueImgs(venueID),
      data: '',
      dataType: 'json',
      success: function(data) {
        var venuePhotoSuffix,
            venuePhotoPrefix,
            venuePhotoURL;

        if(data.response.photos.items.length){
          venuePhotoPrefix = data.response.photos.items[0].prefix;
          venuePhotoSuffix = data.response.photos.items[0].suffix;
          venuePhotoURL = venuePhotoPrefix + '200x200' + venuePhotoSuffix;
          // console.log(venueIndex);
          // console.log(extraCreditViewModel.locations());
          extraCreditViewModel.locations()[venueIndex].imgURL = venuePhotoURL;
          // console.log(venuePhotoURL);
        }
      },
      error: function(jqXHR, status, statusText){
        // console.log(jqXHR);
        // console.log(status);
        // console.log(statusText);
      }
    });
  }

  // Add markers from AJAX calls
  fetchData.fourSquare();
  // Activate view model
  ko.applyBindings(extraCreditViewModel);

};

// Toggle search result list on mobile
$(document).ready(function () {
  $('[data-toggle="offcanvas"]').click(function () {
    $('.row-offcanvas').toggleClass('active')
  });
});