Ols.MessageHistory = {
	removeAllClientMessages: function() {
		ClientMessages._collection.remove({});
	},

	getClientMessagesCount: function() {
		return ClientMessages.find().count();
	}
}
