Template.checklist.helpers({

});

Template.checklist.events({
	'click #add-checkitem-button': function() {
		var subItem = {
			text: $('#checklist-input').val(),
			type: Ols.SubItem.SUB_ITEM_TYPE_CHECKITEM,
			itemId: Session.get('currentItemId'),
			itemTab: Session.get('activeItemTab')
		};
		Meteor.call('insertSubItem', subItem, function(err, res) {
			if(err) {
				alert("Error adding checklist item: " + err.reason);
			}
		});
	}
});
