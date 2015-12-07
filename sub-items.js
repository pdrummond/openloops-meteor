
if(Meteor.isServer) {

	Meteor.methods({

		insertSubItem: function(newSubItem) {
			var now = new Date().getTime();
			var parentItem = Items.findOne(newSubItem.itemId);
			newSubItem = _.extend({
				_id: Random.id(),
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
				isOpen: true
			}, newSubItem);
			Items.update(parentItem._id, {$addToSet: {subItems: newSubItem}});
		},

		updateSubItem: function(subItem) {
			console.log("updateSubItem: " + JSON.stringify(subItem, null, 4));
			var parentItem = Items.findOne(subItem.itemId);
			Items.update({_id: parentItem._id, 'subItems._id': subItem._id}, {$set: {'subItems.$': subItem}});
		},

		removeSubItem: function(subItem) {
			Items.update(subItem.itemId, {$pull: {subItems: {_id: subItem._id}}});
		}
	});
}
