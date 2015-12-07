
SubItems = new Mongo.Collection('sub-items');

if(Meteor.isServer) {

	Meteor.publish('subItems', function(filter) {
		return SubItems.find(filter);
	});

	Meteor.methods({

		insertSubItem: function(newSubItem) {
			var now = new Date().getTime();
			newSubItem = _.extend({
				_id: Random.id(),
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
				isOpen: true
			}, newSubItem);

			var subItemId = SubItems.insert(newSubItem);
			console.log("insertSubItem id" + subItemId + ", data: " + JSON.stringify(newSubItem, null, 4));
		},

		updateSubItem: function(subItem) {
			SubItems.update({_id: subItem._id}, {$set: subItem});
		},

		removeSubItem: function(subItem) {
			SubItems.remove(subItem._id);
		}
	});
}
