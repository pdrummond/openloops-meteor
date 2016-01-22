if(Meteor.isClient) {

	Template.reqList.events({
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

	Template.reqList.helpers({

		noItems: function() {
      filter.assignee = {$exists: false};
      filter.isOpen = true;
      filter.type = Ols.Item.ITEM_TYPE_REQ;
			return Ols.Item.find(filter).count() == 0;
		},

		items: function() {
      var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
      filter.assignee = {$exists: false};
      filter.isOpen = true;
      filter.type = Ols.Item.ITEM_TYPE_REQ;
			return Ols.Item.find(filter, {sort: {updatedAt: -1}});
		}
	});

}
