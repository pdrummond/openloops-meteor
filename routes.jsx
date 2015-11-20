FlowRouter.route('/react/project/:projectId/board/:boardId', {
	action: function(params, queryParams) {
		Ols.Context.setFromRoute(this);
		ReactLayout.render(App, {content: <MessageHistoryView />});
		Session.set('numIncomingMessages', 0);
		OpenLoops.removeSidebarNewMessages();
	}
});
