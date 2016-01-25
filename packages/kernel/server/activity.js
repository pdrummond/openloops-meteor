Meteor.methods({
  insertActivityItem: function(activity) {
    	Activity.insert(activity);
  }
});

Meteor.publish('activityItems', function(opts) {
  return Activity.find({projectId: opts.currentProjectId}, {createdAt: -1});
});
