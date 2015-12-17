Tracker.autorun(function() {
	var itemId = Session.get('currentItemId');
	if(itemId != null) {
		Meteor.subscribe('currentItem', itemId);
	}
});
