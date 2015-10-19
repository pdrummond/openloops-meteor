FlowRouter.subscriptions = function() {
	this.register('boards', Meteor.subscribe('boards'));
  	this.register('items', Meteor.subscribe('items'));
};

FlowRouter.route('/', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
		Session.set('currentItemId', null);
		Session.set('numIncomingMessages', 0);

		Session.set('currentTypeFilter', null);
		Session.set('currentItemTypeFilter', null);		

		OpenLoops.loadInitialMessages();
	}
});

FlowRouter.route('/feed/open-issues', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
		Session.set('currentItemId', null);
		Session.set('numIncomingMessages', 0);

		Session.set('currentTypeFilter', 'MSG_TYPE_ITEM');
		Session.set('currentItemTypeFilter', 'issue');

		OpenLoops.loadInitialMessages();
	}
});

FlowRouter.route('/feed/articles', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
		Session.set('currentItemId', null);
		Session.set('numIncomingMessages', 0);

		Session.set('currentTypeFilter', 'MSG_TYPE_ITEM');
		Session.set('currentItemTypeFilter', 'article');

		OpenLoops.loadInitialMessages();
	}
});

FlowRouter.route('/feed/discussions', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
		Session.set('currentItemId', null);
		Session.set('numIncomingMessages', 0);

		Session.set('currentTypeFilter', 'MSG_TYPE_ITEM');
		Session.set('currentItemTypeFilter', 'discussion');

		OpenLoops.loadInitialMessages();
	}
});


FlowRouter.route('/item/:itemId', {
	action: function(params, queryParams) {
		Session.set('currentItemId', params.itemId);
		Session.set('currentPage', 'feedPage');
		Session.set('numIncomingMessages', 0);
		OpenLoops.loadInitialMessages();
		OpenLoops.removeSidebarNewMessages(params.itemId);
	}
});

FlowRouter.route('/create', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'createPage');

		Session.set('currentTypeFilter', null);
		Session.set('currentItemTypeFilter', null);

	}
});
