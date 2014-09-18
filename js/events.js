var ks = (function (exports) {

  var events = {
    _callbacks : {},
    _callbacksOneTime: {}
  };

  events.addOneTimeEventListener = function(evname,callback) {
    if (!this._callbacksOneTime[evname]) {
      this._callbacksOneTime[evname] = $.Callbacks();
    }
    this._callbacksOneTime[evname].add(callback);
  },
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
      if (this._callbacksOneTime[evname]) {
        this._callbacksOneTime[evname].fireWith(ctx, data);
        delete this._callbacksOneTime[evname];
      }
      if (this._callbacks[evname]) {
        this._callbacks[evname].fireWith(ctx, data);
      }
    } else {
      if (this._callbacksOneTime[evname]) {
        this._callbacksOneTime[evname].fire(data);
        delete this._callbacksOneTime[evname];
      }
      if (this._callbacks[evname]) {
        this._callbacks[evname].fire(data);
      }
    }

  };

  exports.events = events;
  return exports;

}(ks || {}));
