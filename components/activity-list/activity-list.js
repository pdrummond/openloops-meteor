if(Meteor.isClient) {

  var getFilter = function() {
    var filter = {type: 'MSG_TYPE_ACTIVITY'};
    return filter;
  }

  Template.activityList.onCreated(function() {
    var self = this;
		Tracker.autorun(function() {
			self.subscribe('latestActivityMessages', function(err, result) {
				if(err) {
					Ols.Error.showError("Unable to subscribe to latest activity messages", err);
				}
			});
		});
	});

	Template.activityList.helpers({

		noItems: function() {
			return ServerMessages.find().count == 0;
		},

		items: function() {
			return ServerMessages({}, {sort: {createdAt: -1}});
		}
	});

}
