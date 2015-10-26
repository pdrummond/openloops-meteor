if(Meteor.isClient) {

	Template.manageList.onCreated(function() {
		var self = this;
		this.autorun(function() {
			self.subscribe('issues', {
				filter: OpenLoops.getFilterQuery(Session.get('filterQuery'))
			}, function(err, result) {
				if(err) {
					alert("Issues Subscription error: " + err);
				}
			});
		});
	});

	Template.manageList.helpers({
		issues: function() {
			var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
			filter.type = 'issue';
			return Items.find(filter);
		}
	});

	Template.manageList.events({
		'keyup #search-input': function() {
			OpenLoops.onSearchInput();
		}
	});

	OpenLoops.onSearchInput = function() {
		var self = this;
		if(this.searchInputKeyTimer) {
			console.log("CANCELLED KEY TIMER");
			clearTimeout(this.searchInputKeyTimer);
		}
		this.searchInputKeyTimer = setTimeout(function() {
			Session.set('filterQuery', $('#search-input').val());
		}, 500);
	}


}
