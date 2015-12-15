
OpenLoops = {};

if(Meteor.isClient) {

	ClientMessages = new Meteor.Collection('client-messages');

	Meteor.startup(function() {
		var permissionLevel = notify.permissionLevel();
		console.log("Desktop Notifications: " + permissionLevel);
		if(permissionLevel == notify.PERMISSION_DEFAULT) {
			notify.requestPermission();
		}
		notify.config({pageVisibility: false, autoClose: 5000});

		Tracker.autorun(function () {
			var status = Meteor.status().status;
			console.log("** STATUS CHANGE: " + status);
			Session.set('connectionStatus', status);
		});

		Tracker.autorun(function() {
			var itemId = Session.get('currentItemId');
			if(itemId != null) {
				Meteor.subscribe('currentItem', itemId);
			}
		});


		Streamy.on('mention', function(data) {
			console.log(">>> RECEIVED MENTION STREAMY");
			//TODO: Once mention uses direct message we won't have to
			//check for the user id.
			if(Meteor.userId() == data.toUserId) {
				var body = data.messageText;
				//notify.createNotification("Mentioned", {body: data.messageId});
				notify.createNotification("@" + data.fromUsername + " mentioned you", {
					icon: 'https://www.openloopz.com/images/openloopz-o.png',
					body: body,
					tag: data.messageId
				});
				console.log("Mention notification created")
			}
		});
	});

	OpenLoops.insertClientMessage = function(attrs) {
		var defaultAttrs = {
			type: Ols.MSG_TYPE_CHAT,
			createdAt: new Date().getTime(),
			createdBy: Meteor.user().username,
			projectId: Session.get('currentProjectId'),
			boardId: Session.get('currentBoardId'),
		};
		var newMessage = _.extend(defaultAttrs, attrs);
		var newMessageId = ClientMessages._collection.insert(newMessage);
		newMessage._id = newMessageId;
		return newMessage;
	}

	OpenLoops.onSearchInput = function() {
		var self = this;
		if(this.searchInputKeyTimer) {
			console.log("CANCELLED KEY TIMER");
			clearTimeout(this.searchInputKeyTimer);
		}
		this.searchInputKeyTimer = setTimeout(function() {
			Session.setPersistent('filterQuery', $('#search-input').val());
		}, 500);
	}

	OpenLoops.removeSidebarNewMessages = function(itemId) {
		var $itemMsgCount;
		if(itemId) {
			$itemMsgCount = $(".left-sidebar .item-list li[data-id='" + itemId + "'] .item-msg-count");

		} else {
			$itemMsgCount = $(".left-sidebar #board-item .new-messages")
		}
		$itemMsgCount.attr("data-msg-count", 0);
		$itemMsgCount.removeClass("new-messages");
	}

	OpenLoops.getFilterQuery = function(filterString) {
		var filter = {};
		var remainingText = filterString;
		var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
		var match = re.exec(filterString);
		while (match != null) {
			var field = match[1].trim();
			var value = match[2].trim();
			remainingText = remainingText.replace(field, '');
			remainingText = remainingText.replace(value, '');
			remainingText = remainingText.replace(/:/g, '');
			if(field == "label") {
				field = "labels";
				var label = Labels.findOne({title: value});
				if(label != null) {
					value = label._id;
				}
			} else if(field == 'type') {
				if(value == 'bug' || value == 'enhancement' || value == 'task') {
					field = 'issueType';
				}
			} else if(field == 'label') {
				field = 'labels';
			} else if(field == 'open') {
				field = "isOpen";
			} else if(field == 'closed') {
				field = "isOpen";
				value = (value=="true" ? "false" : "true");
			}

			if(value == "true") {
				value = true;
			} else if(value == "false") {
				value = false;
			}
			filter[field] = value;
			match = re.exec(filterString);
		}
		if(remainingText && remainingText.length > 0) {
			//console.log("REMAINING TEXT: " + remainingText);
			filter["$or"] = [{title: {$regex:remainingText}}];
		}
		console.log("Current filter is: " + JSON.stringify(filter));
		return filter;
	}

	Template.createFilterForm.events({
		'click #create-button': function(e) {
			e.preventDefault();
			var title = $("#createFilterForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var query = $("#createFilterForm input[name='query']").val();
				Meteor.call('insertFilter', {
					boardId: Session.get('currentBoardId'),
					title: title,
					query: query
				});
				FlowRouter.go("/project/" + Session.get('currentProjectId') + "/board/" + Session.get('currentBoardId'));
			}
		}
	});

	Template.app.onCreated(function() {
		this.subscribe('allUsernames');
		this.subscribe('userStatus');
		this.subscribe('projects');
		this.subscribe('boards');
		this.subscribe('teamMembers');
		this.subscribe('labels');
	});

	Template.app.events({
		'click #logout-link': function() {
			Meteor.logout();
			FlowRouter.go("/");
		}
	});

	Template.topBanner.events({

		'click .project-breadcrumb': function() {
			FlowRouter.go("/project/" + Session.get('currentProjectId'));
		},

		'click #boards-dropdown-button': function() {
			$("#board-chooser-menu").slideToggle();
		},

		'click #create-link': function() {
			Ols.Router.showCreateItemPage();
		},

		'keyup #search-input': function() {
			OpenLoops.onSearchInput();
		},

		'click #all-link': function() {
			Session.set('filterQuery', '');
		},

		'click #issues-link': function() {
			Session.set('filterQuery', 'type:issue open:true');
		},

		'click #bugs-link': function() {
			Session.set('filterQuery', 'type:bug');
		},

		'click #discussions-link': function() {
			Session.set('filterQuery', 'type:discussion');
		},

		'click #articles-link': function() {
			Session.set('filterQuery', 'type:article');
		},

		'click #now-issues-link': function() {
			Session.set('filterQuery', 'label:now type:issue');
		},

		'click #assigned-to-me-link': function() {
			Session.set('filterQuery', 'assignee:' + Meteor.user().username + " open:true");
		},

		'click #closed-link': function() {
			Session.set('filterQuery', 'closed:true');
		}
	});

	Template.topBanner.helpers({

		headerProjectTitle: function() {
			var project = Projects.findOne(Session.get('currentProjectId'));
			return project?project.title:'';
		},

		headerBoardTitle: function() {
			var board = Boards.findOne(Session.get('currentBoardId'));
			return board?board.title:'';
		},

		filterLinkActiveClass: function(filterLink) {
			var active = false;
			var query = Session.get('filterQuery');
			switch (filterLink) {
				case 'all-link':
				active = query == null || query == '';
				break;
				case 'issues-link':
				active = query == 'type:issue open:true';
				break;
				case 'bugs-link':
				active = query == 'type:bug';
				break;
				case 'discussions-link':
				active = query == 'type:discussion';
				break;
				case 'articles-link':
				active = query == 'type:article';
				break;
				case 'assigned-to-me-link':
				active = query == 'assignee:' + Meteor.user().username + " open:true";
				break;
				case 'now-issues-link':
				active = query == 'label:now type:issue';
				break;
				case 'closed-link':
				active = query == 'closed:true';
				break;
			}
			return active?"active":"";
		}

	});


	/*
	var previousMessageDate = null;
	Template.messageItemView.onRendered(function() {
	var messageDate = moment(this.data.createdAt).date();
	if(previousMessageDate && (messageDate < previousMessageDate)) {
	this.$(".user-message").addClass('new-day');
	this.$(".user-message").attr('data-date', moment(this.data.createdAt).format('MMMM Do YYYY'));
	}
	previousMessageDate = messageDate;
	console.log("previousMessageDate: " + previousMessageDate);
	});*/

	Template.messageItemView.helpers({

		messageTemplate: function() {
			var t;
			switch(this.type) {
				case Ols.MSG_TYPE_CHAT: t = 'chatMessageItemView'; break;
				case Ols.MSG_TYPE_ACTIVITY: t = 'activityMessageItemView'; break;
			}
			return t;
		}
	});

	Template.userCard.helpers( {

		noWorkingOn: function() {
			return this.workingOn == null || this.workingOn.length == 0;
		},

		isCurrentUser: function() {
			return this.username == Meteor.user().username;
		},

		userImageUrl: function() {
			return Ols.User.getProfileImageUrl(this.username);
		},

		state: function() {
			var state = 'offline';
			/*var state='offline';
			var presence = Presences.findOne({userId: this._id});
			if(presence) {
			state = presence.state;
			}
			return state;*/
			var user = Meteor.users.findOne({username:this.username});
			if(user && user.status) {
				state = user.status.online?'online':'offline';
			}
			return state;
		}
	});

	Template.userCard.events({
		'click .working-on-link': function() {
			var workingOn = prompt("What are you working on?", workingOn);
			if(workingOn != null) {
				Meteor.call('updateUserWorkingOn', Meteor.user().username, workingOn, function(err) {
					if(err) {
						Ols.Error.showError("Error updating working on status: ", err);
					} else {
						OpenLoops.insertBoardActivityMessage({
							activityType: Ols.ACTIVITY_TYPE_ITEM_USER_WORKING_ON,
							workingOn: workingOn
						});
					}
				});
			}
		}
	});

	Template.chatMessageItemView.events({
		'click .board-title': function() {
			FlowRouter.go('boardMessages', {projectId: this.projectId, boardId: this.boardId});
		}
	});

	Template.chatMessageItemView.helpers({

		itemTitle: function() {
			var item = Items.findOne(this.itemId);
			return item ? 'in ' + item.title:'';
		},

		showItemLink: function() {
			return Session.get('currentItemId')?'hide':'';
		},

		messageDate: function() {
			return moment(this.createdAt).date();
		},

		userImageUrl: function() {
			return Ols.User.getProfileImageUrl(this.createdBy);
		},

		boardTitle: function() {
			var board = Boards.findOne(this.boardId);
			return board?board.title:'';
		}
	});

	Template.activityMessageItemView.events({
		'click .board-title': function() {
			FlowRouter.go('boardMessages', {projectId: this.projectId, boardId: this.boardId});
		}
	});

	Template.activityMessageItemView.helpers({

		userImageUrl: function() {
			return this.activityImageUrl?this.activityImageUrl:Ols.User.getProfileImageUrl(this.createdBy);
		},

		activityMessage: function() {
			if(this.item) {
				var currentBoardId = Session.get('currentBoardId');
				var currentItemId = Session.get('currentItemId');
				var itemTitleLink = "";
				if(this.item != null) {
					itemTitleLink = '<span id="item-link"><a class="item-link" title="' +  Ols.StringUtils.truncate(this.item.title, 500) + '" href="' +
					'/project/' + Session.get('currentProjectId') +
					(currentBoardId?'/board/' + currentBoardId:'') +
					'/item/' + this.item._id + '/messages">' + Ols.Item.getItemKey({item: this.item}) + '</a></span>';
				} else {
					itemTitleLink = "ERR: Cannot find item";
				}

				var ctx = currentItemId?'this item':itemTitleLink;
				var msg = '';
				switch(this.activityType) {
					case Ols.Activity.ACTIVITY_TYPE_NEW_ITEM:
					msg = '<b>created</b> ' + ctx;
					break;
					case Ols.Activity.ACTIVITY_TYPE_ITEM_TYPE_CHANGE:
					msg = ('<b>changed</b> ' + ctx + ' to ' + OpenLoops.getItemTypePhrase(this.itemType, this.issueType));
					break;
					case Ols.Activity.ACTIVITY_TYPE_ITEM_OPENED:
					msg = "<b>re-opened</b> " + ctx;
					break;
					case Ols.Activity.ACTIVITY_TYPE_ITEM_CLOSED:
					msg = "<b>closed</b> " + ctx;
					break;
					case Ols.Activity.ACTIVITY_TYPE_ITEM_TITLE_CHANGED:
					msg = "<b>changed</b> title of item to " + itemTitleLink;
					break;
					case Ols.Activity.ACTIVITY_TYPE_ITEM_DESC_CHANGED:
					var itemCtx = currentItemId?"of this item to:":"of " + ctx + " to:";
					msg = "Set the description " + itemCtx;
					break;
					case Ols.Activity.ACTIVITY_TYPE_ITEM_MOVED_TO_BOARD:
						msg = "<b>moved</b> " + ctx + " to board " + "<a href='/project/" + this.toBoard.projectId + "/board/" + this.toBoard.boardId + "'>" + this.toBoard.title + "</a>";
						break;
					case Ols.Activity.ACTIVITY_TYPE_ITEM_MOVED_FROM_BOARD:
						msg = "<b>moved</b> " + ctx + " here from board " + "<a href='/project/" + this.fromBoard.projectId + "/board/" + this.fromBoard.boardId + "'>" + this.fromBoard.title + "</a>";
						break;
					default:
						msg =  "ERR: activity item " + this.activityType + " not found";
						break;
				}
			} else {
				switch(this.activityType) {
					case Ols.ACTIVITY_TYPE_NEW_BOARD:
					var board = Boards.findOne(this.boardId);
					if(board != null) {
						msg = 'created <span class="board-link">' + board.title + '</span>';
					} else {
						msg = 'ERR: board is null';
					}
					break;
					case Ols.ACTIVITY_TYPE_ITEM_USER_WORKING_ON:
					msg = "is working on " + this.workingOn;
					break;
					//FIXME: Need to find someway to defer to the plugin for this.
					case Ols.ACTIVITY_TYPE_WEBHOOK_EVENT:
					switch(this.webHookType) {
						case "GITHUB_WEBHOOK_EVENT":
						msg = Ols.GitHub.generateActivityMessage(this);
						break;
					}
					break;
					default:
					msg =  ">> activity item " + this.activityType + " not found";
					break;
				}
			}
			return msg;
		},

		activityContent: function() {
			var activityContent = "";
			if(this.itemId) {
				var item = Items.findOne(this.itemId);

				switch(this.activityType) {
					case Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED:
					activityContent = this.item?this.item.description:'ERR: Something went wrong. Cannot find item description';
					break;

				}
			} else {
				switch(this.activityType) {
					case Ols.ACTIVITY_TYPE_WEBHOOK_EVENT:
					switch(this.webHookType) {
						case "GITHUB_WEBHOOK_EVENT":
						activityContent = Ols.GitHub.generateActivityContent(this);
						break;
					}
					break;
				}
			}
			return activityContent;
		},

		showActivityContentClass: function() {
			var show = false;
			var item = Items.findOne(this.itemId);
			switch(this.activityType) {
				case Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED:
				show = true;
				break;
				case Ols.ACTIVITY_TYPE_WEBHOOK_EVENT:
				switch(this.webHookType) {
					case "GITHUB_WEBHOOK_EVENT":
					show = Ols.GitHub.showActivityContent(this);
					break;
				}
				break;
			}
			return show?"":"hide";
		},

		showItemLink: function() {
			return Session.get('currentItemId')?'hide':'';
		},

		messageDate: function() {
			return moment(this.createdAt).date();
		},

		boardTitle: function() {
			var board = Boards.findOne(this.boardId);
			return board?board.title:'';
		}
	});

	Template.itemItemView.helpers({
		isClosedClass: function() {
			return this.isOpen?'':'closed';
		},

		numMessages: function() {
			return this.numMessages - 1; //to remove the description
		},

		typeIcon: function() {
			return OpenLoops.getItemTypeIcon(this);
		},

		typeIconColor: function() {
			return OpenLoops.getItemTypeIconColor(this);
		},

		itemLabels: function() {
			var item = Items.findOne(this._id);
			return item?item.labels:[];
		},

		isActive: function() {
			return this._id == Session.get('currentItemId')?'active':'';
		}
	});

	Template.itemItemView.events({
		'click': function() {
			Ols.Router.showItemMessages(this);
		}
	});

	OpenLoops.insertBoardActivityMessage = function(activityMessage, opts) {
		activityMessage = _.extend({
			type: Ols.MSG_TYPE_ACTIVITY,
			projectId: Session.get('currentProjectId'),
			boardId: Session.get('currentBoardId')
		}, activityMessage);
		activityMessage = OpenLoops.insertClientMessage(activityMessage);
		if(opts && 'clientSideOnly' in opts && opts.clientSideOnly == true) {
			//Don't do anything here
		} else {
			Meteor.call('saveMessage', activityMessage);
			Streamy.broadcast('sendMessage', activityMessage);
		}
	}

	OpenLoops.getItemTypePhrase = function(itemType, issueType) {
		var type = 'an item';
		switch(itemType) {
			case Ols.ITEM_TYPE_DISCUSSION: type = 'a discussion'; break;
			case Ols.ITEM_TYPE_ISSUE: type = 'an issue'; break;
			case Ols.ITEM_TYPE_ARTICLE: type = 'an article'; break;
		}
		if(itemType == Ols.ITEM_TYPE_ISSUE && issueType != null) {
			switch(issueType) {
				case Ols.ISSUE_TYPE_BUG: type = 'a bug'; break;
				case Ols.ISSUE_TYPE_TASK: type = 'a task'; break;
				case Ols.ISSUE_TYPE_ENHANCEMENT: type = 'an enhancement'; break;
			}
		}
		return type;
	},

	OpenLoops.getItemTypeIcon = function(item) {
		var icon = 'fa-square';
		if(item) {
			switch(item.type) {
				case Ols.ITEM_TYPE_DISCUSSION: icon = 'fa-comments-o'; break;
				case Ols.ITEM_TYPE_ISSUE: icon = 'fa-exclamation-circle'; break;
				case Ols.ITEM_TYPE_ARTICLE: icon = 'fa-book'; break;
			}
			if(item.type == Ols.ITEM_TYPE_ISSUE && item.issueType != null) {
				switch(item.issueType) {
					case Ols.ISSUE_TYPE_BUG: icon = 'fa-bug'; break;
					case Ols.ISSUE_TYPE_TASK: icon = 'fa-exclamation-circle'; break;
					case Ols.ISSUE_TYPE_ENHANCEMENT: icon = 'fa-bullseye'; break;
				}
			}
		}
		return icon;
	},

	OpenLoops.getItemTypeIconColor = function(item) {
		var color = '#ccc';
		if(item) {
			switch(item.type) {
				case Ols.ITEM_TYPE_DISCUSSION: color = '#90BEF2'; break;
				case Ols.ITEM_TYPE_ISSUE: color = '#6cc644'; break;
				case Ols.ITEM_TYPE_ARTICLE: color = 'orange'; break;
			}
			if(item.type == Ols.ITEM_TYPE_ISSUE && item.issueType != null) {
				switch(item.issueType) {
					case Ols.ISSUE_TYPE_BUG: color = 'brown'; break;
					case Ols.ISSUE_TYPE_ENHANCEMENT: color = 'purple'; break;
				}
			}
		}
		return color;
	}

	Template.tabHeader.events({
		'click': function() {
			Session.set('activeItemTab', this._id);
			console.log("activeItemTab: " + Session.get('activeItemTab'))
		}
	});

	Template.tabBody.helpers({

		tabBodyTemplate: function() {
			switch(this.type) {
				case Ols.Item.Tab.TAB_TYPE_MESSAGE_HISTORY:
					template = "messageHistory";
					break;
				case Ols.Item.Tab.TAB_TYPE_ACTIVITY_HISTORY:
					template = "activityHistory";
					break;
				case Ols.Item.Tab.TAB_TYPE_CHECKLIST:
					template = "checkList";
					break;
				case Ols.Item.Tab.TAB_TYPE_REFLIST:
					template = "refList";
					break;
				default:
					console.error("No template for tab " + this.type);
					break;
			}
			return template;
		}
	});

	Template.feed.helpers({

		tabs: function() {
			var item = Ols.Item.getCurrent();
			return item && item.tabs ? item.tabs : [];
		},

		projectUsers: function() {
			var project = Ols.Project.getCurrent();

			var projectUsers = [];
			Meteor.users.find().forEach(function(user) {
				if(_.findWhere(project.members, {username: user.username}) != null) {
					projectUsers.push(user);
				}
			});
			return projectUsers;
		},

		filterQuery: function() {
			return Session.get('filterQuery');
		},

		isActive: function(tabName) {
			var active = false;
			var query = Session.get('filterQuery');
			switch(tabName) {
				case '': active = (!query || query.length == 0); break;
				case 'discussion': active = (query == 'type:discussion'); break;
				case 'issue': active = (query == 'type:issue'); break;
				case 'article': active = (query == 'type:article'); break;
			}
			return active?'active':'';
		},

		currentItemIcon: function() {
			return OpenLoops.getItemTypeIcon(Items.findOne(Session.get('currentItemId')));
		},

		currentItemIconColor: function() {
			return OpenLoops.getItemTypeIconColor(Items.findOne(Session.get('currentItemId')));
		},

		currentItemType: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.type:'';
		},

		currentItemIssueType: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.issueType:'';
		},

		currentItemLabels: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.labels:[];
		},

		openStatus: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?(item.isOpen?'Open':'Closed'):'Open';
		},

		boardTitle: function() {
			return Boards.findOne(Items.findOne(Session.get('currentItemId')).boardId).title;
		},

		isTabActive: function(tabName) {
			if(!Session.get('currentItemId') && tabName == 'messages') {
				return 'active';
			} else {
				return Session.get('activeItemTab') == tabName?'active':'';
			}
		}
	});

	Template.feed.events({
		'click #header-new-messages-toast': function() {
			Session.set("numIncomingMessages", 0);
			Ols.HistoryManager.scrollBottom();
		}
	});

	Template.filterItem.events({
		'click': function() {
			Session.set('filterQuery', this.query);
			Session.set('activeFilterLabel', this.title);
			$("#list-menu").slideUp();
		}
	});

	Template.boardChooserMenu.helpers({
		boards: function() {
			return Boards.find({projectId: Session.get('currentProjectId')});
		}
	});

	Template.boardChooserItem.events({

		'click': function() {
			var self = this;
			$("#board-chooser-menu").slideUp();
			FlowRouter.go("/project/" + Session.get('currentProjectId') + "/board/" + this._id);

		}
	});

	Template.moveToBoardList.helpers({
		boards: function() {
			return Boards.find({_id: {$ne: Session.get('currentBoardId')}, projectId: Session.get('currentProjectId')});
		}
	});

	Template.moveToBoardItem.events({
		'click': function() {
			var self = this;
			$("#move-to-board-list").slideUp();
			var item = Items.findOne(Session.get('currentItemId'));
			Meteor.call('moveItem', Session.get('currentItemId'), this._id, function(err, result) {
				if(err) {
					Ols.Error.showError('Error moving item: ', err);
				}
			});
			Ols.Router.showHomeMessages();
		}
	});

	Template.onlyIfProjectAccess.helpers({
		authInProcess: function() {
			return Meteor.loggingIn();
		},
		canShow: function() {
			var canShow = false;
			if(Meteor.user() != null && Session.get('currentProjectId') != null) {
				canShow = Ols.Project.isUserProjectMember(Session.get('currentProjectId'), Meteor.user().username);
			}
			return canShow;
		}
	});

	Template.onlyIfLoggedIn.helpers({
		authInProcess: function() {
			return Meteor.loggingIn();
		},
		canShow: function() {
			return !!Meteor.user();
		}
	});

	Template.onlyIfAdminUser.helpers({
		authInProcess: function() {
			return Meteor.loggingIn();
		},
		canShow: function() {
			return Ols.User.currentUserRole() == Ols.ROLE_ADMIN;
		}
	});

} //isClient

