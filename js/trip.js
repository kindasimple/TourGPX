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
  exports.Trip = function(manifest){
    var prop = {
      manifest: manifest
      };

    function getPolyline(file) {
      var deferred = $.Deferred();
      $.ajax({
        type: 'GET',
        url: ks.webRoot + '/' + file,
        success: function(gpx) {
          console.log("load new run");
          var result = { bounds : new google.maps.LatLngBounds(), points: [] };
          result.points = $(gpx)
                            .find('trkpt')
                            .map(function(){
                                var point = new google.maps.LatLng($(this).attr('lat'), $(this).attr('lon'))
                                result.bounds.extend(point);
                                return point;
                              });

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
    }
    function getPolylineJson(file) {
      var deferred = $.Deferred();
      $.ajax({
        type: 'GET',
        url: ks.webRoot + '/' + file,
        success: function(gpx) {
          console.log("load new run");
          var result = { bounds : new google.maps.LatLngBounds(), points: [] };
          result.points = gpx.map(function (p, i) { 
				var point = new google.maps.LatLng(p.lat, p.lon)
				if(i%2===0)
				  result.bounds.extend(point);
                                return point;
                              });

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
    }
    prop.data = [];

    prop.initialize = function (regex, initialDate) {
      function getDateFromLeg(dateString) {
        var year = dateString.substring(0,2);
        var month = dateString.substring(2,4);
        var day = dateString.substring(4,6);
        var date = new Date("20"+year, month-1, day);
        return date;//.toDateString();
      }
      return $.ajax({
        type: 'GET',
        url:  ks.webRoot + manifest,
        success: function (trip) {
          console.log("Trip loaded");
          prop.data = $.map(trip,function (leg){
            var d = getDateFromLeg(leg.match(regex)[0]);
            return { file: leg, label: d.toUTCString().split("2013").shift(), date: d };
          });
          prop.dispatchEvent('initialize', prop.data );

          var startAtBeginning = true;
          for(var legIndex=0; legIndex<prop.data.length; legIndex++) {
            if(+prop.data[legIndex].date === +initialDate) {
              prop.setActiveIndex(legIndex);
              startAtBeginning = false;
              break;
            }
          }
          if(startAtBeginning) prop.setActiveIndex(0);
        },
        failure: function () {
          console.log('failed to get run list');
        }
      });
    }

    prop.fetchPolyline = getPolylineJson.memoize();

    prop.setActiveIndex = function (index) {
      if(index === prop.index)
        return;
      else
      {
        prop.busy = true;
        prop.index = index;
        prop.leg = prop.data[index];
        prop.fetchPolyline(prop.leg.file).done(function(data){
          prop.mapData = data;
          prop.dispatchEvent('change', prop );
          prop.busy = false;
        });
      }
    };

    prop.next = function () {
      prop.setActiveIndex((prop.index + 1) % prop.data.length);
    }

    $.extend(prop, ks.events);

    return prop;
  };

  return exports;

} (ks || {}));
