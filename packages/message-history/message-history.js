if(Meteor.isClient) {

	Template.messageHistory.onCreated(function() {
    console.log(">> messageHistory.onCreated");
    var self = this;
		Tracker.autorun(function(computation) {
      Ols.HistoryManager.projectId = Session.get('currentProjectId');
			Ols.HistoryManager.boardId = Session.get('currentBoardId');
			Ols.HistoryManager.itemId = Session.get('currentItemId');
			Ols.HistoryManager.filterQuery = Session.get("filterQuery");

			//console.log("mesage-history filterQuery: " + Ols.HistoryManager.filterQuery);

			/*computation.onInvalidate(function() {
		        console.trace("MessageHistory.autorun invalidated");
		    });*/
			Tracker.nonreactive(function() {
				Ols.HistoryManager.loadInitialMessages();
			});
		});

		Meteor.setInterval(function() {
			$(".user-card").removeClass("user-typing");
			$(".user-typing-footer-msg").hide();
		}, 3000);

		Streamy.on('userTyping', function(ctx) {
			if(ctx.username != Meteor.user().username) {
				if(ctx.projectId == Session.get('currentProjectId')) {
					$(".user-card[data-username='" + ctx.username + "']").addClass("user-typing");
				}
        console.trace("user typing");
				if(ctx.itemId == this.selectedItemId) {
					$(".user-typing-footer-msg").text(ctx.username + " is typing");
					$(".user-typing-footer-msg").show();
				}
			}
		});
		Streamy.on('sendMessage', function(incomingMessage) {
			console.log(">>> RECEIVED SEND_MESSAGE STREAMY");
			if(incomingMessage.createdBy != Meteor.user().username) {
				Ols.Message.insertClientMessage(incomingMessage);
				if(Ols.HistoryManager.atBottom) {
					Ols.HistoryManager.scrollBottom();
				} else if(incomingMessage.itemId == this.selectedItemId) {
					Session.set('numIncomingMessages', Session.get('numIncomingMessages')+1);
				}

				//FIXME: An event should be fired here which the sidebar can handle.
				if(incomingMessage.itemId != this.selectedItemId) {
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

		showEmptyMsgClass: function() {
			return Ols.HistoryManager.isLoadingInitialMessages()?'hide':'';
		},

		noMessages: function() {
			var filter = {};
			var itemId = this.selectedItemId;
			if(itemId) {
				filter.itemId = itemId;
			}
			return Ols.ClientMessage.find(filter, {sort: {createdAt: 1}}).count() == 0;
		},

		noFilter: function() {
			var filterQuery = Session.get('filterQuery');
			return !(filterQuery && filterQuery.length > 0);
		},

		messages: function() {
			var filter = {};
			var itemId = this.selectedItemId;

			if(itemId) {
				filter.itemId = itemId;
			}
			return Ols.ClientMessage.find(filter, {sort: {createdAt: 1}});
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

	Template.messageHistory.events({
		'click #clear-filter-link': function() {
			Session.set('filterQuery', '');
		},
	});
}
