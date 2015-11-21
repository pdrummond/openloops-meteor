Ols.Message = {
	createMessage: function(attrs, callback) {
		var newMessage = this._private.insertClientMessage(attrs);
		Meteor.call('saveMessage', newMessage, function(err, result) {
			if(err) {
				alert("error sending message");
			} else {
				if(callback) callback(result);
				Streamy.broadcast('sendMessage', newMessage);
			}
		});
	},

	MSG_TYPE_CHAT: 'MSG_TYPE_CHAT',
	MSG_TYPE_ACTIVITY: 'MSG_TYPE_ACTIVITY',

	_private: {

		insertClientMessage: function(attrs) {
			var defaultAttrs = {
				type: Ols.Message.MSG_TYPE_CHAT,
				createdAt: new Date().getTime(),
				createdBy: Meteor.user().username,
				projectId: Ols.Context.getProjectId(),
				boardId: Ols.Context.getBoardId(),
				itemId: Ols.Context.getItemId()
			};
			var newMessage = _.extend(defaultAttrs, attrs);
			var newMessageId = ClientMessages._collection.insert(newMessage);
			newMessage._id = newMessageId;
			return newMessage;
		}
	}
}
