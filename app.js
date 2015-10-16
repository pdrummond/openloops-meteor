
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
			} else {
				OpenLoops.scrollToBottomOfMessages();
			}
		});
	});

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

	Template.itemMessageItemView.helpers({

		itemTitle: function() {
			return Items.findOne(this.itemId).title;
		},

		itemTypeIcon: function() {
			var icon = 'fa-square';
			switch(Items.findOne(this.itemId).type) {
				case ITEM_TYPE_DISCUSSION: icon = 'fa-comments-o'; break;
				case ITEM_TYPE_ISSUE: icon = 'fa-exclamation-circle'; break;
				case ITEM_TYPE_ARTICLE: icon = 'fa-book'; break;
			}
			return icon;
		},

		showItemLink: function() {
			return Session.get('currentItemId')?'hide':'';
		},

		messageDate: function() {
			return moment(this.createdAt).date();
		}
	});

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
			itemId: Session.get('currentItemId'),
			type: Session.get('currentTypeFilter'),
			itemType: Session.get('currentItemTypeFilter'),
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
			var currentTypeFilter = Session.get('currentTypeFilter');
			if(currentTypeFilter) {
				filter.type = currentTypeFilter;
			}
			var currentItemTypeFilter = Session.get('currentItemTypeFilter');
			if(currentItemTypeFilter) {
				filter.itemType = currentItemTypeFilter;
			}
			return ClientMessages.find(filter, {sort: {createdAt: 1}});
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
		}
	});

	Template.feed.events({
		'click #header-new-messages-toast': function() {
			Session.set("numIncomingMessages", 0);
			OpenLoops.scrollToBottomOfMessages();
		},
	});

	Template.leftSidebar.helpers({
		items: function() {
			return Items.find();
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
			if(opts.type) {
				filter.type = opts.type;
			}
			if(opts.itemType) {
				filter.itemType = opts.itemType;
			}
			var messages = ServerMessages.find(filter, {
				limit: MESSAGE_PAGE_SIZE,
				sort: {createdAt: -1}
			});
			return messages.fetch();
		},

		saveMessage: function(newMessage) {
			ServerMessages.insert(newMessage);
			Items.update(newMessage.itemId, {$inc: {numMessages: 1}});
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
			console.log("INSERT ITEM");
			newItem = _.extend({
				createdAt: new Date().getTime(),
				createdBy: Meteor.user().username,
				numMessages: 0,
			}, newItem);

			var newItemId = Items.insert(newItem);
			Meteor.call('insertMessage', {
				type: MSG_TYPE_ITEM,
				itemType: newItem.type,
				title: newItem.description,
				itemId: newItemId

			});
		}
	});

	Meteor.publish("boards", function() {
		return Boards.find();
	});

	Meteor.publish("items", function() {
		return Items.find();
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
