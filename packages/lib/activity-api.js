Ols.Activity = {
	insertWebHookActivityMessage: function(activityMessage) {
		console.log("Ols.Activity.insertWebHookActivityMessage");
		/*
			WebHooks trigger directly in the server-side, so we
			insert the message directly on the server, then broadcast a
			message to the clients to insert the message client-side only.
		*/
		Meteor.call('saveMessage', activityMessage);
		Streamy.broadcast('sendMessage', activityMessage);
	},

	insertActivityMessage: function(activityMessage, item) {
		check(activityMessage, {
			activityType: String,
			createdBy: Match.Optional(String),
			createdAt: Match.Optional(Date),
			projectId: Match.Optional(String),
			boardId: Match.Optional(String),
			toBoard: Match.Optional(Match.Any),
			fromBoard: Match.Optional(Match.Any),
			item: Match.Optional(Match.Any),
		});
		if(!Meteor.isServer) {
			throw new Meteor.Error("insert-activity-message-001", "Activity items cannot be inserted client-side");
		}
		activityMessage.type =  Ols.MSG_TYPE_ACTIVITY;
		if(item) {
			activityMessage = _.extend({
				createdBy: Meteor.user().username,
				createdAt: new Date().getTime(),
				itemType: item.type,
				projectId: item.projectId,
				boardId: item.boardId,
				itemId: item._id,
				item: item
			}, activityMessage);
		}
		Meteor.call('saveMessage', activityMessage);
    Meteor.call('insertActivityItem', activityMessage);
		Streamy.broadcast('sendMessage', activityMessage);
	},

	ACTIVITY_TYPE_NEW_BOARD: 'ACTIVITY_TYPE_NEW_BOARD',
	ACTIVITY_TYPE_NEW_ITEM: 'ACTIVITY_TYPE_NEW_ITEM',
	ACTIVITY_TYPE_ITEM_TYPE_CHANGE: 'ACTIVITY_TYPE_ITEM_TYPE_CHANGE',
	ACTIVITY_TYPE_ITEM_OPENED: 'ACTIVITY_TYPE_ITEM_OPENED',
	ACTIVITY_TYPE_ITEM_CLOSED: 'ACTIVITY_TYPE_ITEM_CLOSED',
	ACTIVITY_TYPE_ITEM_MOVED_TO_BOARD: 'ACTIVITY_TYPE_ITEM_MOVED_TO_BOARD',
	ACTIVITY_TYPE_ITEM_MOVED_FROM_BOARD: 'ACTIVITY_TYPE_ITEM_MOVED_FROM_BOARD',
	ACTIVITY_TYPE_ITEM_TITLE_CHANGED: 'ACTIVITY_TYPE_ITEM_TITLE_CHANGED',
	ACTIVITY_TYPE_ITEM_DESC_CHANGED: 'ACTIVITY_TYPE_ITEM_DESC_CHANGED',
	ACTIVITY_TYPE_WEBHOOK_EVENT: 'ACTIVITY_TYPE_WEBHOOK_EVENT',
}
