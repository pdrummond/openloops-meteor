Ols.User = {
	getProfileImageUrl: function(username) {
		var url = "";
		var user = Meteor.users.findOne({username:username});
		url = user.profileImage?user.profileImage:Gravatar.imageUrl("no.openloops@email.wha", {size:64 ,default: 'mm'});
		return url;
	},

	userIsAdmin: function() {
		return this.currentUserRole() == Ols.ROLE_ADMIN;
	},

	currentUserRole: function() {
		var canShow = false;
		var user = Meteor.user();
		if(user) {
			var email = user.emails[0].address;
			var teamMember = TeamMembers.findOne({email: email});
			return teamMember.role;
		} else {
			return '';
		}
	}
}
