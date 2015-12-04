
Ols.GitHub = {
	GITHUB_WEBHOOK_EVENT: "GITHUB_WEBHOOK_EVENT",

	generateActivityMessage: function(activity) {
		var msg = "";
		var action = activity.event.action;
		var username = activity.event.sender.login;
		var issueNumber = activity.event.issue.number;
		var issueTitle = activity.event.issue.title;
		switch(activity.eventType) {
			case 'issues':
				var url = activity.event.issue.html_url;
				msg = username + ' ' + action + ' issue #<a href="' + url + '">' + issueNumber + ": " + Ols.StringUtils.truncate(issueTitle, 100) + '</a>';
				if(action == 'assigned') {
					msg += ' to ' + activity.event.assignee.login;
				}
			break;
			case 'issue_comment':
				var url = activity.event.comment.html_url;
				msg = username + ' commented on issue #<a href="' + url + '">' + issueNumber + ": " + Ols.StringUtils.truncate(issueTitle, 100) + '</a>';
			break;
			default:
				msg = "ERR: Unsupported GitHub event ocurred for activity message: " + activity.eventType;
			break;
		}
		return msg;
	},

	generateActivityContent: function(activity) {
		var msg = "";
		switch(activity.eventType) {
			case 'issues':
				msg = activity.event.issue.body;
			break;
			case 'issue_comment':
				msg = activity.event.comment.body;
			break;
			default:
			msg = "ERR: Unsupported GitHub event ocurred for activity content: " + activity.eventType;
			break;
		}
		return msg;
	},

	showActivityContent: function(activity) {
		var show = false;
		switch(activity.eventType) {
			case 'issues':
				show = activity.event.issue.body && activity.event.issue.body.length > 0; 
				break;
			case 'issue_comment': show = true; break;
		}
		return show;
	}


}

if(Meteor.isServer) {

	JsonRoutes.add("post", "/ols/webhook/github/project/:projectId/board/:boardId/", function (req, res, next) {
		//console.log("GITHUB WEBHOOK BOOM");
		console.log("req.body: " + JSON.stringify(req.body, null, 4));
		//console.log('req.headers' + JSON.stringify(req.headers));
		var eventType = req.headers['x-github-event'];

		var project = Ols.Project.get(req.params.projectId);
		var board = Ols.Board.get(req.params.boardId);

		if(project == null) {
			JsonRoutes.sendResult(res, 404, "{'ok': false, 'error': 'project doesn't exist}");
		} else if(project == null) {
			JsonRoutes.sendResult(res, 404, "{'ok': false, 'error': 'board doesn't exist}");
		} else {
			console.log("sending webhookEvent");
			Ols.Activity.insertWebHookActivityMessage({
				type: Ols.MSG_TYPE_ACTIVITY,
				activityType: Ols.ACTIVITY_TYPE_WEBHOOK_EVENT,
				webHookType: Ols.GitHub.GITHUB_WEBHOOK_EVENT,
				eventType: eventType,
				event: req.body,
				projectId: project._id,
				boardId: board._id,
				createdAt: new Date(),
				createdBy: 'github',
				activityImageUrl: 'https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'
				//activityImageUrl: 'packages/ols_github/images/GitHub-Mark-32px.png'
			});
			console.log("SENDING NOW...");
			JsonRoutes.sendResult(res, 200);
			console.log("RESPONSE SENT");
		}
	});
}
