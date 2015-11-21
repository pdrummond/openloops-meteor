FlowRouter.route('/react/project/:projectId/board/:boardId', {
	name: 'boardMessages',
	action: function(params, queryParams) {
		Ols.Context.setFromRoute(this);
		ReactLayout.render(App, {content: <MessageHistoryView />});
		Session.set('numIncomingMessages', 0);
		OpenLoops.removeSidebarNewMessages();
	}
});

FlowRouter.route('/react/project/:projectId/board/:boardId/item/:itemId/messages', {
	name: 'itemMessages',
	action: function(params, queryParams) {
		Ols.Context.setFromRoute(this);
		ReactLayout.render(App, {content: <MessageHistoryView />});
		Session.set('numIncomingMessages', 0);
		OpenLoops.removeSidebarNewMessages();
	}
});
