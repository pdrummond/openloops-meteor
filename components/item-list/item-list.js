if(Meteor.isClient) {

	Template.itemList.events({
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

	Template.itemList.helpers({

		noItems: function() {
			return Ols.Item.find(OpenLoops.getFilterQuery(Session.get('filterQuery'))).count() == 0;
		},

		items: function() {
      var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
      filter.assignee = {$exists: false};
      filter.isOpen = true;
			return Ols.Item.find(filter, {sort: {updatedAt: -1}});
		}
	});

}
