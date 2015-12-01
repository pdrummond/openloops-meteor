if(Meteor.isClient) {
	Template.registerHelper('userIsAdmin', function () {
		return Ols.User.currentUserRole() == Ols.ROLE_ADMIN;
	});

	Template.registerHelper('labelTitle', function (labelId) {
		return Labels.findOne(labelId).title;
	});

	Template.registerHelper('labelColor', function (labelId) {
		return Labels.findOne(labelId).color;
	});

	Template.registerHelper('clientMessageCount', function (context, options) {
		return ClientMessages._collection.find().count();
	});

	Template.registerHelper('showBoardTitleClass', function (context, options) {
		var show = false;
		var currentBoardId = Session.get('currentBoardId');
		if(currentBoardId) {
			var board = Boards.findOne(currentBoardId);
			show = board != null;
		}
		return show;
	});

	Template.registerHelper('connectionStatus', function (context, options) {
		return Session.get('connectionStatus');
	});

	Template.registerHelper('errorMessage', function (context, options) {
		return Session.get('errorMessage');
	});

	Template.registerHelper('isTeamFeed', function (context, options) {
		return !Session.get('currentItemId');
	});

	Template.registerHelper('isIssue', function (context, options) {
		var item = Items.findOne(Session.get('currentItemId'));
		return item?item.type == 'issue':false;
	});

	Template.registerHelper('formatTime', function (context, options) {
		if (context) {
			return Ols.TimeUtils.formatTime(context);
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

	Template.registerHelper('currentItemDescription', function () {
		var currentItemDescription = 'No Description';
		var currentItemId = Session.get("currentItemId");
		if(currentItemId) {
			var currentItem = Items.findOne(currentItemId);
			if(currentItem) {
				if(currentItem.description && currentItem.description.length > 0) {
					currentItemDescription = currentItem.description;
				}
			}
		}
		return currentItemDescription;
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
		return item?item.isOpen:true;
	});

	Template.registerHelper('currentItemLabelsEmpty', function () {
		var item = Items.findOne(Session.get('currentItemId'));
		return item?item.labels.length == 0:true;
	});

	Template.registerHelper('currentItemLabels', function () {
		var item = Items.findOne(Session.get('currentItemId'));
		return item?item.labels:[];
	});

	Template.registerHelper('currentItemId', function () {
		var item = Items.findOne(Session.get('currentItemId'));
		return item?item._id:null;
	});

	Template.registerHelper('currentProjectId', function () {
		var project = Projects.findOne(Session.get('currentProjectId'));
		return project?project._id:null;
	});

	Template.registerHelper('projectKey', function (item) {
		var project = Projects.findOne(item.projectId);
		return project?(project.key?project.key:project.title.substring(0, 3)):null;
	});

	Template.registerHelper('currentProjectKey', function () {
		var project = Projects.findOne(Session.get('currentProjectId'));
		return project?(project.key?project.key:project.title.substring(0, 3)):null;
	});

	Template.registerHelper('currentProjectTitle', function () {
		var project = Projects.findOne(Session.get('currentProjectId'));
		return project?project.title:'';
	});

	Template.registerHelper('currentBoardId', function () {
		var board = Boards.findOne(Session.get('currentBoardId'));
		return board?board._id:null;
	});

	Template.registerHelper('currentBoardTitle', function () {
		var board = Boards.findOne(Session.get('currentBoardId'));
		return board?board.title:'All Boards';
	});

	Template.registerHelper('filterQuery', function () {
		return Session.get('filterQuery');
	});

	Template.registerHelper('currentLabelTitle', function () {
		var label = Labels.findOne(Session.get('currentLabelId'));
		return label?label.title:'';
	});
}
