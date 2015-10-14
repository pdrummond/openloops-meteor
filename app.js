
OpenLoops = {};

const MESSAGE_AGE_HOURS_INCREMENT = 1;
const FILL_SCREEN_MSG_COUNT = 30;

var msgCountBeforePaging = 0;
var totalNewMessages = 0;
var initialising = true;

if(Meteor.isClient) {

	Meteor.startup(function() {
		Session.setDefault("messageAgeLimit", MESSAGE_AGE_HOURS_INCREMENT);
	});

	OpenLoops.scrollToBottomOfMessages = function() {
		$("#message-list").scrollTop($("#message-list")[0].scrollHeight);
	}

	OpenLoops.listenForIncomingMessages = function() {
		var incomingMessagesTs = new Date().getTime();
		Messages.find({createdBy: {$ne: Meteor.user().username }}).observeChanges({
			added: function (id, message) {
				if(!initialising && message.createdAt > incomingMessagesTs) {
					Session.set('numIncomingMessages', Session.get('numIncomingMessages')+1);
					console.log("New message - total is now " + Session.get('numIncomingMessages'));
				}
			}
		});
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
						Messages.insert({
							title: inputVal,
							createdAt: new Date().getTime(),
							createdBy: Meteor.user().username,
							itemId: currentItemId,
						});
						Items.update(currentItemId, {$inc: {numMessages: 1}});

						$("#message-box").val('');
						OpenLoops.scrollToBottomOfMessages();
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

	Template.feed.onCreated(function() {
		var self = this;
		Session.set('numIncomingMessages', 0);
		this.subscribe('items');
		this.autorun(function() {
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
		});

	});

	Template.feed.helpers({
		messages: function() {
			return Messages.find({}, {sort: {createdAt: 1}});
		},

		numIncomingMessages: function() {
			return Session.get('numIncomingMessages');
		},

		hasIncomingMessages: function() {
			return Session.get('numIncomingMessages') > 0;
		}
	});

	Template.feed.events({
		'click #header-new-messages-toast': function() {
			Session.set("numIncomingMessages", 0);
			OpenLoops.scrollToBottomOfMessages();
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

	OpenLoops.loadMoreMessages = function() {
		//Meteor.setTimeout(function() {
		msgCountBeforePaging = Messages.find().count();
		Session.set("messageAgeLimit", Session.get("messageAgeLimit") + MESSAGE_AGE_HOURS_INCREMENT);
		//}, 1000);
	}

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
} //isClient

Items = new Meteor.Collection('items');
Messages = new Meteor.Collection('messages');

if(Meteor.isServer) {

	Meteor.publish("items", function() {
		return Items.find();
	});

	Meteor.publish("messages", function(opts) {
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
	});

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
		console.log("ITEM ONE ID: " + itemOneId);
		Messages.remove({});
		var minutes = 1;
		for(var id=200; id>=1; id--) {
			Messages.insert({
				title: 'Message ' + id,
				createdBy: 'loopy',
				createdAt: moment().subtract({minutes: minutes++}).toDate().getTime(),
				itemId: itemOneId
			});
			Items.update(itemOneId, {$inc: {numMessages: 1}});
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
