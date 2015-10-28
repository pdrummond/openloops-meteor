if(Meteor.isClient) {

	Template.registerHelper('isTeamFeed', function (context, options) {
		return !Session.get('currentItemId');
	});

	Template.registerHelper('isIssue', function (context, options) {
		var item = Items.findOne(Session.get('currentItemId'));
		return item?item.type == 'issue':false;
	});

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

	Template.registerHelper('currentItemIsOpen', function () {
		var item = Items.findOne(Session.get('currentItemId'));
		return item?item.isOpen:false;
	});

	Template.registerHelper('currentItemLabels', function () {
		var item = Items.findOne(Session.get('currentItemId'));
		return item?item.labels:[];
	});

	Template.registerHelper('currentBoardId', function () {
		var board = Boards.findOne(Session.get('currentBoardId'));
		return board?board._id:null;
	});

	Template.registerHelper('currentBoardTitle', function () {
		var board = Boards.findOne(Session.get('currentBoardId'));
		return board?board.title:'';
	});

	Template.registerHelper('filterQuery', function () {
		return Session.get('filterQuery');
	});

	Template.registerHelper('currentLabelTitle', function () {
		var label = Labels.findOne(Session.get('currentLabelId'));
		return label?label.title:'';
	});
}
