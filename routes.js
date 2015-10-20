FlowRouter.subscriptions = function() {
	this.register('boards', Meteor.subscribe('boards'));
  	this.register('items', Meteor.subscribe('items'));
};

FlowRouter.route('/', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
		Session.set('currentItemId', null);
		Session.set('numIncomingMessages', 0);
		Session.set('filterQuery', null);

		OpenLoops.loadInitialMessages();
	}
});

FlowRouter.route('/feed/search', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
		Session.set('currentItemId', null);
		Session.set('numIncomingMessages', 0);
		Session.set('filterQuery', queryParams.query);

		OpenLoops.loadInitialMessages();
	}
});

FlowRouter.route('/item/:itemId', {
	action: function(params, queryParams) {
		Session.set('currentItemId', params.itemId);
		Session.set('currentPage', 'feedPage');
		Session.set('numIncomingMessages', 0);
		Session.set('filterQuery', null);
		OpenLoops.loadInitialMessages();
		OpenLoops.removeSidebarNewMessages(params.itemId);
	}
});

FlowRouter.route('/create', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'createPage');
	}
});
