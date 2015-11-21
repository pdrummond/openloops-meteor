const { Paper } = mui;

MessageHistoryView = React.createClass({

	mixins: [ReactMeteorData],

	atBottom: false,
	shouldScrollBottom: false,
	loadingMessages: false,
	loadingInitialMessages: false,

	componentWillMount() {
		console.log("> componentWillMount");
		this.loadInitialMessages();
	},

	componentDidMount() {
		console.log("> componentDidMount");
		this.getThisNode().addEventListener('scroll', this.onScroll);
	},

	onScroll: function() {
		var node = this.getThisNode();
		console.log("onScroll: loadingMessages: " + this.loadingMessages + ", scrollTop: " + node.scrollTop);

		if(this.loadingMessages == false) {
			if(node.scrollTop == 0) {
				console.log(">> SCROLL IS AT TOP");
				this.loadMoreMessages();
			}
			this.atBottom = node.scrollHeight == (node.scrollTop + node.height);
			console.log("atBottom: " + this.atBottom);
			if(Ols.HistoryManager.atBottom) {
				//$("#messageHistory #header-new-messages-toast").hide(); FIXME
			}
		}
	},

	componentWillUnmount: function() {
		window.removeEventListener('scroll', this.onScroll);
	},

	getMeteorData() {
		console.log("> getMeteorData");
		var filter = {
			projectId: Ols.Context.getProjectId(),
			boardId: Ols.Context.getBoardId()
		};
		var currentItemId = Ols.Context.getItemId();
		if(currentItemId) {
			filter.itemId = currentItemId;
		}
		return {
			messages: ClientMessages.find(filter, {sort: {createdAt: 1}}).fetch()
		};
	},

	render() {
		return (
			<div className="messageHistoryView" style={{height:'calc(100% - 65px - 100px)', overflow:'auto'}}>
				<a href="" ref='loadingMore' style={{opacity:0}}>
					<i id="loading-more-icon" className="fa fa-spinner fa-pulse"></i>
				</a>
				{this.renderMessages()}
			</div>
		);
	},

	renderMessages() {
		return this.data.messages.map((message) => {
			return <ChatMessageView key={message._id} message={message}/>;
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
		Ols.MessageHistory.removeAllClientMessages();
		console.log("CLIENT MESSAGES DELETED: Num client msgs: " + Ols.MessageHistory.getClientMessagesCount());

		this.loadMessages(function(ok) {
			if(ok) {
				self.hideBusyIcon();
				self.loadingMessages = false;
				self.loadingInitialMessages = false;
				self.scrollBottom();
				console.log("Initial load of messages done");
			}
		});
	},

	loadMoreMessages: function() {
		this.loadingMessages = true;
		console.log(">>>> LOAD MORE MESSAGES");
		var self = this;
		if(self.moreMessagesOnServer()) {
			self.showBusyIcon();
			console.log(">>>> STILL LOAD MORE MESSAGES");
			self.loadMessages(function(ok) {
				if(ok) {
					var scrollTopAmount = 300; //So this is temporary - need to somehow calculate the height of the new page to scroll by
					console.log("SCROLLING AWAY FROM TOP!!!!! by " + scrollTopAmount);
					self.getThisNode().scrollTop = scrollTopAmount;
					self.loadingMessages = false;
					self.hideBusyIcon();
				}
			});
		} else {
			console.log(">>>> NO MORE MESSAGES ON SERVER");
			self.hideBusyIcon();
		}

	},

	moreMessagesOnServer: function() {
		//console.log("> moreMessagesOnServer");
		var result = false;
		if(!this.loadingInitialMessages) {
			var currentItemId = Ols.Context.getItemId();
			var serverMsgCount;
			if(currentItemId) {
				var item = Items.findOne(currentItemId);
				if(item) {
					serverMsgCount = item.numMessages;
				}
			}
			if(!serverMsgCount) {
				var board = Boards.findOne(Ols.Context.getBoardId());
				if(board) {
					serverMsgCount = board.numMessages;
				}
			}
			var clientMsgCount = Ols.MessageHistory.getClientMessagesCount();

			result = (clientMsgCount < serverMsgCount);
			console.log("    clientMsgCount: " + clientMsgCount);
			console.log("    serverMsgCount: " + serverMsgCount);
			console.log("< moreMessagesOnServer");
			if(result) {
				console.log("THERE ARE moreMessagesOnServer")
			}
		}
		return result;
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
				console.log("<<<< LOAD MESSAGES DONE - " + ClientMessages._collection.find().count() + " client messages loaded");
				callback(true);
			}
		});
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

	componentDidUpdate() {
		this.handleShouldScrollBottom();
	},

	handleShouldScrollBottom() {
		var self = this;
		requestAnimationFrame(function() {
			if (self.shouldScrollBottom) {
				var node = self.getThisNode();
				node.scrollTop = (node.scrollHeight + node.offsetHeight + 110);
				console.log("node.scrollTop=" + node.scrollTop)
				self.shouldScrollBottom = false;
				self.atBottom = true;
			}
		});
	},

	scrollBottom: function() {
		this.shouldScrollBottom = true;
	},

	getThisNode: function() {
		var node = ReactDOM.findDOMNode(this);
		return node;
	},

	showBusyIcon: function() {
		this.refs.loadingMore.style.opacity = 1;
	},

	hideBusyIcon: function() {
		this.refs.loadingMore.style.opacity = 0;
	}
});
