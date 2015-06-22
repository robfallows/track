Packages = new Mongo.Collection('packages');

if (Meteor.isServer) {
  Meteor.startup(function() {
    try {
      Packages.remove('banana');
      Packages.insert({_id:'banana', trackingNumber:'abc123', status:'Out', vanNumber:42});
    } catch (err) {}
  });
}
