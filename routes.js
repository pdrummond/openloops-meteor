FlowRouter.route('/', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
	}
});

FlowRouter.route('/item/:itemId', {
	action: function(params, queryParams) {
		Session.set('currentItemId', params.itemId);
		Session.set('currentPage', 'feedPage');
		// Attach an handler for a specific message
	}
});

FlowRouter.route('/create', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'createPage')
	}
});
