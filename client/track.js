Template.tracking.onCreated(function() {
  var self = this;
  self.current = new ReactiveDict();
  function getLocation() {
    Meteor.call('track', 'abc123', function(error, result) {
      if (error) {
        // do something if this happens because it broke!
      } else {
        self.current.set(result);
        if (result.retry) {
          Meteor.setTimeout(getLocation, result.retry);
        }
      }
    });
  };
  getLocation();
});

Template.tracking.onRendered(function() {
  var self = this;
  self.autorun(function() { // this will rerun whenever lat and/or long and/or status change
    var lat = self.current.get('lat');
    var long = self.current.get('long');
    var status = self.current.get('status');
    // do something with that stuff ...
  });
});

Template.tracking.helpers({
  unknown: function() {
    return Template.instance().current.get('status') === 'Unknown';
  },
  out: function() {
    return Template.instance().current.get('status') === 'Out';
  },
  depot: function() {
    return Template.instance().current.get('status') === 'Depot';
  },
  delivered: function() {
    return Template.instance().current.get('status') === 'Delivered';
  },
  initialising: function() {
    return Template.instance().current.get('lat') === null;
  },
  lat: function() {
    return Template.instance().current.get('lat');
  },
  long: function() {
    return Template.instance().current.get('long');
  }
});
