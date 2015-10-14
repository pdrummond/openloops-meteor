if(Meteor.isClient) {
	Template.registerHelper('formatDate', function (context, options) {
		if (context) {
			return moment(context).format('MMMM Do YYYY, h:mm:ss a');
		}
	});

	Template.registerHelper('currentItemTitle', function () {
		var currentItemTitle = '';
		var currentItemId = Session.get("currentItemId");
		if(currentItemId) {
			var currentItem = Items.findOne(currentItemId);
			if(currentItem) {
				currentItemTitle = currentItem.title;
			}
		}
		return currentItemTitle;
	});

	Template.registerHelper('currentItemMessageCount', function (context, options) {
		var currentItemMessageCount = '';
		var currentItemId = Session.get("currentItemId");
		if(currentItemId) {
			var currentItem = Items.findOne(currentItemId);
			if(currentItem) {
				currentItemMessageCount = currentItem.numMessages;
			}
		}
		return currentItemMessageCount;
	});
}
