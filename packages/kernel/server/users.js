Meteor.publish("allUsernames", function () {
	return Meteor.users.find({}, {fields: {
		"username": 1,
		"profileImage": 1,
		"workingOn": 1
	}});
});

Meteor.publish("userStatus", function() {
	return Meteor.users.find({ "status.online": true }, { fields: { "username": 1, "status":1 } });
});
