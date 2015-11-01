if(Meteor.isClient) {

	Streamy.on('sendMessage', function(incomingMessage) {
		if(incomingMessage.createdBy != Meteor.user().username) {
			Ols.HistoryManager.insertClientMessage(incomingMessage);
			if(Ols.HistoryManager.atBottom) {
				Ols.HistoryManager.scrollBottom();
			} else if(incomingMessage.itemId == Session.get('currentItemId')) {
				Session.set('numIncomingMessages', Session.get('numIncomingMessages')+1);
			}

			//FIXME: An event should be fired here which the sidebar can handle.
			if(incomingMessage.itemId != Session.get('currentItemId')) {
				$(".left-sidebar .item-list li[data-id='" + incomingMessage.itemId + "'] .item-msg-count").addClass("new-messages");
			}

		} else {
			Ols.HistoryManager.scrollBottom();
		}
	});

	function checkScroll() {
		console.log("message-list scrollTop: " + ($("#message-list").scrollTop() + $("#message-list").outerHeight()));
		console.log("message-list scrollTop2: " + ($("#message-list").scrollTop() + $("#message-list").height()));
		console.log("message list height: " + $("#message-list")[0].scrollHeight);
		if($("#message-list").scrollTop() == 0) {
			Ols.HistoryManager.loadMoreMessages();
		}
		Ols.HistoryManager.atBottom = $("#message-list")[0].scrollHeight == ($("#message-list").scrollTop() + $("#message-list").height());
		console.log("atBottom: " + Ols.HistoryManager.atBottom);
		if(Ols.HistoryManager.atBottom) {
			$("#header-new-messages-toast").hide();
		}
	}

	Template.messageHistory.onRendered(function() {
		$("#message-list").scroll(checkScroll);
	});

	Template.messageHistory.helpers({
		messages: function() {
			var filter = {boardId: Session.get('currentBoardId')};
			var currentItemId = Session.get('currentItemId');
			if(currentItemId) {
				filter.itemId = currentItemId;
			}
			return ClientMessages.find(filter, {sort: {createdAt: 1}});
		},

		numIncomingMessages: function() {
			return Session.get('numIncomingMessages');
		},

		incomingMessagesText: function() {
			var numMessages = Session.get('numIncomingMessages');
			if(numMessages == 1) {
				return 'New Message - click to show';
			} else if(numMessages > 0) {
				return 'New Messages - click to show';
			}
		},

		hasIncomingMessages: function() {
			return Session.get('numIncomingMessages') > 0;
		},

		moreMessagesOnServer: function() {
			return Ols.HistoryManager.moreMessagesOnServer();
		},

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
						var newMessage = Ols.HistoryManager.insertClientMessage({text:inputVal});
						Meteor.call('saveMessage', newMessage, function(err, result) {
							if(err) {
								alert("error sending message");
							} else {
								$("#message-box").val('');
								Ols.HistoryManager.scrollBottom();
								Streamy.broadcast('sendMessage', newMessage);
							}
						});
					}
				}
			}
		}
	});
}

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
				limit: Ols.MESSAGE_PAGE_SIZE,
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
	});
}
