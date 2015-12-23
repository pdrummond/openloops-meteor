if(Meteor.isClient) {

	Template.memberList.helpers({

		projectUsers: function() {
			var project = Ols.Project.getCurrent();

			var projectUsers = [];
			Meteor.users.find().forEach(function(user) {
				if(_.findWhere(project.members, {username: user.username}) != null) {
					projectUsers.push(user);
				}
			});
			return projectUsers;
		}
	});

	Template.userCard.helpers( {

		isCurrentUser: function() {
			return this.username == Meteor.user().username;
		},

		userImageUrl: function() {
			return Ols.User.getProfileImageUrl(this.username);
		},

		state: function() {
			var state = 'offline';
			var user = Meteor.users.findOne({username:this.username});
			if(user && user.status) {
				state = user.status.online?'online':'offline';
			}
			return state;
		}
	});
}
