Ols.Activity = {
	insertWebHookActivityMessage: function(activityMessage) {
		console.log("Ols.Activity.insertWebHookActivityMessage");
		/*
			WebHooks trigger directly in the server-side, so we
			insert the message directly on the server, then broadcast a
			message to the clients to insert the message client-side only.
		*/
		Meteor.call('saveMessage', activityMessage);
		Streamy.broadcast('webHookEvent', activityMessage);
	}
}
