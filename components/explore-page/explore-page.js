if(Meteor.isClient) {
	Template.explorePage.helpers({
		currentProjectBoards: function() {
			return Ols.Board.find({projectId: Session.get('currentProjectId')});
		},

		allUserProjects: function() {
			if(Ols.User.userIsAdmin()) {
				return Ols.Project.find();
			} else {
				return Ols.Project.find({'members.username': Meteor.user().username});
			}
		}
	});

	Template.boardBoxItem.events({
		'click': function() {
			Ols.Router.showBoardMessages(this._id);
			Ols.Explore.setExploreMode(false);
		}
	});
}
