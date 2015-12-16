Meteor.methods({
	insertFilter: function(newFilter) {
		var now = new Date().getTime();
		newFilter = _.extend({
			createdAt: now,
			createdBy: Meteor.user().username,
			updatedAt: now,
		}, newFilter);
		return Filters.insert(newFilter);
	},
});

Meteor.publish("filters", function() {
	return Filters.find();
});
