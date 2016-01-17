Ols.ClientMessage = {
	find: function(selector, options) {
		selector = selector || {};
		return ClientMessages.find(selector, options);
	},

	findOne: function(selector, options) {
		return ClientMessages.findOne(selector, options);
	},

	//TODO: Figure out if _collection is required for HistoryManager. If not,
	//remove this.
	_insertRaw: function(message) {
		ClientMessages._collection.insert(message);
	},

	//TODO: Figure out if _collection is required for HistoryManager. If not,
	//remove this.
	_removeAllRaw: function(selector, callback) {
		ClientMessages._collection.remove(selector, callback);
	},

	//TODO: Figure out if _collection is required for HistoryManager. If not,
	//remove this.
	_countRaw: function() {
		return ClientMessages._collection.find().fetch().length;
	}
}

Ols.ServerMessage = {
	find: function(selector, options) {
		selector = selector || {};
		return ServerMessages.find(selector, options);
	},

	findOne: function(selector, options) {
		return ServerMessages.findOne(selector, options);
	},

	insert: function(message, callback) {
		return ServerMessages.insert(message, callback);
	},

	update: function(selector, modifier, options, callback) {
		return ServerMessages.update(selector, modifier, options, callback);
	},

	remove: function(selector, callback) {
		return ServerMessages.remove(selector, callback);
	},
}

Ols.Message = {

	insertClientMessage: function(attrs) {
		var defaultAttrs = {
			type: Ols.MSG_TYPE_CHAT,
			createdAt: new Date().getTime(),
			createdBy: Meteor.user().username,
			projectId: Session.get('currentProjectId'),
			boardId: Session.get('currentBoardId'),
		};
		var newMessage = _.extend(defaultAttrs, attrs);
		var newMessageId = Ols.ClientMessage._insertRaw(newMessage);
		newMessage._id = newMessageId;
		return newMessage;
	},

	MSG_TYPE_CHAT: 'MSG_TYPE_CHAT',
	MSG_TYPE_ACTIVITY: 'MSG_TYPE_ACTIVITY',

	Schema: {
		_id: Match.Optional(String),
		projectId: String,
		boardId: String,
		type: String,
		text: Match.Optional(String),
		activityType: Match.Optional(String),
		createdAt: Match.Optional(Number),
		createdBy: Match.Optional(String),
		issueType: Match.Optional(String),
		item: Match.Optional(Match.Any),
		itemId: Match.Optional(String),
		itemType: Match.Optional(String),
		toBoard: Match.Optional(Match.Any),
		fromBoard: Match.Optional(Match.Any)
	}
}
