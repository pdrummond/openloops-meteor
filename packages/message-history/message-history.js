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
		Ols.HistoryManager.loadInitialMessages();
		$("#messageHistory").scroll(Ols.HistoryManager.checkScroll);
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
}
