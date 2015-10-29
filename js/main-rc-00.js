var map;
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


  /** Represents a location.
   * @constructor
   */
  function Location (title, content, latitude, longitude, categories) {

    this.title = title;
    this.latitude = latitude;
    this.content = content;
    this.longitude = longitude;
    this.categories = categories;

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
  function ExtraCreditViewModel() {
    var self = this;
    /* Setup Map */
    map = new google.maps.Map(document.getElementById('map'), {
      // Start from home
      center: {lat: 40.835105, lng: -73.945388},
      zoom: 14
    });
    // TESTING DELETE
    // tmarker = new google.maps.Marker({
    //   position: {lat: Number(40.835105), lng: Number(-73.945388)},
    //   map: map,
    //   title: 'this.title',
    //   // icon: icons[mapIcon].icon
    // });
    // Editable data
    self.locations = ko.observableArray(locations);

    self.currentFilter = ko.observable();
    self.searchFilter = ko.observable();
    self.categoryFilter = ko.observable();
    self.setFilter = function (filter) {
      console.log('Running setFilter');
      self.currentFilter(filter);
    };
    self.setMarkers = ko.computed(function(){
      console.log('Running setMarkers()');
      ko.utils.arrayForEach(this.locations(), function(location) {
        // Check if marker already exist so this only runs once.
        if(!location.marker){
          location.marker = new google.maps.Marker({
          position: {lat: Number(location.latitude), lng: Number(location.longitude)},
          map: map,
          title: location.title,
            // icon: icons[mapIcon].icon
          });
          // Hide the markers by default
          location.marker.setMap(null);
          location.clickFunc();
        }

      });
    }, self);

    self.searchComputedFilter = ko.computed(function(){

      console.log('Running searchComputedFilter');
      if(self.currentFilter() == 'search'){
        // Searching locations by title
        console.log('True: self.currentFilter == \'search\'');
        if (!self.searchFilter()) {
          // Reset Locations
          ko.utils.arrayForEach(self.locations(), function(location) {
            console.log(location);
            location.marker.setMap(map);
          });
          return self.locations();
        } else {
          var str = self.searchFilter();
          var regExp = new RegExp(str, 'ig');
          return ko.utils.arrayFilter(self.locations(), function (location) {

            if(location.marker.title.match(regExp)){

              location.marker.setMap(map);
              return true;
            } else {
              location.marker.setMap(null);
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

  // Foursquare API Categories
  // ref: https://developer.foursquare.com/categorytree
    // Art Art Gallery: 4bf58dd8d48988d1e2931735
    // Historic Site: 4deefb944765f83613cdba6e
    // Museum: 4bf58dd8d48988d181941735
      // Art Museum: 4bf58dd8d48988d18f941735
      // History Museum: 4bf58dd8d48988d190941735
      // Planetarium Museum: 4bf58dd8d48988d192941735
      // Science Museum: 4bf58dd8d48988d191941735
      // Dance Studio: 4bf58dd8d48988d134941735
      // Indie Theater: 4bf58dd8d48988d135941735
      // Opera House: 4bf58dd8d48988d136941735
      // Theater: 4bf58dd8d48988d137941735
      // Public Art: 507c8c4091d498d9fc8c67a9
      // Outdoor Sculpture: 52e81612bcbc57f1066b79ed
      // Street Art: 52e81612bcbc57f1066b79ee
      // Botanical Garden: 52e81612bcbc57f1066b7a22
      // Bridge: 4bf58dd8d48988d1df941735
      // Forest: 52e81612bcbc57f1066b7a23
      // Garden: 4bf58dd8d48988d15a941735
      // Lake: 4bf58dd8d48988d161941735
      // Mountain: 4eb1d4d54b900d56c88a45fc
      // National Park: 52e81612bcbc57f1066b7a21
      // Nature Preserve: 52e81612bcbc57f1066b7a13
      // Other Great Outdoors: 4bf58dd8d48988d162941735
      // River: 4eb1d4dd4b900d56c88a45fd
      // Scenic Lookout: 4bf58dd8d48988d165941735
      // Sculpture Garden: 4bf58dd8d48988d166941735
      // Summer Camp: 52e81612bcbc57f1066b7a10
      // Trail: 4bf58dd8d48988d159941735
      // Volcano: 5032848691d4c4b30a586d61
      // Government Building: 4bf58dd8d48988d126941735
      // Capitol Building: 4bf58dd8d48988d12a941735
      // City Hall: 4bf58dd8d48988d129941735
      // Courthouse: 4bf58dd8d48988d12b941735
      // Embassy / Consulate: 4bf58dd8d48988d12c951735
      // Fire Station: 4bf58dd8d48988d12c941735
      // Monument / Landmark: 4bf58dd8d48988d12d941735
      // Police Station: 4bf58dd8d48988d12e941735
      // Town Hall: 52e81612bcbc57f1066b7a38
      // Library: 4bf58dd8d48988d12f941735
      // Tourist Information Center: 4f4530164b9074f6e4fb00ff
  // Foursquare API
    var fourSquareAPI = 'https://api.foursquare.com/v2/venues/search?'+
    'client_id=XV0OVKSTK15ITPVJOMDIBPZYBYEI5OOKSXD0GTH4JFKIXYWZ'+
    '&client_secret=GRYWQV4WWFFVJ3VQPJX4TLMBCPXP3BFCPH4IWZGUTM4MCORP'+
    '&v=20130815'+
    '&ll=40.835105,-73.945388'+
    '&radius=800'+
    '&categoryId=4bf58dd8d48988d12f941735'+
    '&intent=browse'+
    '&limit=10';

  /* Initializes Google Maps and Creates all the needed markers
  */
  // window.initMap = function(map) {

  //   // tmarker.setMap(null);
  //   tmarker.setMap(map);
  //   console.log(tmarker);
  //   map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
  //   document.getElementById('legend'));

  //   // Customize map
  //   map.set('styles', styles);

  //   // Build Map Legend
  //   buildMapLegend();

  // };
  /* FourSquare Locations
  * ref. https://developer.foursquare.com/
  */
  fetchData.fourSquare = function(map){
    $.ajax({
      url: fourSquareAPI,
      data: '',
      dataType: 'json',
      success: function(data) {
        console.log(data);

        var title,
        content,
        latitude,
        longitude,
        categories;

        // console.log('NYC Museum and Galleries');
        var venuesFound = data.response.venues.length;
        var i;
        for (i = venuesFound-1; i >= 0; i--) {
          // Construct Markers to be placed on the map.
          // title, content, latitude, longitude, type
          title = data.response.venues[i].name;
          content = data.response.venues[i].location.address;
          latitude = data.response.venues[i].location.lat;
          longitude = data.response.venues[i].location.lng;
          categories = data.response.venues[i].categories;
          extraCreditViewModel.locations.push(new Location(title, content, latitude, longitude, categories));
        }
      },
      "error": {
        "message": "Access denied",
        "__type": "Authorization Error"
      }
    });
  };
  // Initate Map
  // window.initMap(map);
  // Add markers from AJAX calls
  fetchData.fourSquare();
  // Activate view model
  ko.applyBindings(extraCreditViewModel);

};
