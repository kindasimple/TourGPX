(function(exports) {
    exports.Map = function(canvasId, mapOptions) {
        var _trip,
        _options = {
          bounds: true,
          route: true,
          center: false,
          preload: false
        };

        this.markers = [];
        this.routes = [];
        this.bounds = new google.maps.LatLngBounds();

        var self = this;

        var initialize = function(){
            self.map = new google.maps.Map(document.getElementById(canvasId), mapOptions);
        };

        var icons = {};
        icons.Museum = {
            path: 'm10.675444,0.384533c-3.733979,0 -6.768717,2.751125 -6.768717,6.141849c0,3.390855 6.768717,14.837624 6.768717,14.837624s6.768717,-11.446769 6.768717,-14.837624c0,-3.390724 -3.029093,-6.141849 -6.768717,-6.141849zm0,9.075467c-1.784435,0 -3.233011,-1.311882 -3.233011,-2.933618s1.448575,-2.936015 3.233011,-2.936015s3.233008,1.314415 3.233008,2.936015s-1.448573,2.933618 -3.233008,2.933618z',
            fillColor: 'red',
            fillOpacity: 1,
            scale: 2,
            strokeColor: 'black',
            strokeWeight: 0.2,
            anchor: new google.maps.Point(11,22)
        };
        icons.Waypoint =  {
            path: 'm1.249999,11.124999c0,-5.317679 4.419199,-9.625 9.875001,-9.625c5.455801,0 9.875,4.307321 9.875,9.625c0,5.317679 -4.419199,9.625001 -9.875,9.625001c-5.455802,0 -9.875001,-4.307322 -9.875001,-9.625001z',
            fillColor: 'red',
            fillOpacity: 1,
            strokeColor: 'black',
            strokeWeight: .2,
            anchor: new google.maps.Point(11,11),
            scale: 1
        };


        var addListener = function (trip, map, preload) {
            var loadRouteData = function(data) {
                data.mapData.waypoints.forEach(function(waypoint) {
                    var image;
                    switch(waypoint.sym) {
                      case 'Waypoint': { image = icons[waypoint.sym]; break; }
                      case 'Museum': { image = icons[waypoint.sym]; break;}
                      default: { image = 'large_red';}
                    }
                    var point = new google.maps.LatLng(waypoint.latlng.lat, waypoint.latlng.lng);
                    self.markers.push(new google.maps.Marker({
                        map: map,
                        icon: image,
                        position: point,
                        title: waypoint.desc
                    }));
                    self.bounds.extend(point);
                  });

                data.mapData.paths.forEach(function(route) {
                    var line = new google.maps.Polyline({
                        path: $.map(route.points, function(point){
                            var point = new google.maps.LatLng(point.lat, point.lng );
                            self.bounds.extend(point);
                            return point;
                        }),
                        strokeColor: route.color,
                        strokeOpacity: 1.0,
                        strokeWeight: 2
                    });

                    if(_options.route) {
                        line.setMap(map);
                        self.routes.push(line);
                    }

                });

                if(_options.bounds)
                    map.fitBounds(self.bounds);

                if(_options.center)
                    map.setCenter(self.bounds.getCenter());
            };

            _trip.addEventListener("change", loadRouteData);

            //when we have our manifest, wire up an event that will load the rest of the
            //routes after the first is complete
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
          var geoMarker = new GeolocationMarker(self.map);
          geoMarker.setCircleOptions({fillColor: '#808080'});
          google.maps.event.addListenerOnce(geoMarker, 'position_changed', function() {
            self.map.panTo(this.getPosition());
            self.map.setZoom(10)
          });
          google.maps.event.addListener(geoMarker, 'geolocation_error', function(e) {
            alert('There was an error obtaining your position. Message: ' + e.message);
          });

          if(agent)
            agent.addEventListener('heartbeat', function (position) {
                var newPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                if(!agent.marker) {
                    agent.marker = new google.maps.Marker({
                        map:self.map,
                        draggable:false,
                        animation: google.maps.Animation.DROP,
                        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                        icon: 'img/gpsloc.png'
                    });
                    self.map.panTo( newPosition );
                    self.map.setZoom(10);
                } else {
                    if((google.maps.geometry.spherical.computeDistanceBetween(agent.marker.position, newPosition) / 1000) > .1) {
                        self.map.panTo( newPosition );
                    }
                    agent.marker.setPosition( newPosition );
                }


            })
          return this;
        };

        this.reset = function () {

            while(this.markers.length > 0) {
              this.markers.pop().setMap(null);
            }
            while(this.routes.length > 0) {
              this.routes.pop().setMap(null);
            }

        },

        this.load = function (data, map) {
            var self = this;
            data.mapData.waypoints.forEach(function(waypoint) {
                var image;
                switch(waypoint.sym) {
                    case 'Waypoint': { image = icons[waypoint.sym]; break; }
                    case 'Museum': { image = icons[waypoint.sym]; break;}
                    default: { image = 'large_red';}
                }
                self.markers.push(new google.maps.Marker({
                    map: map.map,
                    icon: image,
                    position: new google.maps.LatLng(waypoint.latlng.lat, waypoint.latlng.lng),
                    title: waypoint.desc
                }));
            });

            data.mapData.paths.forEach(function(route) {
                var line = new google.maps.Polyline({
                    path: $.map(route.points, function(point){
                        var point = new google.maps.LatLng(point.lat, point.lng )
                        data.mapData.bounds.extend(point);
                        return point;
                    }),
                    strokeColor: route.color,
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });

                if(_options.route) {
                    line.setMap(map);
                    self.routes.push(line);
                }

                if(_options.bounds)
                    map.fitBounds(data.mapData.bounds);

                if(_options.center)
                    map.setCenter(data.mapData.bounds.getCenter());
            });
        },

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
                            $(this).animate({ height: 175, width: 175 });
                        }
                    });
                });

                google.maps.event.addListener(marker, 'mouseout', function (event) {
                    $('#images > img').each(function () {
                        if($(this).data('id') === image.id) {
                            $(this).animate({ height: 150, width: 150 });
                        }
                    });
                });
            });
        };

        $.extend(this, ks.events);
        initialize();
        return this;
    };
} (ks || {}));
