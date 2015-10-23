FlowRouter.subscriptions = function() {
	this.register('boards', Meteor.subscribe('boards'));
	this.register('labels', Meteor.subscribe('labels'));
	this.register('filters', Meteor.subscribe('filters'));
};

FlowRouter.route('/', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'welcomePage');
	}
});

FlowRouter.route('/board/:boardId', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
		Session.set('currentBoardId', params.boardId);
		Session.set('currentItemId', null);
		Session.set('numIncomingMessages', 0);
		Session.set('filterQuery', null);

		OpenLoops.loadInitialMessages();
	}
});

FlowRouter.route('/board/:boardId/item/:itemId', {
	action: function(params, queryParams) {
		Session.set('currentBoardId', params.boardId);
		Session.set('currentItemId', params.itemId);
		Session.set('currentPage', 'feedPage');
		Session.set('numIncomingMessages', 0);
		Session.set('filterQuery', null);
		OpenLoops.loadInitialMessages();
		OpenLoops.removeSidebarNewMessages(params.itemId);
	}
});

FlowRouter.route('/board/:boardId/create-item', {
	action: function(params, queryParams) {
		Session.set('currentBoardId', params.boardId);
		Session.set('currentPage', 'editItemPage');
	}
});

FlowRouter.route('/board/:boardId/edit-item', {
	action: function(params, queryParams) {
		Session.set('currentBoardId', params.boardId);
		Session.set('currentPage', 'editItemPage');
	}
});

FlowRouter.route('/board/:boardId/create-filter', {
	action: function(params, queryParams) {
		Session.set('currentBoardId', params.boardId);
		Session.set('currentPage', 'createFilterPage');
	}
});

FlowRouter.route('/boards', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'boardList');
	}
});

FlowRouter.route('/boards/create', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'createBoardForm');
	}
});

FlowRouter.route('/board/:boardId/create-label', {
	action: function(params, queryParams) {
		Session.set('currentBoardId', params.boardId);
		Session.set('currentPage', 'editLabelPage');
	}
});
