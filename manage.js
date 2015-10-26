if(Meteor.isClient) {
	Template.manageList.helpers({
		issues: function() {
			return Items.find({type: 'issue'});
		}
	});
}
