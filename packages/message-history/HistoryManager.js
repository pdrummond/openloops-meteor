Ols.HistoryManager = {
	loadingInitialMessages: false,
	loadingMessages: false,
	projectId: null,
	boardId: null,
	itemId: null,
	filterQuery: '',

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
		var olderThanDate = this.getOldestClientMessageDate();
		console.log(">>>> LOADING MESSAGES older than " + Ols.TimeUtils.formatTime(olderThanDate));
		Meteor.call('loadMessages', {
			olderThanDate: olderThanDate,
			projectId: this.projectId,
			boardId: this.boardId,
			itemId: this.itemId,
			itemFilter: OpenLoops.getFilterQuery(this.filterQuery)
		}, function(err, messages) {
			console.log(" >> load messages returned: " + messages.length);
			if(err) {
				Ols.Error.showError("Error loading messages", err);
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
		if(this.loadingInitialMessages == false) {
			this.loadingInitialMessages = true;
			this.loadingMessages = true;
			//If load takes a while, show busy
			this.busyTimeout = setTimeout(function() {
				//console.log("SHOWING BUSY")
				self.showBusyIcon();
			}, 300);

			console.log("> loadInitialMessages");


			ClientMessages._collection.remove({});
			//console.log("CLIENT MESSAGES DELETED: Num client msgs: " + ClientMessages.find().count());

			var self = this;
			this.loadMessages(function(ok) {
				//console.log("CLEARING BUSY TIMER");
				clearTimeout(self.busyTimeout);
				if(ok) {
					self.scrollBottom();
					self.hideBusyIcon();
					self.loadingMessages = false;
					self.loadingInitialMessages = false;
				}
			});
		}
	},

	loadMoreMessages: function() {
		this.loadingMessages = true;
		console.log(">>>> loadMoreMessages");
		var self = this;
		Meteor.setTimeout(function() {
			if(self.moreMessagesOnServer()) {
				console.log("    more messages detected. Loading now...");
				self.showBusyIcon();
				self.loadMessages(function(ok) {
					if(ok) {
						//So this is temporary - need to somehow calculate the height of the new page to scroll by
						//Could always just guess based on the average size of a message - if one or two messages
						//are bigger then hopefully the visual effect will go unnoticable?
						var scrollTopAmount = 200;
						//console.log("SCROLLING AWAY FROM TOP!!!!! by " + scrollTopAmount);
						$("#messageHistory").scrollTop(scrollTopAmount);
						self.loadingMessages = false;
						self.hideBusyIcon();
					}
				});
			} else {
				console.log("    NO MORE MESSAGES ON SERVER");
				self.hideBusyIcon();
			}
		}, 1);
	},

	moreMessagesOnServer: function() {
		console.log("> moreMessagesOnServer");
		console.log("    boardId: " + this.boardId);
		console.log("    itemId: " + this.itemId);
		var result = false;
		if(!this.loadingInitialMessages) {
			var serverMsgCount;
			if(this.itemId) {
				var item = Items.findOne(this.itemId);
				if(item) {
					console.log("    Using item.numMessages: " + item.numMessages);
					serverMsgCount = item.numMessages;
				}
			}
			if(!serverMsgCount && this.boardId) {
				var board = Boards.findOne(this.boardId);
				if(board) {
					console.log("    Using board.numMessages: " + board.numMessages);
					serverMsgCount = board.numMessages;
				}
			}
			var clientMsgCount = ClientMessages._collection.find().fetch().length;

			result = (clientMsgCount < serverMsgCount);
			console.log("    clientMsgCount: " + clientMsgCount);
			console.log("    serverMsgCount: " + serverMsgCount);
		}
		console.log("< moreMessagesOnServer");
		return result;
	},

	scrollBottom: function() {
		//console.log(">> scrollBottom");
		var $messageList = $("#messageHistory");
		if($messageList.length > 0) {
			$messageList.scrollTop($messageList[0].scrollHeight);
		}
		Ols.HistoryManager.atBottom = true;
		//console.log("<< scrollBottom");
	},

	showBusyIcon: function() {
		$("#messageHistory #loading-more").animate({'opacity': '1'});
	},

	hideBusyIcon: function() {
		$("#messageHistory #loading-more").animate({'opacity': '0'});
	}
}
