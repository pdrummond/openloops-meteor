if(Meteor.isClient) {
	Streamy.on('sendMessage', function(incomingMessage) {
		console.log(">>> RECEIVED SEND_MESSAGE STREAMY");
		if(incomingMessage.createdBy != Meteor.user().username) {
			OpenLoops.insertClientMessage(incomingMessage);
			if(Ols.HistoryManager.atBottom) {
				Ols.HistoryManager.scrollBottom();
			} else if(incomingMessage.itemId == Session.get('currentItemId')) {
				Session.set('numIncomingMessages', Session.get('numIncomingMessages')+1);
			}

			//FIXME: An event should be fired here which the sidebar can handle.
			if(incomingMessage.itemId != Session.get('currentItemId')) {
				var $itemMsgCount;
				if(incomingMessage.itemId != null) {
					$itemMsgCount = $(".left-sidebar .item-list li[data-id='" + incomingMessage.itemId + "'] .item-msg-count");
				} else {
					$itemMsgCount = $(".left-sidebar #board-item .item-msg-count");
				}
				var numNewMessages = $itemMsgCount.attr('data-msg-count');
				numNewMessages = parseInt(numNewMessages) + 1;
				$itemMsgCount.attr('data-msg-count', numNewMessages);
				$itemMsgCount.text(numNewMessages);
				$itemMsgCount.addClass("new-messages");
			}
		} else {
			Ols.HistoryManager.scrollBottom();
		}
	});

	Template.messageHistory.onRendered(function() {
		console.log("MESSAGE HISTORY onRendered - should be called once");
		$("#message-list").scroll(Ols.HistoryManager.checkScroll);
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
						var newMessage = OpenLoops.insertClientMessage({text:inputVal});
						$("#message-box").val('');
						Meteor.call('saveMessage', newMessage, function(err, result) {
							if(err) {
								alert("error sending message");
							} else {
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
	});
}
