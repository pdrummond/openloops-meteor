if(Meteor.isClient) {

	Template.registerHelper('truncateString', function (str, maxLength) {
		if(str) {
			return Ols.StringUtils.truncate(str, maxLength);
		} else {
			return str;
		}
	});

	Template.registerHelper('itemTabActiveClass', function (item) {
		return item && Session.get('activeItemTab') == item._id?'active':'';
	});

	Template.registerHelper('itemHasAssignee', function (item) {
		if(item == null) {
			item = Ols.Item.findOne(Session.get('currentItemId'));
		}
		return Meteor.users.findOne({username: item.assignee}) != null;
	}),

	Template.registerHelper('assigneeImageUrl', function (item) {
		if(item == null) {
			item = Ols.Item.findOne(Session.get('currentItemId'));
		}
		var assignee = Meteor.users.findOne({username: item.assignee});
		return assignee?assignee.profileImage:'ERR: Assignee null for assigneeImageUrl';
	}),

	Template.registerHelper('assigneeUsername', function (item) {
		if(item == null) {
			item = Ols.Item.findOne(Session.get('currentItemId'));
		}
		var assignee = Meteor.users.findOne({username: item.assignee});
		return assignee?assignee.username:'ERR: Assignee null for assigneeUsername';
	}),

	Template.registerHelper('userIsItemOwnerOrProjectAdmin', function () {
		var allowed = false;
		if(Meteor.user() != null) {
			allowed = Ols.User.currentUserRole() == Ols.ROLE_ADMIN;
			if(allowed == false) {
				allowed = Ols.Item.isUserItemOwner(Session.get('currentItemId'), Meteor.user().username);
			}
			if(allowed == false) {
				if(Session.get('currentProjectId') != null) {
					allowed = Ols.Project.isUserProjectAdmin(Session.get('currentProjectId'), Meteor.user().username);
				}
			}

		}
		return allowed;
	});

	Template.registerHelper('userIsProjectAdmin', function () {
		var allowed = false;
		if(Meteor.user() != null) {
			allowed = Ols.User.currentUserRole() == Ols.ROLE_ADMIN;
			if(allowed == false) {
				if(Session.get('currentProjectId') != null) {
					allowed = Ols.Project.isUserProjectAdmin(Session.get('currentProjectId'), Meteor.user().username);
				}
			}
		}
		return allowed;
	});

	Template.registerHelper('userIsAdmin', function () {
		return Ols.User.currentUserRole() == Ols.ROLE_ADMIN;
	});

	Template.registerHelper('labelTitle', function (labelId) {
		var label = Labels.findOne(labelId);
		return label?label.title:'ERR: label null for labelTitle';
	});

	Template.registerHelper('labelColor', function (labelId) {
		var label = Labels.findOne(labelId);
		return label?label.color:'ERR: label null for labelColor';
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
		var item = Ols.Item.findOne(Session.get('currentItemId'));
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

	Template.registerHelper('currentItemKey', function () {
		var currentItemKey = '??';
		var currentItemId = Session.get("currentItemId");
		if(currentItemId) {
			var currentItem = Ols.Item.findOne(currentItemId);
			if(currentItem) {
				var project = Ols.Project.findOne(currentItem.projectId);
				if(project != null) {
					currentItemKey = project.key + "-" + currentItem.pid;
				}
			}
		}
		return currentItemKey;
	});

	Template.registerHelper('currentItemTitle', function () {
		var currentItemTitle = '';
		var currentItemId = Session.get("currentItemId");
		if(currentItemId) {
			var currentItem = Ols.Item.findOne(currentItemId);
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
			var currentItem = Ols.Item.findOne(currentItemId);
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
			var currentItem = Ols.Item.findOne(currentItemId);
			if(currentItem) {
				currentItemMessageCount = currentItem.numMessages;
			}
		}
		return currentItemMessageCount;
	});

	Template.registerHelper('currentItemIsOpen', function () {
		var item = Ols.Item.findOne(Session.get('currentItemId'));
		return item?item.isOpen:true;
	});

	Template.registerHelper('currentItemLabelsEmpty', function () {
		var item = Ols.Item.findOne(Session.get('currentItemId'));
		return item && item.labels ? item.labels.length == 0 : true;
	});

	Template.registerHelper('currentItemLabels', function () {
		var item = Ols.Item.findOne(Session.get('currentItemId'));
		return item?item.labels:[];
	});

	Template.registerHelper('currentItemId', function () {
		var item = Ols.Item.findOne(Session.get('currentItemId'));
		return item?item._id:null;
	});

	Template.registerHelper('currentProjectId', function () {
		var project = Ols.Project.findOne(Session.get('currentProjectId'));
		return project?project._id:null;
	});

	Template.registerHelper('itemPid', function (item) {
		if(item ==null) {
			item = Ols.Item.findOne(Session.get('currentItemId'));
		}
		return item && item.pid?item.pid:'??';
	});

	Template.registerHelper('projectKey', function (item) {
		//console.log("> projectKey helper");
		if(item ==null) {
			item = Ols.Item.findOne(Session.get('currentItemId'));
		}
		var project = Ols.Project.findOne(item.projectId);
		//console.log("< projectKey helper");
		return project?(project.key?project.key:project.title.substring(0, 3)):null;
	});

	Template.registerHelper('currentProjectKey', function () {
		var project = Ols.Project.findOne(Session.get('currentProjectId'));
		return project?(project.key?project.key:project.title.substring(0, 3)):null;
	});

	Template.registerHelper('currentProjectTitle', function () {
		var project = Ols.Project.findOne(Session.get('currentProjectId'));
		return project?project.title:'';
	});

	Template.registerHelper('currentBoardId', function () {
		var board = Boards.findOne(Session.get('currentBoardId'));
		return board?board._id:null;
	});

	Template.registerHelper('currentBoardTitle', function () {
		var board = Boards.findOne(Session.get('currentBoardId'));
		return board?board.title:'ERR: No Board';
	});

	Template.registerHelper('filterQuery', function () {
		return Session.get('filterQuery');
	});

	Template.registerHelper('currentLabelTitle', function () {
		var label = Labels.findOne(Session.get('currentLabelId'));
		return label?label.title:'';
	});
}
