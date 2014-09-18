(function(exports) {


  exports.Timer = function(trip, map) {
    var _prop = {};

    _prop.start = function (interval) {
      if(typeof timeout !== 'undefined')
        clearTimeout(timeout);

      _prop.running = true;

      timeout = setTimeout(function(interval){
          trip.next();
          google.maps.event.addListenerOnce(map, 'idle', function(){
              _prop.start(interval);
          });
        }, interval, interval);
    };

    _prop.stop = function () {
      if(typeof timeout !== 'undefined')
        clearTimeout(timeout);

      _prop.running = false;
    };

    return _prop;
  };


}(ks || {}));
