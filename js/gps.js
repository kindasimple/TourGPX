(function(exports) {
  exports.Gps = function(interval){
    var getPosition = function (ctx) {
      navigator.geolocation.getCurrentPosition(function(position) {
        ctx.dispatchEvent('heartbeat', position);
        ctx._timeout = setTimeout(getPosition, interval, ctx);
      });
    }


    this.run = function(){
      this._timeout = setTimeout(getPosition, interval, this);
    };

    this.pause = function () {
      clearTimeout(this._timeout);
    }

    $.extend(this, ks.events);
    this.run();
  }
}(ks || {}))
