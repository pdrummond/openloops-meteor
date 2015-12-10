if(Meteor.isClient) {

	Template.messageHistory.onCreated(function() {
		Tracker.autorun(function(computation) {

			var filterQuery = Session.get("filterQuery");
			var itemId = Session.get('currentItemId');

			//TODO: Pass these into the history manager - it shouldn't use session 
			//at all.

			computation.onInvalidate(function() {
		        console.trace();
		    });
			Tracker.nonreactive(function() {
				Ols.HistoryManager.loadInitialMessages();
			});
		});

		Meteor.setInterval(function() {
			$(".user-card").removeClass("user-typing");
		}, 1000);

		Streamy.on('userTyping', function(user) {
			if(user.username != Meteor.user().username) {
				$(".user-card[data-username='" + user.username + "']").addClass("user-typing");
			}
		});
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
	});

	Template.messageHistory.onRendered(function() {
		//console.log("MESSAGE HISTORY onRendered - should be called once");
		/*
			This call is needed to load the messages on full browser refresh.
			When switching to new items from within the app, loadInitialMessages
			is invoked in the router, which feels wrong.  I think what I really
			need to do is create the messageHistory template each time the route
			changes then this call will work.
		*/
		//Ols.HistoryManager.loadInitialMessages();
		$("#messageHistory").scroll(Ols.HistoryManager.checkScroll);
	});

	Template.messageHistory.helpers({
		messages: function() {
			console.log("> messageHistory.messages");
			var filter = {};
			var itemId = Session.get('currentItemId');
			if(itemId) {
				filter.itemId = itemId;
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
