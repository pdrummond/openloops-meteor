if(Meteor.isClient) {

	Template.topBanner.onCreated(function() {
		Ols.Explore.initExploreMode(this);
	});

	Template.topBanner.events({

		'click #header-title': function() {
			Session.set('filterQuery', null);
			Session.set('filterSentence', null);
			Session.set('currentItemId', null);
		},

		'click #explore-link': function() {
			var exploreMode = Ols.Explore.toggleExploreMode();
		},

		'click .project-breadcrumb': function() {
			FlowRouter.go("/project/" + Session.get('currentProjectId'));
		},

		'click #boards-dropdown-button': function() {
			$("#board-chooser-menu").slideToggle();
		},

		'click #create-link': function() {
			Ols.Router.showCreateItemPage();
		}
	});

	Template.topBanner.helpers({

		headerProjectTitle: function() {
			var project = Ols.Project.findOne(Session.get('currentProjectId'));
			return project?project.title:'';
		},

		headerBoardTitle: function() {
			var board = Boards.findOne(Session.get('currentBoardId'));
			return board?board.title:'';
		}
	});

}
