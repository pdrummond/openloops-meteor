if(Meteor.isClient) {
	Session.setDefault('leftSidebarActiveTab', 'items-tab');

	Template.leftSidebar.onCreated(function() {
		Tracker.autorun(function() {
			var opts = {};
			opts.filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
			if(Session.get('userDashboard') != null) {
				opts.userDashboard = Session.get('userDashboard');
			} else {
				opts.filter.projectId = Session.get('currentProjectId');
				var currentBoardId = Session.get('currentBoardId');
				if(currentBoardId) {
					opts.filter.boardId = currentBoardId;
				}
			}
			Meteor.subscribe('items', opts, function(err, result) {
				if(err) {
					alert("Items Subscription error: " + err);
				}
			});
		});
	});

	Template.leftSidebar.helpers({

		activeTabClass: function(tabName) {
			return Session.get('leftSidebarActiveTab') == tabName ? 'tab-active' : '';
		},

		items: function() {
			return Items.find({}, {sort: {updatedAt: -1}});
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
		}
	});

	Template.leftSidebar.events({
		'click #items-tab': function() {
			Session.set('leftSidebarActiveTab', 'items-tab');
		},

		'click #labels-tab': function() {
			Session.set('leftSidebarActiveTab', 'labels-tab');
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
