var ks = (function (exports) {

  var events = {
    _callbacks : {}
  };

  events.addEventListener = function(evname,callback) {
    if (!this._callbacks[evname]) {
      this._callbacks[evname] = $.Callbacks();
    }
    this._callbacks[evname].add(callback);
  },
  events.removeEventListener = function(evname,callback) {
    if (!this._callbacks[evname]) {
      return;
    }
    this._callbacks[evname].remove(callback);
  },
  events.dispatchEvent = function(evname, data, ctx) {
    if(arguments.length >= 3) {
      if (this._callbacks[evname]) {
        this._callbacks[evname].fireWith(ctx, data);
      }
    } else {
      if (this._callbacks[evname]) {
        this._callbacks[evname].fire(data);
      }
    }

  };

  exports.events = events;
  return exports;

}(ks || {}));
