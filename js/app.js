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
  self.articles = ko.observableArray([]);
  self.filter = ko.observable("");

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

  self.filterPlaces = function() {
    var allPlaces = self.places();
    var filteredPlaces = [];
    for (var i = 0; i < allPlaces.length; i++) {
      if (!self.filter() || allPlaces[i].name.indexOf(self.filter()) != -1) {
        filteredPlaces.push(allPlaces[i]);
      } else {
        // Remove marker
        allPlaces[i].marker.setMap(null);
      }
    }
    self.places(filteredPlaces);
    self.replaceMarkers();
  };

  self.replaceMarkers = function() {
    var allPlaces = self.places();

    // Add new markers
    for (i = 0; i < allPlaces.length; i++) {
      var marker = new google.maps.Marker({
        map: map,
        position: allPlaces[i],
        title: allPlaces[i].name
      });
      marker.name = allPlaces[i].name;
      marker.addListener("click", function() {
        var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
        url += '?' + $.param({
          'api-key': "bebe9ce324f34ca5b7f48a4e5f6db6bd",
          'q': this.name,
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
          throw err;
        });
      });
      allPlaces[i].marker = marker;
    }
  };

  self.initMap();
}

function init() {
  ko.applyBindings(new ViewModel());
}
