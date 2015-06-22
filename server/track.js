Vans = {}; // We're not persisting, so don't really need a collection, just a list of van objects.

//Meteor.startup(function() {
//  var van;
//  Meteor.setInterval(function() {
//    for (van in Vans) {
//      whereIsMyVan(van);
//    }
//  }, 1000);
//});

var getVanLocation = function(vanObj) {
  try {
    Meteor.setTimeout(function() {
      var result = { //HTTP.call(... vanObj.van ...);
        content: {
          lat: Math.random(),
          long: Math.random()
        }
      };
      vanObj.lat = result.content.lat;
      vanObj.long = result.content.long;
      vanObj.time = Date.now();
    }, 100);
  } catch (error) {
    throw new Meteor.Error('httpError', error.getMessage());
  } finally {
    vanObj.polling = false; // allows a retry on error
  }
};

var whereIsMyVan = function(van) {
  var latency = 100;
  if (! Vans[van] || Date.now() - Vans[van].time > 300000) { // not seen a request for this van before or in 5 mins, so get set up
    Vans[van] = {
      van: van,
      polling: true,
      lat: null,
      long: null
    };
    getVanLocation(Vans[van]); // and request its location
  } else if (Vans[van].polling) { // van position request already in progress - return last position.
    return Vans[van];
  } else if (Date.now() - Vans[van].time > 2000 - latency) { // last position older than 2-latency secs - get new one
    Vans[van].polling = true;
    getVanLocation(Vans[van]);
  }
  return Vans[van]; // however we got here, return what we've got
}

Meteor.methods({
  track: function(trackingNumber) {
    var retry = null;
    var vanObj = {};
    try {
      var package = Packages.findOne({trackingNumber: trackingNumber});
      if (package.vanNumber) {
        if (package.status === 'Out') {
          retry = 2000;
          vanObj = whereIsMyVan(package.vanNumber);
        } else if (package.status === 'Depot') {
          retry = 60000;
        }
        return {
          status: package.status,
          retry: retry,
          lat: vanObj.lat,
          long: vanObj.long
        };
      } else {
        return {
          status: 'Unknown'
        };
      }
    } catch (error) {
      throw new Meteor.Error('Error', error.getMessage());
    }
  }
});

