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

	Template.projectExploreItem.helpers({
		boards: function() {
			return Ols.Board.find({projectId: this._id});
		}
	});

	Template.boardBoxItem.helpers({
		favouriteClass: function() {
			return this.favourite?'favourite':'';
		}
	});

	Template.boardBoxItem.events({
		'click .board-star-icon': function(e) {
			e.preventDefault();
			Meteor.call('toggleBoardFavourite', this._id, function(err) {
				if(err) {
					Ols.Error.showError('Error toggling favourite', err);
				}
			});
		},

		'click .title': function(e) {
			e.preventDefault();
			Ols.Router.showBoardMessages(this._id);
			Ols.Explore.setExploreMode(false);
		}
	});
}
