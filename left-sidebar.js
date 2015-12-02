if(Meteor.isClient) {
	Session.setDefault('leftSidebarActiveTab', 'items-tab');

	Template.leftSidebar.helpers({

		activeTabClass: function(tabName) {
			return Session.get('leftSidebarActiveTab') == tabName ? 'tab-active' : '';
		},

		items: function() {
			var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
			filter.projectId = Session.get('currentProjectId');
			var currentBoardId = Session.get('currentBoardId');
			if(currentBoardId) {
				filter.boardId = currentBoardId;
			}

			if(filter.hasOwnProperty('show')) {
				if(filter.show == 'all') {
					delete filter.isOpen;
					delete filter.show;
				}
			}
			return Items.find(filter, {sort: {updatedAt: -1}});
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
	});

	Template.leftSidebar.events({
		'click #items-tab': function() {
			Session.set('leftSidebarActiveTab', 'items-tab');
		},

		'click #labels-tab': function() {
			Session.set('leftSidebarActiveTab', 'labels-tab');
		},

		'click #boards-dropdown-button': function() {
			$("#board-chooser-menu").slideToggle();
		},

		'click #board-item': function() {
			Ols.Router.showHomeMessages();
		},

		'click #search-link': function() {
			Session.set('showSidebarTabs', false);
		},

		'click #back-arrow-link': function() {
			Session.set('showSidebarTabs', true);
			Session.set('filterQuery', null);
		}
	});
}
