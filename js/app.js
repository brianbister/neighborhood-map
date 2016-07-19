function Place(name, lat, lng, description) {
  var self = this;
  self.name = name;
  self.lat = lat;
  self.lng = lng;
  self.description = description;
}

function Article(headline, snippet) {
  var self = this;
  self.headline = headline;
  self.snippet = snippet;
}

function ViewModel() {
  var self = this;
  self.places = ko.observableArray([
    new Place("Charging Bull", 40.70550, -74.01341, "3-ton bronze sculpture of a bull symbolizing New York's financial industry."),
    new Place("New York Stock Exchange", 40.70680, -74.01126, "High-tech home of one of the world's leading financial markets."),
    new Place("St. Paul's Chapel", 40.71134, -74.00916, "Colonial-era Episcopal church with a 9/11 exhibit."),
    new Place("The Woolworth Building", 40.71241, -74.00839, "1913 neo-Gothic skyscraper, once the world's tallest building."),
    new Place("9/11 Memorial", 40.71140, -74.01251, "Plaza, pools & exhibits honoring victims of 1993 & 2001 WTC terrorist attacks.")
  ]);
  self.allPlaces = self.places();
  self.filter = ko.observable("");
  self.focusedPlace = ko.observable();
  self.articles = ko.observableArray([]);
  self.error = ko.observable("");

  self.filterPlaces = function() {
    self.places([]);
    for (var i = 0; i < self.allPlaces.length; i++) {
      if (self.allPlaces[i].name.toLowerCase().indexOf(self.filter().toLowerCase()) > -1) {
        self.places.push(self.allPlaces[i]);
      } else {
        self.allPlaces[i].marker.setMap(null);
      }
    }
    self.replaceMarkers();
  };

  self.initMap = function() {
    var mapDiv = document.getElementById('map');
    map = new google.maps.Map(mapDiv, {
      center: {
        lat: 40.71030,
        lng: -74.00511
      },
      zoom: 15,
      disableDefaultUI: true
    });
    self.replaceMarkers();
  };

  self.focusPlace = function(place) {
    self.focusedPlace(place);
    for (var i = 0; i < self.places().length; i++) {
      self.places()[i].marker.setAnimation(null);
    }
    place.marker.setAnimation(google.maps.Animation.BOUNCE);
    map.setCenter(place.marker.getPosition());
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    url += '?' + $.param({
      'api-key': "bebe9ce324f34ca5b7f48a4e5f6db6bd",
      'q': place.name,
      'sort': "newest"
    });
    $.ajax({
      url: url,
      method: 'GET',
    }).done(function(result) {
      var docs = result.response.docs;
      self.articles([]);
      for (var j = 0; j < docs.length && j < 2; j++) {
        self.articles.push(new Article(docs[j].headline.main, docs[j].snippet));
      }
    }).fail(function(err) {
      self.error("An error occurred loading your articles.");
    });
  };

  self.replaceMarkers = function() {
    for (var i = 0; i < self.allPlaces.length; i++) {
      if (self.allPlaces[i].marker) {
        self.allPlaces[i].marker.setMap(null);
      }
    }

    // Add new markers
    for (var i = 0; i < self.places().length; i++) {
      self.replaceMarker(self.places()[i]);
    }
  };

  self.replaceMarker = function(place) {
    place.marker = new google.maps.Marker({
      map: map,
      position: place,
      title: place.name
    });
    place.marker.name = place.name;
    place.marker.addListener("click", function() {
      self.focusPlace(place);
    });
  }

  self.initMap();
}

function init() {
  ko.applyBindings(new ViewModel());
}

function googleError() {
  alert("An error occurred loading Google Maps.");
}
