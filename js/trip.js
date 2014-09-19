Function.prototype.memoize = function(){
  var self = this, cache = {};
  return function( arg ){
    if(arg in cache) {
      console.log('Cache hit for '+arg);
      return cache[arg];
    } else {
      console.log('Cache miss for '+arg);
      return cache[arg] = self( arg );
    }
  }
}


var ks = (function (exports) {
  ks.webRoot = window.location.href;
  var Colors = (function() {
    var colors = ['red', 'orange', 'yellow', 'green', 'blue'];
    var index = 0;
    return {
      next: function(){
        return colors[index++ % colors.length];
      }
    };
  }());

  var readGPXFile = function (url){
    var deferred = $.Deferred();
    $.ajax({
      type: 'GET',
      url: url,
      success: function(gpx) {
        console.log("load new run");
        var result = {
          bounds : new google.maps.LatLngBounds(),
          points: [],
          paths: []
        };

        var path = {
          bounds: new google.maps.LatLngBounds()
        };
        path.points = $(gpx)
                        .find('trkpt')
                        .map(function(){
                            var point = new google.maps.LatLng($(this).attr('lat'), $(this).attr('lon'))
                            result.bounds.extend(point);
                            path.bounds.extend(point);
                            return point;
                          });
        path.color = 'red';

        if(path.points.length > 0) {
          result.paths.push(path);
          result.points.concat(path.points);
        } else {
          $(gpx)
            .find('rte')
            .each(function () {
              path = { bounds: new google.maps.LatLngBounds() };
              path.points = $(this)
                              .find('rtept')
                              .map(function(){
                                var point = new google.maps.LatLng($(this).attr('lat'), $(this).attr('lon'))
                                path.bounds.extend(point);
                                result.bounds.extend(point);
                                return point;
                              });

              path.color = Colors.next();//$(this).find('rtept > extensions > gpxx\\:RouteExtension > gpxx\\:DisplayColor');
              result.paths.push(path);
              result.points = result.points.concat(path.points.toArray());
            });
        }


        result.route = new google.maps.Polyline({
          path: result.points,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        deferred.resolve(result);
      },
      failure: function () {
        return deferred.reject(null);
      }
    })
    return deferred.promise();
  };

  exports.Route = function(fileUrl) {
    readGPXFile(ks.webRoot + '/' + file);
  };

  exports.Trip = function(manifest){
    var prop = {
      manifest: manifest
      };


    prop.data = [];

    prop.initialize = function (regex) {
      function getLabel(dateString) {
        var year = dateString.substring(0,2);
        var month = dateString.substring(2,4);
        var day = dateString.substring(4,6);
        var date = new Date("20"+year, month-1, day);
        return date.toDateString();
      }
      return $.ajax({
        type: 'GET',
        url:  ks.webRoot + manifest,
        success: function (trip) {
          console.log("Trip loaded");
          prop.data = $.map(trip,function (leg){
            return { file: leg, label: getLabel(leg.match(regex)[0]) };
          });
          prop.dispatchEvent('initialize', prop.data );
          prop.setActiveIndex(0);
        },
        failure: function () {
          console.log('failed to get run list');
        }
      });
    }


    function getPolyline(file) {
      return readGPXFile(ks.webRoot + '/' + file);
    }

    prop.fetchPolyline = getPolyline.memoize();

    prop.setActiveIndex = function (index) {
      if(index === prop.index)
        return false;
      else
      {
        prop.busy = true;
        prop.index = index;
        prop.leg = prop.data[index];
        var complete = prop.data.length > prop.index + 1;;
        prop.fetchPolyline(prop.leg.file).done(function(data){
          prop.mapData = data;
          prop.dispatchEvent('change', prop );
          prop.busy = false;
          prop.dispatchEvent('idle', prop );
        });
        prop.dispatchEvent('complete', prop );
        return complete;
      }
    };

    prop.next = function () {
      return prop.setActiveIndex((prop.index + 1) % prop.data.length);
    }

    $.extend(prop, ks.events);

    return prop;
  };

  return exports;

} (ks || {}));
