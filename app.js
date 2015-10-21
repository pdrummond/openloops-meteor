
OpenLoops = {};

const ITEM_TYPE_DISCUSSION = 'discussion';
const ITEM_TYPE_ISSUE = 'issue';
const ITEM_TYPE_ARTICLE = 'article';

const MSG_TYPE_CHAT = 'MSG_TYPE_CHAT';
const MSG_TYPE_ITEM = 'MSG_TYPE_ITEM';

const MESSAGE_PAGE_SIZE = 20;
const MESSAGE_AGE_HOURS_INCREMENT = 1;
const FILL_SCREEN_MSG_COUNT = 30;

if(Meteor.isClient) {
	ClientMessages = new Meteor.Collection('client-messages');

	Meteor.startup(function() {
		Streamy.on('sendMessage', function(incomingMessage) {
			if(incomingMessage.createdBy != Meteor.user().username) {
				OpenLoops.insertClientMessage(incomingMessage);
				if(OpenLoops.atBottom) {
					OpenLoops.scrollToBottomOfMessages();
				} else if(incomingMessage.itemId == Session.get('currentItemId')) {
					Session.set('numIncomingMessages', Session.get('numIncomingMessages')+1);
				}

				if(incomingMessage.itemId != Session.get('currentItemId')) {
					$(".left-sidebar #item-list li[data-id='" + incomingMessage.itemId + "'] #item-msg-count").addClass("new-messages");
				}

			} else {
				OpenLoops.scrollToBottomOfMessages();
			}
		});
	});

	OpenLoops.removeSidebarNewMessages = function(itemId) {
		if(itemId) {
			$(".left-sidebar #item-list li[data-id='" + itemId + "'] #item-msg-count").removeClass("new-messages");
		} else {
			$(".left-sidebar #item-list li .new-messages").removeClass("new-messages");
		}
	}

	OpenLoops.scrollToBottomOfMessages = function() {
		$("#message-list").scrollTop($("#message-list")[0].scrollHeight);
	}

	OpenLoops.insertClientMessage = function(attrs) {
		var currentItemId = Session.get('currentItemId');
		var defaultAttrs = {
			type: MSG_TYPE_CHAT,
			createdAt: new Date().getTime(),
			createdBy: Meteor.user().username,
			itemId: currentItemId,
		};
		var newMessage = _.extend(defaultAttrs, attrs);
		var newMessageId = ClientMessages._collection.insert(newMessage);
		newMessage._id = newMessageId;
		return newMessage;
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

	Template.createForm.events({
		'click #create-button': function(e) {
			e.preventDefault();
			var title = $("#createForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var description = $("#createForm textarea[name='description']").val();
				Meteor.call('insertItem', {
					title: title,
					description: description,
					type: $("#createForm select[name='type']").val()
				});
				FlowRouter.go("/");
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
					title: title,
					query: query
				});
				FlowRouter.go("/");
			}
		}
	});

	Template.messageBox.events({
		'keypress #message-box': function(e) {
			var inputVal = $('#message-box').val();
			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			if(charCode == 13 && (inputVal == null || inputVal.length == 0)) {
				e.preventDefault();
				e.stopPropagation();
			} else {
				if (charCode == 13 && e.shiftKey == false) {
					e.preventDefault();
					e.stopPropagation();
					if(inputVal.length > 0) {
						var newMessage = OpenLoops.insertClientMessage({title:inputVal});
						Meteor.call('saveMessage', newMessage, function(err, result) {
							if(err) {
								alert("error sending message");
							} else {
								$("#message-box").val('');
								OpenLoops.scrollToBottomOfMessages();
								Streamy.broadcast('sendMessage', newMessage);
							}
						});
					}
				}
			}
		}
	});

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
				case MSG_TYPE_CHAT: t = 'userMessageItemView'; break;
				case MSG_TYPE_ITEM: t = 'itemMessageItemView'; break;
			}
			return t;
		}
	});

	Template.userMessageItemView.helpers({

		itemTitle: function() {
			return Items.findOne(this.itemId).title;
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

		isActive: function() {
			return this._id == Session.get('currentItemId')?'active':'';
		}
	});

	Template.itemMessageItemView.helpers({

		itemTitle: function() {
			return Items.findOne(this.itemId).title;
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
		switch(item.type) {
			case ITEM_TYPE_DISCUSSION: icon = 'fa-comments-o'; break;
			case ITEM_TYPE_ISSUE: icon = 'fa-exclamation-circle'; break;
			case ITEM_TYPE_ARTICLE: icon = 'fa-book'; break;
		}
		return icon;
	},

	OpenLoops.getItemTypeIconColor = function(item) {
		var color = '#ccc';
		switch(item.type) {
			case ITEM_TYPE_DISCUSSION: color = '#90BEF2'; break;
			case ITEM_TYPE_ISSUE: color = '#6cc644'; break;
			case ITEM_TYPE_ARTICLE: color = 'orange'; break;
		}
		return color;
	}

	OpenLoops.getOldestClientMessageDate = function() {
		var date;
		var filter = {};
		var currentItemId = Session.get('currentItemId');
		if(currentItemId) {
			filter.itemId = currentItemId;
		}
		var existingMessages = ClientMessages.find(filter, {sort:{createdAt:1}}).fetch();
		if(existingMessages.length > 0) {
			date = existingMessages[0].createdAt;
		}
		return date;
	}

	OpenLoops.loadMessages = function(callback) {
		var olderThanDate = OpenLoops.getOldestClientMessageDate();
		Meteor.call('loadMessages', {
			olderThanDate: olderThanDate,
			itemId: Session.get('currentItemId')
		}, function(err, messages) {
			if(err) {
				alert("Error loading messages");
				callback(false);
			} else {
				_.each(messages, function(message) {
					ClientMessages._collection.insert(message);
				});
				callback(true);
			}
		});
	}

	OpenLoops.loadInitialMessages = function() {
		OpenLoops.loadMessages(function(ok) {
			if(ok) {
				OpenLoops.scrollToBottomOfMessages();
			}
		});
	}

	OpenLoops.loadMoreMessages = function() {
		Meteor.setTimeout(function() {
			if(OpenLoops.moreMessagesOnServer()) {
				OpenLoops.loadMessages(function(ok) {
					if(ok) {
						$("#message-list").scrollTop(($(".user-message").outerHeight() * MESSAGE_PAGE_SIZE));
					}
				});
			}
		}, 500);
	}

	OpenLoops.moreMessagesOnServer = function() {
		var result = true;
		var currentItemId = Session.get('currentItemId');
		var serverMsgCount = (currentItemId?Items.findOne(currentItemId).numMessages:Boards.find({}).fetch()[0].numMessages);
		var clientMsgCount = ClientMessages._collection.find().fetch().length;
		result = (clientMsgCount < serverMsgCount);
		console.log("clientMsgCount: " + clientMsgCount);
		console.log("serverMsgCount: " + serverMsgCount);
		return result;
	}

	Template.feed.onCreated(function() {
		var self = this;
		/*Session.set('numIncomingMessages', 0);
		Meteor.subscribe('items');
		OpenLoops.loadInitialMessages();*/
	});

	Template.feed.helpers({
		messages: function() {
			var filter = {};
			var currentItemId = Session.get('currentItemId');
			if(currentItemId) {
				filter.itemId = currentItemId;
			}
			return ClientMessages.find(filter, {sort: {createdAt: 1}});
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

		numIncomingMessages: function() {
			return Session.get('numIncomingMessages');
		},

		hasIncomingMessages: function() {
			return Session.get('numIncomingMessages') > 0;
		},

		moreMessagesOnServer: function() {
			return OpenLoops.moreMessagesOnServer();
		},

		isTeamFeed: function() {
			return !Session.get('currentItemId');
		},

		currentItemIcon: function() {
			return OpenLoops.getItemTypeIcon(Items.findOne(Session.get('currentItemId')));
		},

		currentItemIconColor: function() {
			return OpenLoops.getItemTypeIconColor(Items.findOne(Session.get('currentItemId')));
		},

		currentItemType: function() {
			return Items.findOne(Session.get('currentItemId')).type;
		},

		openStatus: function() {
			return Items.findOne(Session.get('currentItemId')).isOpen?'open':'closed';
		}
	});

	Template.feed.events({
		'click #header-new-messages-toast': function() {
			Session.set("numIncomingMessages", 0);
			OpenLoops.scrollToBottomOfMessages();
		},

		'click #open-status-link': function() {
			Meteor.call('toggleItemOpenStatus', Session.get('currentItemId'));
		}
	});

	Template.leftSidebar.onCreated(function() {
		var self = this;
		this.autorun(function() {
			self.subscribe('items', {
				filter: OpenLoops.getFilterQuery(Session.get('filterQuery'))
			}, function(err, result) {
				if(err) {
					alert("Items Subscription error: " + err);
				}
			});
		});
	});

	Template.leftSidebar.helpers({
		items: function() {
			return Items.find({isOpen: true}, {sort: {updatedAt: -1}});
		},

		filters: function() {
			return Filters.find();
		},

		activeListLabel: function() {
			var label = "Inbox";
			var activeFilterLabel = Session.get('activeFilterLabel');
			if(activeFilterLabel) {
				label = activeFilterLabel;
			}
			return label;
		}
	});

	Template.leftSidebar.events({
		'click #inbox-menu-item': function() {
			Session.set('filterQuery', null);
			Session.set('activeFilterLabel', 'Inbox');
			$("#list-menu").slideUp();
		},

		'click #active-list': function() {
			$("#list-menu").slideToggle();
		}
	});

	Template.filterItem.events({
		'click': function() {
			Session.set('filterQuery', this.query);
			Session.set('activeFilterLabel', this.title);
			$("#list-menu").slideUp();
		}
	});

	Template.app.onRendered(function() {
		$("#message-list").scroll(checkScroll);
	});

	function checkScroll() {
		console.log("message-list scrollTop: " + ($("#message-list").scrollTop() + $("#message-list").outerHeight()));
		console.log("message-list scrollTop2: " + ($("#message-list").scrollTop() + $("#message-list").height()));
		console.log("message list height: " + $("#message-list")[0].scrollHeight);
		if($("#message-list").scrollTop() == 0) {
			OpenLoops.loadMoreMessages();
		}
		OpenLoops.atBottom = $("#message-list")[0].scrollHeight == ($("#message-list").scrollTop() + $("#message-list").height());
		console.log("atBottom: " + OpenLoops.atBottom);
	}

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});

} //isClient

Boards = new Meteor.Collection("boards");
Items = new Meteor.Collection('items');
Filters = new Meteor.Collection('filters');

if(Meteor.isServer) {

	ServerMessages = new Meteor.Collection('server-messages');

	Meteor.methods({
		loadMessages: function(opts) {
			var filter = {};
			if(opts.itemId) {
				filter.itemId = opts.itemId;
			}
			if(opts.olderThanDate) {
				filter.createdAt = {$lt: opts.olderThanDate};
			}
			console.log("SERVER FILTER: " + JSON.stringify(filter));
			var messages = ServerMessages.find(filter, {
				limit: MESSAGE_PAGE_SIZE,
				sort: {createdAt: -1}
			});
			return messages.fetch();
		},

		saveMessage: function(newMessage) {
			ServerMessages.insert(newMessage);
			Items.update(newMessage.itemId, {
				$inc: {numMessages: 1},
				$set: {updatedAt: new Date().getTime()},
			});

			//detectMentionsInMessage(newMessage);

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
				type: MSG_TYPE_ITEM,
				itemType: newItem.type,
				title: newItem.description,
				itemId: newItemId

			});
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
				updatedAt: now
			}, newFilter);
			return Filters.insert(newFilter);
		},

		//TODO Implement this using Streamy
		/*detectMentionsInMessage: function(message) {

			/*var re = /@([\w\.-]+)/g;
			var matches;

			do {
				matches = re.exec(message.title);
				if (matches) {
					var toUser = Meteor.users.findOne({username: matches[1]});
					if(toUser != null) {
						Streamy.broadcast('mention', {
							type: 'new-message-mention',
							fromUserId: Meteor.userId(),
							toUserId: toUser._id,
							messageId: messageId
						});
					}
				}
			} while (matches);*
		}*/
	});

	Meteor.publish("boards", function() {
		return Boards.find();
	});

	Meteor.publish("items", function(opts) {
		var filter = {};
		if(opts && opts.filter) {
			filter = _.extend(filter, opts.filter);
		}
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
