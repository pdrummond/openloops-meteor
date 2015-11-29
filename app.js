
OpenLoops = {};

if(Meteor.isClient) {
	Session.setDefault('leftSidebarActiveTab', 'discussTab');
	Session.setDefault('showSidebarTabs', true);
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
			var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
			Meteor.subscribe('items', filter, function(err, result) {
				if(err) {
					alert("Items Subscription error: " + err);
				}
			});
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
		var currentItemId = Session.get('currentItemId');
		var defaultAttrs = {
			type: Ols.MSG_TYPE_CHAT,
			createdAt: new Date().getTime(),
			createdBy: Meteor.user().username,
			projectId: Session.get('currentProjectId'),
			boardId: Session.get('currentBoardId'),
			itemId: currentItemId
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
			$itemMsgCount = $(".left-sidebar #home-item .new-messages")
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
			if(field == 'type') {
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

	Template.editItemForm.onCreated(function() {
		var template = this;
		template.isBusy = new ReactiveVar();
	});

	Template.editItemForm.onRendered(function() {
		//FIXME: Should not be using session here - use FlowRouter.param() instead.
		var createItemType = Session.get('createItemType');
		if(createItemType) {
			Session.set('editItemForm.selectedType', createItemType);
			this.$("#editItemForm select[name='type']").val(createItemType);
			Session.set('createItemType', null);
		} else {
			Session.set('editItemForm.selectedType', 'issue');
		}
		this.$('input[name="title"]').focus();
	});

	Template.editItemForm.helpers({

		formTitle: function() {
			var template = Template.instance();
			return (Session.get('currentItemId')?"Edit ":"Create ") + (Session.get('editItemForm.selectedType') || 'Issue');
		},

		isBusy: function() {
			 var template = Template.instance();
			 return template.isBusy.get();
		},

		currentItem: function() {
			return Items.findOne(Session.get('currentItemId'));
		},

		title: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.title:'';
		},

		description: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.description:'';
		},

		labels: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.labels:'';
		},

		isSelectedType: function(type) {
			var item = Items.findOne(Session.get('currentItemId'));
			if(item) {
				return type == item.type?'selected':'';
			} else {
				return '';
			}
		},

		selectedType: function() {
			return Session.get('editItemForm.selectedType');
		},

		isSelectedIssueType: function(issueType) {
			var item = Items.findOne(Session.get('currentItemId'));
			if(item) {
				return issueType == item.issueType?'selected':'';

			} else {
				return '';
			}
		},

		showIssueType: function() {
			var selectedType = Session.get('editItemForm.selectedType') || 'issue';
			return selectedType == 'issue'?'':'hide';
		}
	});

	Template.editItemForm.events({
		'change select[name="type"]': function() {
			Session.set('editItemForm.selectedType', $('select[name="type"]').val());
		},
		'click #cancel-button': function(e) {
			e.preventDefault();
			Ols.Router.showHomeMessages();
		},

		'click #save-button': function(e, template) {
			e.preventDefault();
			var currentItem = Items.findOne(Session.get('currentItemId'));
			var title = $("#editItemForm input[name='title']").val();
			if(title != null && title.length > 0) {
				template.isBusy.set(true);
				var description = $("#editItemForm textarea[name='description']").val();

				var labelList = [];
				var labels = $("#editItemForm input[name='labels']").val();
				if(labels != null && labels.length > 0) {
					labelList = labels.split(",");
				}

				var item = {
					title: title,
					description: description,
					type: $("#editItemForm select[name='type']").val(),
					issueType: $("#editItemForm select[name='issueType']").val(),
					labels: labelList
				};
				var currentItemId = Session.get('currentItemId');
				if(currentItemId == null) {
					item.projectId = Session.get('currentProjectId');
					item.boardId = Session.get('currentBoardId');
					Meteor.call('insertItem', item, function(err, newItem) {
						if(err) {
							alert("Error adding item: " + err);
						} else {
							OpenLoops.insertActivityMessage(newItem, {
								activityType: Ols.ACTIVITY_TYPE_NEW_ITEM
							});
							if(Ols.StringUtils.notEmpty(newItem.description)) {
								OpenLoops.insertActivityMessage(newItem, {
									activityType: Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED
								});
							}
							Ols.Router.showItemMessages(newItem);
						}
					});

				} else {
					Meteor.call('updateItem', currentItemId, item, function(err, newItem) {
						if(err) {
							alert("Error editing item: " + err);
						} else {
							if(currentItem.title != newItem.title) {
								OpenLoops.insertActivityMessage(newItem, {
									activityType: Ols.ACTIVITY_TYPE_ITEM_TITLE_CHANGED,
								});
							}
							if(currentItem.description != newItem.description) {
								OpenLoops.insertActivityMessage(newItem, {
									activityType: Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED
								});
							}
							Ols.Router.showItemMessages(newItem);
						}
					});
				}
			}
		}
	});

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
		'click #create-link': function() {
			Ols.Router.showCreateItemPage();
		},

		'click .board-title': function() {
			$("#board-chooser-menu").slideToggle();
		},

		'keyup #search-input': function() {
			OpenLoops.onSearchInput();
		},

		'click #all-link': function() {
			Session.set('filterQuery', '');
		},

		'click #issues-link': function() {
			Session.set('filterQuery', 'type:issue');
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

		'click #closed-link': function() {
			Session.set('filterQuery', 'closed:true');
		}
	});

	Template.topBanner.helpers({

		filterLinkActiveClass: function(filterLink) {
			var active = false;
			var query = Session.get('filterQuery');
			switch (filterLink) {
				case 'all-link':
				active = query == null || query == '';
				break;
				case 'issues-link':
				active = query == 'type:issue';
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
			return Ols.User.getProfileImageUrl(this.createdBy);
		},

		activityMessage: function() {
			if(this.itemId) {
				var currentBoardId = Session.get('currentBoardId');
				var currentItemId = Session.get('currentItemId');
				var item = Items.findOne(this.itemId);
				var itemTitleLink = '<span id="item-link"><a class="item-link" href="' +
					'/project/' + Session.get('currentProjectId') +
					(currentBoardId?'/board/' + currentBoardId:'') +
					'/item/' + this.itemId + '">' + Ols.Item.getItemKey({item: item}) + ': ' + Ols.StringUtils.truncate(item.title, 50)
					+ '</a></span>';

				var ctx = currentItemId?'this item':itemTitleLink;
				var msg = '???';
				switch(this.activityType) {
					case Ols.ACTIVITY_TYPE_NEW_ITEM:
					msg = 'created ' + ctx;
					break;
					case Ols.ACTIVITY_TYPE_ITEM_TYPE_CHANGE:
					msg = ('changed ' + ctx + ' to ' + OpenLoops.getItemTypePhrase(this.itemType, this.issueType));
					break;
					case Ols.ACTIVITY_TYPE_ITEM_OPENED:
					msg = "re-opened " + ctx;
					break;
					case Ols.ACTIVITY_TYPE_ITEM_CLOSED:
					msg = "closed " + ctx;
					break;
					case Ols.ACTIVITY_TYPE_ITEM_MOVED_TO:
					var toBoard = Boards.findOne(this.toBoardId);
					msg = 'moved ' + ctx + ' to <a href="/project/' + Session.get('currentProjectId') + '/board/' + this.toBoardId + '" class="board-link">' + toBoard.title + '</a>';
					break;
					case Ols.ACTIVITY_TYPE_ITEM_MOVED_FROM:
					var fromBoard = Boards.findOne(this.fromBoardId);
					msg = 'moved ' + ctx + ' here from <a href="/' + Session.get('currentProjectId') + '/board/' + this.fromBoardId + '" class="board-link">' + fromBoard.title + '</a>';
					break;
					case Ols.ACTIVITY_TYPE_ITEM_TITLE_CHANGED:
						msg = "changed title of item to " + itemTitleLink;
					case Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED:
						var itemCtx = currentItemId?"of this item to:":"of " + ctx + " to:";
						msg = "Set the description " + itemCtx;
					break;
				}
			} else {
				switch(this.activityType) {
					case Ols.ACTIVITY_TYPE_NEW_BOARD:
					msg = 'created <span class="board-link">' + Boards.findOne(this.boardId).title + '</span>';
					break;
				}
			}
			return msg;
		},

		activityContent: function() {
			var activityContent = "";
			var item = Items.findOne(this.itemId);
			switch(this.activityType) {
				case Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED:
					activityContent = this.item?this.item.description:'ERR: Something went wrong. Cannot find item description';
					break;
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
		boardTitle: function() {
			var board = Boards.findOne(this.boardId);
			return board?board.title:'';
		},

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

	OpenLoops.insertActivityMessage = function(item, activityMessage) {
		activityMessage = _.extend({
			type: Ols.MSG_TYPE_ACTIVITY,
			itemType: item.type,
			boardId: item.boardId,
			itemId: item._id,
			item: item
		}, activityMessage);
		activityMessage = OpenLoops.insertClientMessage(activityMessage);
		Meteor.call('saveMessage', activityMessage);
		Streamy.broadcast('sendMessage', activityMessage);
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

	Template.feed.helpers({

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

		leftSidebarActiveTab: function() {
			return Session.get('leftSidebarActiveTab');
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

	Template.rightSidebar.events({
		'click #create-discussion-link': function() {
			Ols.Router.showCreateItemPage({type:'discussion'});
		},

		'click #create-issue-link': function() {
			Ols.Router.showCreateItemPage({type:'issue'});
		},

		'click #create-article-link': function() {
			Ols.Router.showCreateItemPage({type:'article'});
		},

		'click #edit-link': function() {
			Ols.Router.showEditItemPage(Session.get('currentItemId'));
		},

		'click #open-close-link': function() {
			Meteor.call('toggleItemOpenStatus', Session.get('currentItemId'), function(err, result) {
				if(err) {
					alert("Error toggling item status: " + err.reason);
				} else {
					var item = Items.findOne(Session.get('currentItemId'));
					var activityType = item.isOpen?Ols.ACTIVITY_TYPE_ITEM_OPENED:Ols.ACTIVITY_TYPE_ITEM_CLOSED;
					var activityMessage = {
						activityType: activityType,
						itemTitle: item.title,
						itemType: item.type,
						issueType: item.issueType,
						boardId: item.boardId,
						itemId: item._id
					};
					OpenLoops.insertActivityMessage(item, activityMessage);
					Ols.HistoryManager.scrollBottom();
				}
			});
		},

		'click #move-link': function() {
			$("#move-to-board-list").slideToggle();
		}
	});

	Template.leftSidebar.helpers({
		items: function() {
			var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
			filter.projectId = Session.get('currentProjectId');
			var currentBoardId = Session.get('currentBoardId');
			if(currentBoardId) {
				filter.boardId = currentBoardId;
			}

			if(filter.hasOwnProperty('show')) {
				if(filter.show == 'all') {
					delete filter.isOpen;
					delete filter.show;
				}
			}
			return Items.find(filter, {sort: {updatedAt: -1}});
		},

		filters: function() {
			return Filters.find({boardId: Session.get('currentBoardId')});
		},

		activeListLabel: function() {
			var label = "Inbox";
			var activeFilterLabel = Session.get('activeFilterLabel');
			if(activeFilterLabel) {
				label = activeFilterLabel;
			}
			return label;
		},

		isBoardItemActive: function() {
			return Session.get('currentItemId')?'':'active';
		},

		isActiveTab: function(tabName) {
			return tabName == Session.get('leftSidebarActiveTab') ? 'active' : '';
		},

		isActiveTabBody: function(tabName) {
			return tabName == Session.get('leftSidebarActiveTab') ? '' : 'hide';
		},

		showSidebarTabs: function() {
			return Session.get('showSidebarTabs');
		},
	});

	Template.leftSidebar.events({
		'click #home-item': function() {
			Ols.Router.showHomeMessages();
		},

		'click #search-link': function() {
			Session.set('showSidebarTabs', false);
		},

		'click #discuss-tab': function() {
			Session.set('leftSidebarActiveTab', 'discussTab');
		},

		'click #manage-tab': function() {
			Session.set('leftSidebarActiveTab', 'manageTab');
		},

		'click #read-tab': function() {
			Session.set('leftSidebarActiveTab', 'readTab');
		},

		'click #back-arrow-link': function() {
			Session.set('showSidebarTabs', true);
			Session.set('filterQuery', null);
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

	Template.boardChooserMenu.events({
		'click #all-boards-item': function() {
			$("#board-chooser-menu").slideUp();
			FlowRouter.go("/project/" + Session.get('currentProjectId'));
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
					alert('Error moving item: ' + err.reason);
				} else {
					OpenLoops.insertActivityMessage(item, {
						boardId: Session.get('currentBoardId'),
						activityType: Ols.ACTIVITY_TYPE_ITEM_MOVED_TO,
						toBoardId: self._id,
					});
					OpenLoops.insertActivityMessage(item, {
						boardId: self._id,
						activityType: Ols.ACTIVITY_TYPE_ITEM_MOVED_FROM,
						fromBoardId: Session.get('currentBoardId'),
					});

				}
			});
			FlowRouter.go("/project/" + Session.get('currentProjectId') + "/board/" + Session.get('currentBoardId'));
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
			var canShow = false;
			var user = Meteor.user();
			if(user) {
				var email = user.emails[0].address;
				var teamMember = TeamMembers.findOne({email: email});
				canShow = teamMember.role == Ols.ROLE_ADMIN;
			}
			return canShow;
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
			ServerMessages.insert(newMessage);

			Items.update(newMessage.itemId, {
				$inc: {numMessages: 1},
				$set: {updatedAt: new Date().getTime()},
			});
			Boards.update(newMessage.boardId, {$inc: {numMessages: 1}});
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
			}, newItem);

			var newItemId = Items.insert(newItem);
			//Meteor._sleepForMs(2000);
			return _.extend(newItem, {_id: newItemId});
		},

		updateItem: function(itemId, attrs) {
			console.log("> updateItem: " + JSON.stringify(attrs));
			var item = Items.findOne(itemId);
			Items.update(itemId, {$set: attrs});
			return Items.findOne(itemId);
		},

		moveItem: function(itemId, toBoardId) {
			console.log("MOVE ITEM");
			var item = Items.findOne(itemId);

			Items.update(itemId, {
				$set: {
					boardId: toBoardId,
					updatedAt: Date.now(),
					updatedBy: Meteor.userId(),
				}
			});
			var i = ServerMessages.find({itemId: itemId}).count();
			console.log("i=" + i);
			var num = ServerMessages.update({itemId: itemId}, {$set: {boardId: toBoardId}}, {multi:true});
			console.log("MOVED " + num + " MESSAGES");
		},

		toggleItemOpenStatus: function(itemId) {
			var item = Items.findOne(itemId);

			Items.update(itemId, {
				$set: {isOpen: !item.isOpen},
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
			console.log("detectMentionsInMessage");
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
		},

		_getOldestBoardMessage: function() {
			return ServerMessages.findOne({}, {sort: {DateTime: 1, limit: 1}});
		}

	});

	Meteor.publish("items", function(opts) {
		var filter = {};
		if(opts && opts.filter) {
			filter = _.extend(filter, opts.filter);
		}
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
		}});
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
