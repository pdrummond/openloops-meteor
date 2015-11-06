Ols.HistoryManager = {

	loadingMessages: false,

	checkScroll: function() {
		if(Ols.HistoryManager.loadingMessages == false) {
			/*console.log("message-list scrollTop: " + ($("#message-list").scrollTop() + $("#message-list").outerHeight()));
			console.log("message-list scrollTop2: " + ($("#message-list").scrollTop() + $("#message-list").height()));
			console.log("message list height: " + $("#message-list")[0].scrollHeight);*/
			if($("#message-list").scrollTop() == 0) {
				console.log(">> SCROLL IS AT TOP");
				Ols.HistoryManager.loadMoreMessages();
			}
			Ols.HistoryManager.atBottom = $("#message-list")[0].scrollHeight == ($("#message-list").scrollTop() + $("#message-list").height());
			console.log("atBottom: " + Ols.HistoryManager.atBottom);
			if(Ols.HistoryManager.atBottom) {
				$("#header-new-messages-toast").hide();
			}
		}
	},

	getOldestClientMessageDate: function() {
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
	},

	loadMessages: function(callback) {
		console.log(">>>> LOAD MESSAGES");
		var olderThanDate = this.getOldestClientMessageDate();
		Meteor.call('loadMessages', {
			olderThanDate: olderThanDate,
			boardId: Session.get('currentBoardId'),
			itemId: Session.get('currentItemId')
		}, function(err, messages) {
			console.log(" >> load messages returned: " + messages.length);
			if(err) {
				alert("Error loading messages: " + err);
				callback(false);
			} else {
				_.each(messages, function(message) {
					ClientMessages._collection.insert(message);
				});
				callback(true);
			}
		});
	},

	loadInitialMessages: function() {
		this.loadingMessages = true;
		$("#message-list").css({'opacity': 0});
		$("#loading-messages-spinner").animate({'opacity': 1});
		console.log(">>>> LOAD INITIAL MESSAGES");
		ClientMessages._collection.remove({});

		var self = this;
		this.loadMessages(function(ok) {
			if(ok) {
				Meteor.setTimeout(function() {
					self.scrollBottom();
					$("#message-list").animate({'opacity': 1});
					$("#loading-messages-spinner").animate({'opacity': 0});
					self.loadingMessages = false;
				}, 500);
			}
		});
	},

	loadMoreMessages: function() {
		this.loadingMessages = true;
		console.log(">>>> LOAD MORE MESSAGES");
		var self = this;
		Meteor.setTimeout(function() {
			if(self.moreMessagesOnServer()) {
				console.log(">>>> STILL LOAD MORE MESSAGES");
				self.loadMessages(function(ok) {
					if(ok) {
						var scrollTopAmount = 300; //So this is temporary - need to somehow calculate the height of the new page to scroll by
						console.log("SCROLLING AWAY FROM TOP!!!!! by " + scrollTopAmount);
						$("#message-list").scrollTop(scrollTopAmount);
						self.loadingMessages = false;
					}
				});
			} else {
				console.log(">>>> NO MORE MESSAGES ON SERVER");

			}
		}, 1000);
	},

	moreMessagesOnServer: function() {
		console.log("> moreMessagesOnServer");
		var result = true;
		var currentItemId = Session.get('currentItemId');
		var serverMsgCount;
		if(currentItemId) {
			var item = Items.findOne(currentItemId);
			if(item) {
				serverMsgCount = item.numMessages;
			}
		}
		if(!serverMsgCount) {
			var board = Boards.findOne(Session.get('currentBoardId'));
			if(board) {
				serverMsgCount = board.numMessages;
			}
		}
		var clientMsgCount = ClientMessages._collection.find().fetch().length;

		result = (clientMsgCount < serverMsgCount);
		console.log("    clientMsgCount: " + clientMsgCount);
		console.log("    serverMsgCount: " + serverMsgCount);
		console.log("< moreMessagesOnServer");
		return result;
	},

	scrollBottom: function() {
		console.log("SCROLL BOTTOM !!!!");
		var $messageList = $("#message-list");
		if($messageList.length > 0) {
			$messageList.scrollTop($messageList[0].scrollHeight);
		}
		Ols.HistoryManager.atBottom = true;
	}
}
