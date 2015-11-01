
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

		Tracker.autorun(function() {
			var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
			Meteor.subscribe('items', filter, function(err, result) {
				if(err) {
					alert("Items Subscription error: " + err);
				}
			});
		});

		Streamy.on('mention', function(data) {
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

	OpenLoops.onSearchInput = function() {
		var self = this;
		if(this.searchInputKeyTimer) {
			console.log("CANCELLED KEY TIMER");
			clearTimeout(this.searchInputKeyTimer);
		}
		this.searchInputKeyTimer = setTimeout(function() {
			Session.set('filterQuery', $('#search-input').val());
		}, 500);
	}

	OpenLoops.removeSidebarNewMessages = function(itemId) {
		if(itemId) {
			$(".left-sidebar .item-list li[data-id='" + itemId + "'] .item-msg-count").removeClass("new-messages");
		} else {
			$(".left-sidebar .item-list li .new-messages").removeClass("new-messages");
		}
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
				field = 'issueType';
			} else if(field == 'label') {
				field = 'labels';
			} else if(field == 'open') {
				field = "isOpen";
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

	Template.editItemForm.onRendered(function() {
		this.$('input[name="title"]').focus();
	});

	Template.editItemForm.helpers({
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
		'click #save-button': function(e) {
			e.preventDefault();
			var title = $("#editItemForm input[name='title']").val();
			if(title != null && title.length > 0) {
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
					item.boardId = Session.get('currentBoardId');
					Meteor.call('insertItem', item, function(err, result) {
						if(err) {
							alert("Error adding item: " + err);
						} else {
							FlowRouter.go("/board/" + Session.get('currentBoardId') + "/item/" + result._id);
						}
					});
				} else {
					Meteor.call('updateItem', currentItemId, item, function(err, result) {
						if(err) {
							alert("Error editing item: " + err);
						} else {
							FlowRouter.go("/board/" + Session.get('currentBoardId') + "/item/" + result._id);
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
				FlowRouter.go("/board/" + Session.get('currentBoardId'));
			}
		}
	});


	Template.app.events({
		'click #logout-link': function() {
			Meteor.logout();
			FlowRouter.go("/");
		}
	})

	Template.app.helpers({
		currentPage: function() {
			return Session.get('currentPage');
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
				case Ols.MSG_TYPE_CHAT: t = 'userMessageItemView'; break;
				case Ols.MSG_TYPE_ITEM: t = 'itemMessageItemView'; break;
			}
			return t;
		}
	});

	Template.userMessageItemView.helpers({

		itemTitle: function() {
			var item = Items.findOne(this.itemId);
			return item ? 'in ' + item.title:'';
		},

		showItemLink: function() {
			return Session.get('currentItemId')?'hide':'';
		},

		messageDate: function() {
			return moment(this.createdAt).date();
		}
	});

	Template.itemItemView.helpers({
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

	Template.itemMessageItemView.helpers({

		itemTitle: function() {
			var item = Items.findOne(this.itemId);
			return item?item.title:'';
		},

		itemTypeIcon: function() {
			return OpenLoops.getItemTypeIcon(Items.findOne(this.itemId));
		},

		itemTypeIconColor: function() {
			return OpenLoops.getItemTypeIconColor(Items.findOne(this.itemId));
		},

		showItemLink: function() {
			return Session.get('currentItemId')?'hide':'';
		},

		messageDate: function() {
			return moment(this.createdAt).date();
		}
	});

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
		}
	});

	Template.feed.events({
		'click #header-new-messages-toast': function() {
			Session.set("numIncomingMessages", 0);
			Ols.HistoryManager.scrollBottom();
		},

		'click #item-board-link': function() {
			$("#move-to-board-list").slideToggle();
		}
	});

	Template.rightSidebar.events({
		'click #open-close-link': function() {
			Meteor.call('toggleItemOpenStatus', Session.get('currentItemId'));
		},
	});



	Template.leftSidebar.helpers({
		items: function() {
			var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
			filter.boardId = Session.get('currentBoardId');			
			if(!filter.hasOwnProperty('isOpen')) {
				filter.isOpen = true;
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

		isActiveTab: function(tabName) {
			return tabName == Session.get('leftSidebarActiveTab') ? 'active' : '';
		},

		isActiveTabBody: function(tabName) {
			return tabName == Session.get('leftSidebarActiveTab') ? '' : 'hide';
		},

		showSidebarTabs: function() {
			return Session.get('showSidebarTabs');
		}
	});

	Template.leftSidebar.events({
		'keyup #search-input': function() {
			OpenLoops.onSearchInput();
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

	Template.moveToBoardList.helpers({
		boards: function() {
			return Boards.find({_id: {$ne: Session.get('currentBoardId')}});
		}
	});

	Template.moveToBoardItem.events({
		'click': function() {
			$("#move-to-board-list").slideUp();
			Meteor.call('moveItem', Session.get('currentItemId'), this._id);
			FlowRouter.go("/board/" + Session.get('currentBoardId'));
		}
	});

} //isClient

Items = new Meteor.Collection('items');
Filters = new Meteor.Collection('filters');

if(Meteor.isServer) {

	Meteor.methods({
		insertItem: function(newItem) {
			console.log("insertItem - boardId:" + newItem.boardId);
			var now = new Date().getTime();
			newItem = _.extend({
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
				isOpen: true,
				numMessages: 0,
			}, newItem);

			var newItemId = Items.insert(newItem);
			Meteor.call('insertMessage', {
				type: Ols.MSG_TYPE_ITEM,
				itemType: newItem.type,
				text: newItem.description,
				boardId: newItem.boardId,
				itemId: newItemId
			});

			return _.extend(newItem, {_id: newItemId});
		},

		updateItem: function(itemId, item) {
			console.log("> updateItem");
			Items.update(itemId, {$set: item});
			var descMessage = ServerMessages.findOne({itemId: itemId, type: Ols.MSG_TYPE_ITEM});
			console.log("descMessage: " + descMessage.title);
			console.log("item new description:" + item.description);
			ServerMessages.update(descMessage._id, {$set: {text: item.description}});
			return _.extend(item, {_id: itemId});
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

} //isServer

// Override Meteor._debug to filter for custom msgs - as used
// by yuukan:streamy (https://goo.gl/4HQiKg)
Meteor._debug = (function (super_meteor_debug) {
  return function (error, info) {
    if (!(info && _.has(info, 'msg')))
      super_meteor_debug(error, info);
  }
})(Meteor._debug);
