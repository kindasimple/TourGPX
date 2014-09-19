(function(exports) {
  exports.Gps = function(interval){
    var getPosition = function (ctx) {
      navigator.geolocation.getCurrentPosition(function(position) {
        ctx.dispatchEvent('heartbeat', position);
        setTimeout(getPosition, interval, ctx);
      });
    }


    this.run = function(){
      setTimeout(getPosition, interval, this);
    };

    $.extend(this, ks.events);
  }
}(ks || {}))
