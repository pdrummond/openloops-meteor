
OpenLoops = {};

const MESSAGE_AGE_HOURS_INCREMENT = 1;
const FILL_SCREEN_MSG_COUNT = 30;

var msgCountBeforePaging = 0;
var totalNewMessages = 0;
var initialising = true;

if(Meteor.isClient) {
	ClientMessages = new Meteor.Collection('client-messages');

	Meteor.startup(function() {
		Session.setDefault("messageAgeLimit", MESSAGE_AGE_HOURS_INCREMENT);
	});

	OpenLoops.scrollToBottomOfMessages = function() {
		$("#message-list").scrollTop($("#message-list")[0].scrollHeight);
	}

	OpenLoops.listenForIncomingMessages = function() {
		/*var incomingMessagesTs = new Date().getTime();
		Messages.find({createdBy: {$ne: Meteor.user().username }}).observeChanges({
			added: function (id, message) {
				if(!initialising && message.createdAt > incomingMessagesTs) {
					Session.set('numIncomingMessages', Session.get('numIncomingMessages')+1);
					console.log("New message - total is now " + Session.get('numIncomingMessages'));
				}
			}
		});*/
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
						var currentItemId = Session.get('currentItemId');
						var newMessage = {
							title: inputVal,
							createdAt: new Date().getTime(),
							createdBy: Meteor.user().username,
							itemId: currentItemId,
						};
						ClientMessages._collection.insert(newMessage);
						Meteor.call('sendMessage', newMessage, function(err, result) {
							if(err) {
								alert("error sending message");
							} else {

								$("#message-box").val('');
								OpenLoops.scrollToBottomOfMessages();
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
						$("#message-list").scrollTop(($(".user-message").outerHeight() * 20));
					}
				});
			}
		}, 300);
	}

	OpenLoops.moreMessagesOnServer = function() {
		var item = Items.findOne(Session.get('currentItemId'));
		if(item) {
			return ClientMessages._collection.find().fetch().length < item.numMessages;
		} else {
			return true;
		}
	}

	Template.feed.onCreated(function() {
		var self = this;
		Session.set('numIncomingMessages', 0);
		this.subscribe('items');
		OpenLoops.loadInitialMessages();
		/*this.autorun(function() {
			self.subscribe('messages', {
				messageAgeLimit: Session.get('messageAgeLimit'),
				itemId: Session.get('currentItemId')
			}, {
				onReady: function() {
					var numNewMessages = Messages.find().count() - msgCountBeforePaging;
					totalNewMessages = 0;
					if(initialising) {
						OpenLoops.scrollToBottomOfMessages();
						initialising = false;
						OpenLoops.listenForIncomingMessages();
					} else {
						$("#message-list").scrollTop(($(".user-message").outerHeight() * numNewMessages));
					}
				}
			});
		});*/

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

		'click #show-more-link': function() {
			OpenLoops.loadMoreMessages();
		}
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
				limit: 20,
				sort: {createdAt: -1}
			});
			return messages.fetch();
		},

		sendMessage: function(newMessage) {
			ServerMessages.insert(newMessage);
			Items.update(newMessage.itemId, {$inc: {numMessages: 1}});
		}
	});


	Meteor.publish("items", function() {
		return Items.find();
	});

	/*Meteor.publish("messages", function(opts) {
		console.log(">> messages publication. opts=" + JSON.stringify(opts));
		var messageAge = moment(new Date()).subtract({hours: opts.messageAgeLimit});
		var messageAgeTimestamp = messageAge.toDate().getTime();

		var messages = Messages.find({
			itemId: opts.itemId,
			createdAt: {$gte: messageAgeTimestamp}
		}, {
			sort: {createdAt: -1}
		});
		console.log("found " + messages.count() + " messages");
		console.log("<< messages publication");
		return messages;
	});*/

	Meteor.startup(function() {
		//loadSampleData();
	});

	function loadSampleData() {
		console.log(">> LOADING SAMPLE DATA");
		Items.remove({});
		var itemOneId = Items.insert({
			title: 'Item One',
			description: 'Item one description',
			createdAt: new Date().getTime(),
			createdBy: 'loopy',
			numMessages: 0
		});
		ServerMessages.remove({});
		var minutes = 1;
		for(var id=200; id>=1; id--) {
			ServerMessages.insert({
				title: 'Message ' + id,
				createdBy: 'loopy',
				createdAt: moment().subtract({minutes: minutes++}).toDate().getTime(),
				itemId: itemOneId
			});
			Items.update(itemOneId, {$inc: {numMessages: 1}});
		}
		var itemTwoId = Items.insert({
			title: 'Item Two',
			description: 'Item two description',
			createdAt: new Date().getTime(),
			createdBy: 'loopy',
			numMessages: 0
		});
		minutes = 1;
		var hours = 0;
		for(var id=10; id>=1; id--) {
			if(id == 5) {
				hours += 5;
			}
			ServerMessages.insert({
				title: 'Message ' + id,
				createdBy: 'loopy',
				createdAt: moment().subtract({hours: hours, minutes: minutes++}).toDate().getTime(),
				itemId: itemTwoId
			});
			Items.update(itemTwoId, {$inc: {numMessages: 1}});
		}
		console.log(">> SAMPLE DATA DONE");
	}
}
FlowRouter.route('/', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
	}
});

FlowRouter.route('/item/:itemId', {
	action: function(params, queryParams) {
		Session.set("messageAgeLimit", MESSAGE_AGE_HOURS_INCREMENT);
		msgCountBeforePaging = 0;
		totalNewMessages = 0;
		initialising = true;
		Session.set('currentItemId', params.itemId);
		Session.set('currentPage', 'feedPage');
	}
});

FlowRouter.route('/create', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'createPage')
	}
});
