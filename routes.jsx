FlowRouter.route('/react/project/:projectId/board/:boardId', {
	action: function(params, queryParams) {
		Session.set('currentProjectId', params.projectId);
		Session.set('currentBoardId', params.boardId);
		Session.set('currentItemId', null);
		ReactLayout.render(MainLayout, {content: <MessageHistoryView />});
		Session.set('numIncomingMessages', 0);
		OpenLoops.removeSidebarNewMessages();
	}
});
