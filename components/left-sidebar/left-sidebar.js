if(Meteor.isClient) {
	Session.setDefault('leftSidebarActiveTab', 'project-summary-tab');

	Template.leftSidebar.onRendered(function() {
		console.trace("leftSidebar.onRendered");
	});

	Template.leftSidebar.helpers({

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
			return Session.get('leftSidebarActiveTab') == tabName ? 'tab-active' : '';
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

	Template.leftSidebar.events({

		'click #new-item-link': function() {
			Ols.Router.showCreateItemPage();
		},

		'click #clear-filter-link': function() {
			Session.set('filterQuery', '');
		},

    'click .tabs-header #project-summary-tab': function() {
      Session.set('leftSidebarActiveTab', 'project-summary-tab');
    },

    'click .tabs-header #feed-tab': function() {
      Session.set('leftSidebarActiveTab', 'feed-tab');
    },

		'click .tabs-header #search-tab': function() {
			Session.set('leftSidebarActiveTab', 'search-tab');
		},

    'click .tabs-header #discussions-tab': function() {
			Session.set('leftSidebarActiveTab', 'discussions-tab');
		},

		'click .tabs-header #posts-tab': function() {
			Session.set('leftSidebarActiveTab', 'posts-tab');
		},

		'click .tabs-header #questions-tab': function() {
			Session.set('leftSidebarActiveTab', 'questions-tab');
		},

		'click .tabs-header #requirements-tab': function() {
			Session.set('leftSidebarActiveTab', 'requirements-tab');
		},

		'click .tabs-header #now-tab': function() {
			Session.set('leftSidebarActiveTab', 'now-tab');
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
