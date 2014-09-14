(function(exports){
  exports.Photo = function (clientId, userId) {
    var Nearby = function(position) {
      var withinRange = function(position, imagePosition, distance) {
        return Math.sqrt(Math.pow((position.lat - imagePosition.latitude),2)
                            + Math.pow((position.lon - imagePosition.longitude)),2) < distance;
      };

      var deferred = $.Deferred();
      $.ajax({
        url: 'https://api.instagram.com/v1/users/' + userId + '/media/recent?client_id=' + clientId,
        type: 'GET'
      }).done(function(response) {
        var images = $.grep(response.data, function(image){
                        return location != null && withinRange(location, 10)
                        })
                      .map(response.data, function(image) {
                        return {
                          lat: image.latitude,
                          lon: image.longitude,
                          images: image.images,
                          created_time: image.created_time,
                          link: image.link,
                          caption: image.caption,
                          id: image.id,
                          type: image.type };
                      });
          deferred.resolve(images);
      }).fail(function(){
        deferred.fail([]);
      });
    };
    return { nearby: Nearby};
  };
}(ks || {}));
