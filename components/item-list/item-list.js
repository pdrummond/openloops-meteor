if(Meteor.isClient) {

	Template.itemList.helpers({

		noItems: function() {
			return Ols.Item.find(OpenLoops.getFilterQuery(Session.get('filterQuery'))).count() == 0;
		},

		items: function() {
			return Ols.Item.find(OpenLoops.getFilterQuery(Session.get('filterQuery')), {sort: {updatedAt: -1}});
		}
	});

}
