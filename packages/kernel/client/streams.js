Meteor.startup(function() {
	Streamy.on('mention', function(data) {
		console.log(">>> RECEIVED MENTION STREAMY");
		//TODO: Once mention uses direct message we won't have to
		//check for the user id.
		if(Meteor.userId() == data.toUserId) {
			var body = data.messageText;
			//notify.createNotification("Mentioned", {body: data.messageId});
			notify.createNotification("@" + data.fromUsername + " mentioned you", {
				icon: 'https://www.openloopz.com/images/openloopz-o.png',
				body: body,
				tag: data.messageId
			});
			console.log("Mention notification created")
		}
	});
});
