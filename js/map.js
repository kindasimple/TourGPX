(function(exports) {
  exports.Map = function(canvasId, mapOptions) {
    var _trip,
    _options = {
      bounds: true,
      route: true,
      center: false
    };

    var self = this;

    var initialize = function(){
      self.map = new google.maps.Map(document.getElementById(canvasId), mapOptions);
    };

    var addListener = function (trip, map) {
      _trip.addEventListener("change", function(data) {

        var route = new google.maps.Polyline({
          path: data.mapData.points,
          strokeColor: '#FF0000',
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
    };

    this.trip = function (trip, options){
      options || (options = {});

      if(options.hasOwnProperty("bounds")) _options.bounds = options.bounds;
      if(options.hasOwnProperty("route")) _options.route = options.route;
      if(options.hasOwnProperty("center")) _options.center = options.center;

      _trip = trip;
      addListener(trip, self.map);
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
          $('#images > span').each(function () {
            if($(this).data('id') === image.id) {
              this.classList.add("bounce");
            }
          });
        });

        google.maps.event.addListener(marker, 'mouseout', function (event) {
          $('#images > span').each(function () {
            if($(this).data('id') === image.id) {
              this.classList.remove("bounce");
            }
          });
        });
      });
    };

    $.extend(this, ks.events);
    initialize();
  };
} (ks || {}));
