
MessageHistoryView = React.createClass({

	mixins: [ReactMeteorData],

	componentWillMount() {
		console.log("> componentWillMount");
		this.loadInitialMessages();
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
			<ul className="messageHistoryView">
				{this.renderMessages()}
			</ul>
		);
	},

	renderMessages() {
		return this.data.messages.map((message) => {
			return <ChatMessageView key={message._id} message={message}/>;
		});
	},

	loadInitialMessages: function() {
		this.loadingInitialMessages = true;
		this.loadingMessages = true;

		console.log(">>>> LOAD INITIAL MESSAGES");
		ClientMessages._collection.remove({}); //FIXME: This should be hidden behind an API - Ols.ClientMessages.removeAll().
		console.log("CLIENT MESSAGES DELETED: Num client msgs: " + ClientMessages.find().count());

		var self = this;
		this.loadMessages(function(ok) {
			if(ok) {
				self.scrollBottom();
				console.log("Initial load of messages done");
			}
		});
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
				var node = ReactDOM.findDOMNode(self);
				node.scrollTop = (node.scrollHeight + node.offsetHeight + 110);
				console.log("node.scrollTop=" + node.scrollTop)
				self.shouldScrollBottom = false;
			}
		});
	},

	scrollBottom: function() {
		this.shouldScrollBottom = true;
	}
});
