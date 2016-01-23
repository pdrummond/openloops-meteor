if(Meteor.isClient) {
	Session.setDefault('rightSidebarActiveTab', 'done-tab');

	Template.rightSidebar.onCreated(function() {
		Tracker.autorun(function() {
			var opts = {};
			opts.filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
			var currentProjectId = Session.get('currentProjectId');
			if(currentProjectId) {
				opts.filter.projectId = currentProjectId;
			}
			var currentBoardId = Session.get('currentBoardId');
			if(currentBoardId) {
				opts.filter.boardId = currentBoardId;
			}
			Meteor.subscribe('items', opts, function(err, result) {
				if(err) {
					Ols.Error.showError("Items Subscription error", err);
				}
			});
		});
	});

	Template.rightSidebar.onRendered(function() {
		console.trace("rightSidebar.onRendered");
	});

	Template.rightSidebar.helpers({

		filterSentence: function() {
			var str = '<i class="fa fa-circle"></i> Showing all items.';
			var filterSentence = Session.get('filterSentence');
			if(filterSentence != null) {
				str = filterSentence;
			}
			return str;
		},

		noItems: function() {
			return Ols.Item.find(OpenLoops.getFilterQuery(Session.get('filterQuery'))).count() == 0;
		},

		noFilter: function() {
			var filterQuery = Session.get('filterQuery');
			return !(filterQuery && filterQuery.length > 0);
		},

		activeTabClass: function(tabName) {
			return Session.get('rightSidebarActiveTab') == tabName ? 'tab-active' : '';
		},

		items: function() {
			return Ols.Item.find(OpenLoops.getFilterQuery(Session.get('filterQuery')), {sort: {updatedAt: -1}});
		},

		filters: function() {
			return Filters.find({boardId: Session.get('currentBoardId')});
		},

		activeListLabel: function() {
			var label = "Inbox";
			var activeFilterLabel = Session.get('activeFilterLabel');
			if(activeFilterLabel) {
				label = activeFilterLabel;
			}
			return label;
		},

		isBoardItemActive: function() {
			return Session.get('currentItemId')?'':'active';
		},

		showActiveItemMsgClass: function() {
			return Session.get('currentItemId')?'':'hide';
		}
	});

	Template.rightSidebar.events({

		'click #new-item-link': function() {
			Ols.Router.showCreateItemPage();
		},

		'click #clear-filter-link': function() {
			Session.set('filterQuery', '');
		},

		'click .tabs-header #items-tab': function() {
			Session.set('rightSidebarActiveTab', 'items-tab');
		},

    'click .tabs-header #feed-tab': function() {
      Session.set('rightSidebarActiveTab', 'feed-tab');
    },

    'click .tabs-header #done-tab': function() {
			Session.set('rightSidebarActiveTab', 'done-tab');
		},

		'click .tabs-header #labels-tab': function() {
			Session.set('rightSidebarActiveTab', 'labels-tab');
		},

		'click .tabs-header #filters-tab': function() {
			Session.set('rightSidebarActiveTab', 'filters-tab');
		},

		'click .tabs-header #members-tab': function() {
			Session.set('rightSidebarActiveTab', 'members-tab');
		},

		'click .tabs-header #now-tab': function() {
			Session.set('rightSidebarActiveTab', 'now-tab');
		},

		'click #board-item': function() {
			Ols.Router.showBoardMessages();
		},

		'click #search-link': function() {
			Session.set('showSidebarTabs', false);
		},

		'click #back-arrow-link': function() {
			Session.set('showSidebarTabs', true);
			Session.set('filterQuery', null);
		},

		'click #clear-active-item-icon': function() {
			Ols.Router.showBoardMessages();
		},

		'click #clear-active-filter-icon': function() {
			Session.set('filterQuery', null);
			Session.set('filterSentence', null);
		}
	});
}
