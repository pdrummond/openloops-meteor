
Meteor.methods({

	loadMessages: function(opts) {
		//console.log("loadMessages: " + JSON.stringify(opts));

		var filter = {};

		if(opts.itemFilter && !_.isEmpty(opts.itemFilter)) {
			var itemIds = Ols.Item.find(opts.itemFilter, {fields: {_id: 1}}).map(function(obj) {
				return obj._id;
			});

			//console.log("MESSAGES itemIds: " + JSON.stringify(itemIds));

			filter.itemId = { $in: itemIds };
		}

		if(opts.projectId) {
			filter.projectId = opts.projectId;
		}
		if(opts.boardId) {
			filter.boardId = opts.boardId;
		}
		if(opts.itemId) {
			filter.itemId = opts.itemId;
		}
		if(opts.olderThanDate) {
			filter.createdAt = {$lt: opts.olderThanDate};
		}
		console.log("SERVER MSG FILTER: " + JSON.stringify(filter));
		var messages = Ols.ServerMessage.find(filter, {
			limit: Ols.MESSAGE_PAGE_SIZE,
			sort: {createdAt: -1}
		});
		//Meteor._sleepForMs(2000);
		return messages.fetch();
	},

	getServerMessagesCount: function(opts) {
		var filter = {};

		if(opts.itemFilter && !_.isEmpty(opts.itemFilter)) {
			var itemIds = Ols.Item.find(opts.itemFilter, {fields: {_id: 1}}).map(function(obj) {
				return obj._id;
			});

			//console.log("MESSAGES itemIds: " + JSON.stringify(itemIds));

			filter.itemId = { $in: itemIds };
		}
		if(opts.projectId) {
			filter.projectId = opts.projectId;
		}
		if(opts.boardId) {
			filter.boardId = opts.boardId;
		}
		console.log(">> getServerMessagesCount filter: " + JSON.stringify(filter));
		var count = Ols.ServerMessage.find(filter).count();
		console.log(">> getServerMessagesCount count: " + count);
		return count;
	},

	saveMessage: function(newMessage) {
		console.log("saveMessage: " + JSON.stringify(newMessage));
		newMessage.createdAt = new Date().getTime();
		newMessage.createdBy = newMessage.createdBy || Meteor.user().username;

		Ols.ServerMessage.insert(newMessage);

		if(newMessage.itemId) {
			Ols.Item.update(newMessage.itemId, {
				$inc: {numMessages: 1},
				$set: {updatedAt: new Date().getTime()},
			});
		}
		Ols.Board.update(newMessage.boardId, {$inc: {numMessages: 1}});
		Ols.Project.update(newMessage.projectId, {$inc: {numMessages: 1}});
		Meteor.call('detectMentionsInMessage', newMessage);
	},

	insertMessage: function(newMessage) {
		newMessage = _.extend({
			createdAt: new Date().getTime(),
			createdBy: Meteor.user().username,
		}, newMessage);
		Meteor.call('saveMessage', newMessage);
		Streamy.broadcast('sendMessage', newMessage);
	},

	detectMentionsInMessage: function(message) {
		console.log("> detectMentionsInMessage");
		var re = /@([\w\.-]+)/g;
		var matches;

		do {
			matches = re.exec(message.text);
			if (matches) {
				var toUser = Meteor.users.findOne({username: matches[1]});
				if(toUser != null) {
					console.log("MENTION DETECTED: " + JSON.stringify(toUser));

					var data = {
						type: 'new-message-mention',
						fromUserId: Meteor.userId(),
						fromUsername: Meteor.user().username,
						toUserId: toUser._id,
						messageId: message._id,
						messageText: message.text
					};
					//TODO: Once sessionForUsers is released, use it
					//Streamy.sessionsForUsers(toUser._id).emit('mention', data);
					Streamy.broadcast('mention', data);
				}
			}
		} while (matches);
		console.log("< detectMentionsInMessage");
	},

	_getOldestBoardMessage: function(projectId, boardId) {
		return Ols.ServerMessage.findOne({boardId: boardId}, {sort: {DateTime: 1, limit: 1}});
	}

});


Meteor.publish("latestActivityMessages", function(opts) {
  var filter = {};
  if(opts && opts.filter) {
    filter = _.extend(filter, opts.filter);
  }
  return ServerMessages.find(filter, {sort: {createdAt: -1}, limit:10});
});
