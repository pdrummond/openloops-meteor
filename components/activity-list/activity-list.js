if(Meteor.isClient) {

  var getFilter = function() {
    var filter = {type: 'MSG_TYPE_ACTIVITY'};
    return filter;
  }

  Template.activityList.onCreated(function() {
    var self = this;
		Tracker.autorun(function() {
			self.subscribe('activityItems', function(err, result) {
				if(err) {
					Ols.Error.showError("Unable to subscribe to activity items", err);
				}
			});
		});
	});

	Template.activityList.helpers({

		noItems: function() {
			return Activity.find().count() == 0;
		},

		activityItems: function() {
			return Activity.find({}, {sort: {createdAt: -1}});
		}
	});

}
