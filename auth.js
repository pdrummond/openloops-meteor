if(Meteor.isServer) {

	Accounts.onCreateUser(function(options, user) {
		console.log("newUser: " + JSON.stringify(user));

		var email = user.emails[0].address;
		console.log("number of team members: " + TeamMembers.find({}).count());
		if(TeamMembers.find({}).count() == 0) {
			TeamMembers.insert({
				email: email,
				role: 'admin'
			});
			console.log("Added Team Member " + email);
		} else {
			var teamMember = TeamMembers.findOne({email:email});
			if(teamMember == null) {
				throw new Meteor.Error("create-user-failed-001", "Sorry, but you aren't a member of this OpenLoops Team yet");
			}
		}

		//user.profileImage = Gravatar.imageUrl(email, {size: 34,default: 'retro'});
		// We still want the default hook's 'profile' behavior.
		if (options.profile) {
			user.profile = options.profile;
		}
		return user;
	});

}
