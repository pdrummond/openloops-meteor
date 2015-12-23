if(Meteor.isClient) {

	Template.nowList.onCreated(function() {
		this.filter = {
			assignee: Ols.User.currentUserName(),
			isOpen: true
	 	}
	});

	Template.nowList.helpers({
		noItems: function() {
			var t = Template.instance();
			return Ols.Item.find(t.filter).count() == 0;
		},

		nowItems: function() {
			var t = Template.instance();
			return Ols.Item.find(t.filter, {sort: {updatedAt: -1}});
		}
	});

}
