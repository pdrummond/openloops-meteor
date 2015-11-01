Ols.HistoryManager = {

	insertClientMessage: function(attrs) {
		var currentItemId = Session.get('currentItemId');
		var defaultAttrs = {
			type: Ols.MSG_TYPE_CHAT,
			createdAt: new Date().getTime(),
			createdBy: Meteor.user().username,
			boardId: Session.get('currentBoardId'),
			itemId: currentItemId
		};
		var newMessage = _.extend(defaultAttrs, attrs);
		var newMessageId = ClientMessages._collection.insert(newMessage);
		newMessage._id = newMessageId;
		return newMessage;
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
		var olderThanDate = this.getOldestClientMessageDate();
		Meteor.call('loadMessages', {
			olderThanDate: olderThanDate,
			boardId: Session.get('currentBoardId'),
			itemId: Session.get('currentItemId')
		}, function(err, messages) {
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
		ClientMessages._collection.remove({});

		var self = this;
		this.loadMessages(function(ok) {
			if(ok) {
				self.scrollBottom();
			}
		});
	},

	loadMoreMessages: function() {
		var self = this;
		Meteor.setTimeout(function() {
			if(self.moreMessagesOnServer()) {
				self.loadMessages(function(ok) {
					if(ok) {
						$("#message-list").scrollTop(($(".user-message").outerHeight() * Ols.MESSAGE_PAGE_SIZE));
					}
				});
			}
		}, 200);
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
		var $messageList = $("#message-list");
		if($messageList.length > 0) {
			$messageList.scrollTop($messageList[0].scrollHeight);
		}
		Ols.HistoryManager.atBottom = true;
	}
}
