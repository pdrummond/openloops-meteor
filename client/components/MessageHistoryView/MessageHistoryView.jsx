
Ols.MessageHistory = {
	getOldestClientMessageDate() {
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

	loadMessages(callback) {
		console.log("> _loadMessages");
		var olderThanDate = this.getOldestClientMessageDate();
		Meteor.call('loadMessages', {
			olderThanDate: olderThanDate,
			boardId: Session.get('currentBoardId'),
			itemId: Session.get('currentItemId'),
		}, function(err, messages) {
			if(err) {
				alert("Error loading messages");
				if(callback) {
					callback(false);
				}
			} else {
				_.each(messages, function(message) {
					ClientMessages._collection.insert(message);
				});
				if(callback) {
					callback(true);
				}
			}
		});
	},

	loadInitialMessages() {
		ClientMessages._collection.remove({});
		this.loadMessages();
	}
}

MessageHistoryView = React.createClass({

	mixins: [ReactMeteorData],

	componentWillMount() {
		console.log("> componentWillMount");
	},

	getInitialState() {
		return {
			hideCompleted: false
		}
	},

	getMeteorData() {
		console.log("getMeteorData");
		let query = {};

		return {
			messages: ClientMessages.find(query, {sort: {createdAt: 1}}).fetch()
		};
	},

	render() {
		return (
			<ul className="message-list">
				{this.renderMessages()}
			</ul>
		);
	},

	renderMessages() {
		return this.data.messages.map((message) => {
			return <MessageView key={message._id} message={message}/>;
		});
	},


	/*_loadMoreMessages() {
		Meteor.setTimeout(function() {
			if(this._moreMessagesOnServer()) {
				this._loadMessages(function(ok) {
					if(ok) {
						//$(".message-list").scrollTop(($(".user-message").outerHeight() * MESSAGE_PAGE_SIZE));
					}
				});
			}
		}, 500);
	}

	_moreMessagesOnServer() {
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
	}*/

	componentWillUpdate() {
		this.handleWillScrollBottom();
	},

	componentDidUpdate() {
		this.handleDidScrollBottom();
	},

	handleWillScrollBottom() {
		var node = ReactDOM.findDOMNode(this);
		this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
	},

	handleDidScrollBottom() {
		if (this.shouldScrollBottom) {
			var node = ReactDOM.findDOMNode(this);
			node.scrollTop = 200;//node.scrollHeight + node.offsetHeight;

		}
	}
});
