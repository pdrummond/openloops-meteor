Ols.User = {
	getProfileImageUrl: function(username) {
		var url = "";
		var user = Meteor.users.findOne({username:username});
		url = user.profileImage?user.profileImage:Gravatar.imageUrl("no.openloops@email.wha", {size:64 ,default: 'mm'});
		return url;
	}

}
