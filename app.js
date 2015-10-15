
OpenLoops = {};

const MESSAGE_PAGE_SIZE = 20;
const MESSAGE_AGE_HOURS_INCREMENT = 1;
const FILL_SCREEN_MSG_COUNT = 30;

if(Meteor.isClient) {
	ClientMessages = new Meteor.Collection('client-messages');

	Meteor.startup(function() {
		Streamy.on('sendMessage', function(incomingMessage) {
			if(incomingMessage.createdBy != Meteor.user().username) {
				OpenLoops.insertClientMessage(incomingMessage);
				Session.set('numIncomingMessages', Session.get('numIncomingMessages')+1);
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

				Items.insert({
					title: title,
					description: description,
					createdAt: new Date().getTime(),
					createdBy: Meteor.user().username,
					numMessages: 0
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

	OpenLoops.loadMessages = function(callback) {
		var olderThanDate;
		var existingMessages = ClientMessages.find({}, {sort:{createdAt:1}}).fetch();
		if(existingMessages.length > 0) {
			olderThanDate = existingMessages[0].createdAt;
		}

		Meteor.call('loadMessages', {
			olderThanDate: olderThanDate,
			itemId: Session.get('currentItemId')
		}, function(err, messages) {
			if(err) {
				alert("Error loading messages");
				callback(false);
			} else {
				console.log("BOOM!!!");
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
		}, 1000);
	}

	OpenLoops.moreMessagesOnServer = function() {
		var result = true;
		var item = Items.findOne(Session.get('currentItemId'));
		if(item) {
			var clientMsgCount = ClientMessages._collection.find().fetch().length;
			var serverMsgCount = item.numMessages;
			result = (clientMsgCount < serverMsgCount);
			console.log("clientMsgCount: " + clientMsgCount);
			console.log("serverMsgCount: " + serverMsgCount);
		}
		return result
	}

	Template.feed.onCreated(function() {
		var self = this;
		Session.set('numIncomingMessages', 0);
		this.subscribe('items');
		OpenLoops.loadInitialMessages();
	});

	Template.feed.helpers({
		messages: function() {
			return ClientMessages.find({}, {sort: {createdAt: 1}});
		},

		numIncomingMessages: function() {
			return Session.get('numIncomingMessages');
		},

		hasIncomingMessages: function() {
			return Session.get('numIncomingMessages') > 0;
		},

		moreMessagesOnServer: function() {
			return OpenLoops.moreMessagesOnServer();
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
		$("#message-list").scroll(showMoreVisible);
	});

	function showMoreVisible() {
		console.log("message-list scrollTop: " + $("#message-list").scrollTop());
		if($("#message-list").scrollTop() == 0) {
			OpenLoops.loadMoreMessages();
		}
	}

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});

} //isClient

Items = new Meteor.Collection('items');

if(Meteor.isServer) {

	ServerMessages = new Meteor.Collection('server-messages');

	Meteor.methods({
		loadMessages: function(opts) {
			var filter = {itemId: opts.itemId};
			if(opts.olderThanDate) {
				filter.createdAt = {$lt: opts.olderThanDate};
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
		}
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
