Meteor.methods({
  insertActivityItem: function(activity) {
    	Activity.insert(activity);
  }
});

Meteor.publish('activityItems', function() {
  return Activity.find({}, {createdAt: -1});
});
