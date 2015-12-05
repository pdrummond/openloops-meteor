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
		//Streamy.broadcast('webHookEvent', activityMessage);
		/*Streamy.on('webHookEvent', function(data) {
			console.log("WEBHOOK: " + JSON.stringify(data, null, 4));
			OpenLoops.insertBoardActivityMessage(data, {clientSideOnly: true});
		});*/
	}
}