Items = new Meteor.Collection('items');
Filters = new Meteor.Collection('filters');
Settings = new Meteor.Collection('settings');
Counters = new Mongo.Collection('counters');

if(Meteor.isServer) {
	ServerMessages = new Meteor.Collection('server-messages');

	Meteor.methods({

		loadMessages: function(opts) {
			console.log("loadMessages: " + JSON.stringify(opts));

			var filter = {};

			if(opts.itemFilter && !_.isEmpty(opts.itemFilter)) {
				var itemIds = Items.find(opts.itemFilter, {fields: {_id: 1}}).map(function(obj) {
					return obj._id;
				});

				console.log("MESSAGES itemIds: " + JSON.stringify(itemIds));

				filter.itemId = { $in: itemIds };
			}

			if(opts.projectId) {
				filter.projectId = opts.projectId;
			}
			if(opts.boardId) {
				filter.boardId = opts.boardId;
			}
			if(opts.itemId) {
				filter.itemId = opts.itemId;
			}
			if(opts.olderThanDate) {
				filter.createdAt = {$lt: opts.olderThanDate};
			}
			console.log("SERVER FILTER: " + JSON.stringify(filter));
			var messages = ServerMessages.find(filter, {
				limit: Ols.MESSAGE_PAGE_SIZE,
				sort: {createdAt: -1}
			});
			//Meteor._sleepForMs(2000);
			return messages.fetch();
		},

		saveMessage: function(newMessage) {
			console.log("> saveMessage: " + JSON.stringify(newMessage));
			newMessage.createdAt = new Date().getTime();
			newMessage.createdBy = newMessage.createdBy || Meteor.user().username;

			ServerMessages.insert(newMessage);

			if(newMessage.itemId) {
				Items.update(newMessage.itemId, {
					$inc: {numMessages: 1},
					$set: {updatedAt: new Date().getTime()},
				});
			}
			Boards.update(newMessage.boardId, {$inc: {numMessages: 1}});
			Projects.update(newMessage.projectId, {$inc: {numMessages: 1}});
			Meteor.call('detectMentionsInMessage', newMessage);
		},

		insertMessage: function(newMessage) {
			newMessage = _.extend({
				createdAt: new Date().getTime(),
				createdBy: Meteor.user().username,
			}, newMessage);
			Meteor.call('saveMessage', newMessage);
			Streamy.broadcast('sendMessage', newMessage);
		},

		insertItem: function(newItem) {
			console.log("insertItem - boardId:" + newItem.boardId);
			var now = new Date().getTime();
			console.log("new item project id " + newItem.projectId);

			newItem = _.extend({
				pid: newItem.projectId?incrementCounter('counters', newItem.projectId):0,
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
				isOpen: true,
				numMessages: 0,
				tabs: [
					{_id: "messages", icon: 'fa-comments-o', label: "Messages", type: Ols.Item.Tab.TAB_TYPE_MESSAGE_HISTORY},
					{_id: "activity", icon: 'fa-exchange', label: "Activity", type: Ols.Item.Tab.TAB_TYPE_ACTIVITY_HISTORY},
					{_id: Random.id(), icon: 'fa-check', label: "Todo List", type: Ols.Item.Tab.TAB_TYPE_CHECKLIST},
					//{_id: Random.id(), icon: 'fa-check-circle-o', label: "Check List", type: Ols.Item.Tab.TAB_TYPE_CHECKLIST}
					{_id: Random.id(), icon: 'fa-book', label: "References", type: Ols.Item.Tab.TAB_TYPE_REFLIST}
				],
				subItems: []
			}, newItem);

			var newItemId = Items.insert(newItem);
			//Meteor._sleepForMs(2000);
			var newItem = _.extend(newItem, {_id: newItemId});

			Ols.Activity.insertActivityMessage({
				activityType: Ols.ACTIVITY_TYPE_NEW_ITEM
			}, newItem);
			if(Ols.StringUtils.notEmpty(newItem.description)) {
				Ols.Activity.insertActivityMessage({
					activityType: Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED
				}, newItem);
			}

			return newItem;
		},

		updateItem: function(itemId, attrs) {
			console.log("> updateItem: " + JSON.stringify(attrs));
			var item = Items.findOne(itemId);
			Items.update(itemId, {$set: attrs});
			var newItem = Items.findOne(itemId);
			if(item.title != newItem.title) {
				Ols.Activity.insertActivityMessage({
					activityType: Ols.ACTIVITY_TYPE_ITEM_TITLE_CHANGED,
				}, newItem);
			}
			if(item.description != newItem.description) {
				Ols.Activity.insertActivityMessage({
					activityType: Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED
				}, newItem);
			}
			return newItem;
		},

		moveItem: function(itemId, toBoardId) {
			var item = Items.findOne(itemId);
			var fromBoardId = item.boardId;

			Items.update(itemId, {
				$set: {
					boardId: toBoardId,
					updatedAt: Date.now(),
					updatedBy: Meteor.userId(),
				}
			});

			Ols.Activity.insertActivityMessage({
				activityType: Ols.Activity.ACTIVITY_TYPE_ITEM_MOVED_TO_BOARD,
				item: item,
				boardId: fromBoardId, //The from board displays the "moved to board" activity item
				fromBoard: Boards.findOne(fromBoardId),
				toBoard: Boards.findOne(toBoardId)
			}, item);

			Ols.Activity.insertActivityMessage({
				activityType: Ols.Activity.ACTIVITY_TYPE_ITEM_MOVED_FROM_BOARD,
				item: item,
				boardId: toBoardId, //The to board displays the "moved from board" activity item
				fromBoard: Boards.findOne(fromBoardId),
				toBoard: Boards.findOne(toBoardId)
			}, item);

			var num = ServerMessages.update({itemId: itemId}, {$set: {boardId: toBoardId}}, {multi:true});
		},

		toggleItemOpenStatus: function(itemId) {
			check(itemId, String);

			var item = Items.findOne(itemId);

			var isOpen = !item.isOpen;

			Items.update(itemId, {
				$set: {isOpen: isOpen},
			});

			var item = Items.findOne(itemId);

			Ols.Activity.insertActivityMessage({
				activityType: isOpen?Ols.ACTIVITY_TYPE_ITEM_OPENED:Ols.ACTIVITY_TYPE_ITEM_CLOSED
			}, item);

			//update label counters
			_.each(item.labels, function(labelId) {
				if(item.isOpen) {
					Labels.update(labelId, {$inc: {numOpenMessages: 1, numClosedMessages: -1}});
				} else {
					Labels.update(labelId, {$inc: {numOpenMessages: -1, numClosedMessages: 1}});
				}
			});
		},

		insertFilter: function(newFilter) {
			var now = new Date().getTime();
			newFilter = _.extend({
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
			}, newFilter);
			return Filters.insert(newFilter);
		},

		detectMentionsInMessage: function(message) {
			console.log("> detectMentionsInMessage");
			var re = /@([\w\.-]+)/g;
			var matches;

			do {
				matches = re.exec(message.text);
				if (matches) {
					var toUser = Meteor.users.findOne({username: matches[1]});
					if(toUser != null) {
						console.log("MENTION DETECTED: " + JSON.stringify(toUser));

						var data = {
							type: 'new-message-mention',
							fromUserId: Meteor.userId(),
							fromUsername: Meteor.user().username,
							toUserId: toUser._id,
							messageId: message._id,
							messageText: message.text
						};
						//TODO: Once sessionForUsers is released, use it
						//Streamy.sessionsForUsers(toUser._id).emit('mention', data);
						Streamy.broadcast('mention', data);
					}
				}
			} while (matches);
			console.log("< detectMentionsInMessage");
		},

		updateUserWorkingOn: function(username, workingOn) {
			workingOn = workingOn.trim();
			Meteor.users.update({username: username}, {$set: {workingOn: workingOn}});
			var user = Meteor.users.findOne({username: username});
			console.log("updateUserWorkingOn: " + JSON.stringify(user, null, 4));
		},

		_getOldestBoardMessage: function(projectId, boardId) {
			return ServerMessages.findOne({boardId: boardId}, {sort: {DateTime: 1, limit: 1}});
		}

	});

	Meteor.publish("currentItem", function(itemId) {
		var items = Items.find({_id: itemId});
		return items;
	});

	Meteor.publish("items", function(opts) {
		console.log("publish items: " + JSON.stringify(opts));
		var filter = {};
		if(opts && opts.filter) {
			filter = _.extend(filter, opts.filter);
		}
		console.log("ITEM filter: " + JSON.stringify(filter));
		return Items.find(filter, {sort: {updatedAt: -1}});
	});

	Meteor.publish("articles", function(opts) {
		var filter = {};
		if(opts && opts.filter) {
			filter = _.extend(filter, opts.filter);
		}
		filter.type = 'article';
		return Items.find(filter, {sort: {updatedAt: -1}});
	});

	Meteor.publish("issues", function(opts) {
		var filter = {};
		if(opts && opts.filter) {
			filter = _.extend(filter, opts.filter);
		}
		filter.type = 'issue';
		return Items.find(filter, {sort: {updatedAt: -1}});
	});

	Meteor.publish("filters", function() {
		return Filters.find();
	});

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

} //isServer

// Override Meteor._debug to filter for custom msgs - as used
// by yuukan:streamy (https://goo.gl/4HQiKg)
Meteor._debug = (function (super_meteor_debug) {
	return function (error, info) {
		if (!(info && _.has(info, 'msg')))
		super_meteor_debug(error, info);
	}
})(Meteor._debug);
