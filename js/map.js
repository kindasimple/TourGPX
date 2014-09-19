(function(exports) {
  exports.Map = function(canvasId, mapOptions) {
    var _trip,
    _options = {
      bounds: true,
      route: true,
      center: false,
      preload: false
    };

    var self = this;

    var initialize = function(){
      self.map = new google.maps.Map(document.getElementById(canvasId), mapOptions);
    };

    var addListener = function (trip, map, preload) {
      _trip.addEventListener("change", function(data) {

        var route = new google.maps.Polyline({
          path: data.mapData.points,
          strokeColor: data.mapData.strokeColor,
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        if(_options.route) {
          route.setMap(map);
        }

        if(_options.bounds)
          map.fitBounds(data.mapData.bounds);

        if(_options.center)
          map.setCenter(data.mapData.bounds.getCenter());
      });

      if(preload){
        _trip.addEventListener("initialize", function(data) {
          _trip.addOneTimeEventListener("change", function(data) {
            while(trip.next());
          });
        });
      }
    };

    this.track = function (agent) {
      var self = this;
      var GeoMarker = new GeolocationMarker(self.map);
      agent.addEventListener('heartbeat', function (position) {
        if(!agent.marker) {
          agent.marker = new google.maps.Marker({
            map:self.map,
            draggable:false,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            icon: 'img/gpsloc.png'
          });
        } else {
          var newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          if((google.maps.geometry.spherical.computeDistanceBetween(agent.marker.position, newPosition) / 1000) > .1) {
            self.map.panTo( newPosition );
          }
          agent.marker.setPosition( newPosition );
        }

      })
      //agent.run();
    };

    this.trip = function (trip, options){
      options || (options = {});

      if(options.hasOwnProperty("bounds")) _options.bounds = options.bounds;
      if(options.hasOwnProperty("route")) _options.route = options.route;
      if(options.hasOwnProperty("center")) _options.center = options.center;
      if(options.hasOwnProperty("preload")) _options.preload = options.preload;

      _trip = trip;
      addListener(trip, self.map, options.preload);
      return this;
    };

    this.dropImagePins = function (images) {
      if(!images)
        return;
      images.forEach(function(image){
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(image.location.latitude, image.location.longitude),
            draggable: false,
            map: self.map
        });

google.maps.event.addListener(marker, 'mouseover', function (event) {
  $('#images > img').each(function () {
    if($(this).data('id') === image.id) {
      $(this).animate({
                      height: 175,
                      width: 175
                  });
    }
  });
});

google.maps.event.addListener(marker, 'mouseout', function (event) {
  $('#images > img').each(function () {
    if($(this).data('id') === image.id) {
      $(this).animate({
                      height: 150,
                      width: 150
                  });
    }
  });
});
      });
    };

    $.extend(this, ks.events);
    initialize();
  };
} (ks || {}));
