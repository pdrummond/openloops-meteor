Ols.HistoryManager = {
	loadingInitialMessages: false,
	loadingMessages: false,

	checkScroll: function() {
		if(Ols.HistoryManager.loadingMessages == false) {
			if($("#messageHistory").scrollTop() == 0) {
				console.log(">> SCROLL IS AT TOP");
				Ols.HistoryManager.loadMoreMessages();
			}
			Ols.HistoryManager.atBottom = $("#messageHistory")[0].scrollHeight == ($("#messageHistory").scrollTop() + $("#messageHistory").height());
			console.log("atBottom: " + Ols.HistoryManager.atBottom);
			if(Ols.HistoryManager.atBottom) {
				$("#messageHistory #header-new-messages-toast").hide();
			}
		}
	},

	getOldestClientMessageDate: function() {
		var date;		
		var existingMessages = ClientMessages.find({}, {sort:{createdAt:1}}).fetch();
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
			projectId: Session.get('currentProjectId'),
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
				console.log("<<<< LOAD MESSAGES DONE - " + ClientMessages._collection.find().count() + " client messages loaded");
				callback(true);
			}
		});
	},

	loadInitialMessages: function() {
		var self = this;
		this.loadingInitialMessages = true;
		this.loadingMessages = true;
		//If load takes a while, show busy
		this.busyTimeout = setTimeout(function() {
			console.log("SHOWING BUSY")
			self.showBusyIcon();
		}, 300);

		console.log(">>>> LOAD INITIAL MESSAGES");
		ClientMessages._collection.remove({});
		console.log("CLIENT MESSAGES DELETED: Num client msgs: " + ClientMessages.find().count());

		var self = this;
		this.loadMessages(function(ok) {
			console.log("CLEARING BUSY TIMER");
			clearTimeout(self.busyTimeout);
			if(ok) {
				self.scrollBottom();
				self.hideBusyIcon();
				self.loadingMessages = false;
				self.loadingInitialMessages = false;
			}
		});
	},

	loadMoreMessages: function() {
		this.loadingMessages = true;
		console.log(">>>> LOAD MORE MESSAGES");
		var self = this;
		Meteor.setTimeout(function() {
			if(self.moreMessagesOnServer()) {
				self.showBusyIcon();
				console.log(">>>> STILL LOAD MORE MESSAGES");
				self.loadMessages(function(ok) {
					if(ok) {
						var scrollTopAmount = 300; //So this is temporary - need to somehow calculate the height of the new page to scroll by
						console.log("SCROLLING AWAY FROM TOP!!!!! by " + scrollTopAmount);
						$("#messageHistory").scrollTop(scrollTopAmount);
						self.loadingMessages = false;
						self.hideBusyIcon();
					}
				});
			} else {
				console.log(">>>> NO MORE MESSAGES ON SERVER");
				self.hideBusyIcon();
			}
		}, 1);
	},

	moreMessagesOnServer: function() {
		console.log("> moreMessagesOnServer");
		var result = false;
		if(!this.loadingInitialMessages) {
			var currentItemId = Session.get('currentItemId');
			var serverMsgCount;
			if(currentItemId) {
				var item = Items.findOne(currentItemId);
				if(item) {
					console.log("    Using item.numMessages: " + item.numMessages);
					serverMsgCount = item.numMessages;
				}
			}
			if(!serverMsgCount) {
				var board = Boards.findOne(Session.get('currentBoardId'));
				if(board) {
					console.log("    Using board.numMessages: " + board.numMessages);
					serverMsgCount = board.numMessages;
				}
			}
			if(!serverMsgCount) {
				var project = Projects.findOne(Session.get('currentProjectId'));
				if(project) {
					console.log("    Using project.numMessages: " + project.numMessages);
					serverMsgCount = project.numMessages;
				}
			}
			var clientMsgCount = ClientMessages._collection.find().fetch().length;

			result = (clientMsgCount < serverMsgCount);
			console.log("    clientMsgCount: " + clientMsgCount);
			console.log("    serverMsgCount: " + serverMsgCount);
			if(result) {
				console.log("moreMessagesOnServer")
			}
		}
		console.log("< moreMessagesOnServer");
		return result;
	},

	scrollBottom: function() {
		console.log(">> scrollBottom");
		var $messageList = $("#messageHistory");
		if($messageList.length > 0) {
			$messageList.scrollTop($messageList[0].scrollHeight);
		}
		Ols.HistoryManager.atBottom = true;
		console.log("<< scrollBottom");
	},

	showBusyIcon: function() {
		$("#messageHistory #loading-more").animate({'opacity': '1'});
	},

	hideBusyIcon: function() {
		$("#messageHistory #loading-more").animate({'opacity': '0'});
	}
}
