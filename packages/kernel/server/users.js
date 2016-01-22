Meteor.publish("allUsernames", function () {
	return Meteor.users.find({}, {fields: {
		"username": 1,
		"profileImage": 1,
    "viewingItemId": 1,
	}});
});

Meteor.publish("userStatus", function() {
	return Meteor.users.find({ "status.online": true }, { fields: { "username": 1, "status":1 } });
});

Meteor.methods({
  updateUserSetViewingCard: function(userId, itemId) {
    Meteor.users.update(userId, {$set: {viewingItemId: itemId}});
  },

  updateUserUnSetViewingCard: function(userId) {
    Meteor.users.update(userId, {$unset: {viewingItemId: ''}});
  }

})
