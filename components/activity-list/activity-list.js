if(Meteor.isClient) {

  var getFilter = function() {
    var filter = {type: 'MSG_TYPE_ACTIVITY'};
    return filter;
  }

  Template.activityList.onCreated(function() {
    var self = this;
		Tracker.autorun(function() {
			self.subscribe('items', getFilter(), function(err, result) {
				if(err) {
					Ols.Error.showError("Items Subscription error", err);
				}
			});
		});
	});

	Template.activityList.events({
		'keyup #filter-input': function() {
			var self = this;
			if(this.filterInputKeyTimer) {
				console.log("CANCELLED FILTER KEY TIMER");
				clearTimeout(this.filterInputKeyTimer);
			}
			this.filterInputKeyTimer = setTimeout(function() {
				Session.setPersistent('filterQuery', $('#filter-input').val());
				Session.set('filterSentence', null);
			}, 500);
		},
	});

	Template.activityList.helpers({

		noItems: function() {
			return Ols.Item.find(OpenLoops.getFilterQuery(Session.get('filterQuery'))).count() == 0;
		},

		items: function() {
			return Ols.Item.find(getFilter(), {sort: {createdAt: -1}});
		}
	});

}
