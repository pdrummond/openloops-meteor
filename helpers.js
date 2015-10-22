if(Meteor.isClient) {
	Template.registerHelper('formatDate', function (context, options) {
		if (context) {
			return moment(context).format('MMMM Do YYYY, h:mm:ss a');
		}
	});

	Template.registerHelper('timeAgo', function (context, options) {
		if (context) {
			return moment(context).fromNow();
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

	Template.registerHelper('currentBoardId', function () {
		var board = Boards.findOne(Session.get('currentBoardId'));
		return board?board._id:null;
	});

	Template.registerHelper('currentBoardTitle', function () {
		var board = Boards.findOne(Session.get('currentBoardId'));
		return board?board.title:'';
	});
}
