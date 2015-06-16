var ks = (function(exports){
  exports.Photo = function (clientId, userId, photoCallback) {
    
    /*
     * Find a set of nearby images from an instagram feed
     */
    var Nearby = function(position, distance) {
      /*
       * Determine if an image is within range with a 
       * simple trig method. We can account for the curvature
       * of the earth later if we want to get fancy
       */
      var withinRange = function(position, imagePosition, distance) {
        return Math.sqrt(Math.pow((position.lat - imagePosition.latitude),2)
                            + Math.pow((position.lon - imagePosition.longitude),2)) < distance;
      };

      /*
       * query our cached feed once, storing the result in memory. otherwise we could
       * use cache but its better to not have the overhead of the async request
       */
      var self = this;
      var deferred = $.Deferred();

      var success = function(data) {
        var images = $.grep(data, function(image){
                        return image.location != null && withinRange(position, image.location, distance)
                      })
                      .map(function(image) {
                        return {
                          location: image.location,
                          images: image.images,
                          created_time: image.created_time,
                          link: image.link,
                          caption: image.caption,
                          id: image.id,
                          type: image.type };
                      });
          //self.dispatchEvent('images', images, self );
          photoCallback(images);
          deferred.resolve(images);
      };

    if(this.data) {
      success(this.data);
    } else {
      $.ajax({
	  url: ks.webRoot + '/data/instagram.json',//'https://api.instagram.com/v1/users/' + userId + '/media/recent?client_id=' + clientId,
	  type: 'GET'
	})
	.done(function (response) { 
	    console.log("store response")
	    self.data = response.data
	    success(response.data)
	})
	.fail(function(){
	  deferred.fail([]);
	});
    }

      return deferred.promise();
    };

    $.extend(this, ks.events);
    this.nearby = Nearby;
  };
  return exports;

}(ks || {}));
