if(Meteor.isClient) {
	Template.loginPage.events({
		'submit #login-form' : function(e, t){
			e.preventDefault();
			// retrieve the input field values
			var email = t.find('#login-email').value;
			var password = t.find('#login-password').value;

			// Trim and validate your fields here....

			// If validation passes, supply the appropriate fields to the
			// Meteor.loginWithPassword() function.
			Meteor.loginWithPassword(email, password, function(err){
				if (err) {
					Session.set("errorMessage", err.reason);
				} else {
					FlowRouter.go("welcome");
				}
			});
			return false;
		}
	});

	Template.signupPage.events({
		'submit #signup-form' : function(e, t) {
			e.preventDefault();
			var username = t.find('#account-username').value;
			var email = t.find('#account-email').value;
			var password = t.find('#account-password').value;

			username = username.trim();
			email = email.trim();
			password = password.trim();

			Accounts.createUser({
				username: username,
				email: email,
				password : password}, function(err) {
				if (err) {
					Session.set("errorMessage", err.reason);
				} else {
					FlowRouter.go("welcome");
				}

			});

			return false;
		}
	});
}

if(Meteor.isServer) {

	Accounts.onCreateUser(function(options, user) {
		console.log("newUser: " + JSON.stringify(user));

		var email = user.emails[0].address;
		console.log("number of team members: " + TeamMembers.find({}).count());
		if(TeamMembers.find({}).count() == 0) {
			var id = TeamMembers.insert({
				email: email,
				role: Ols.ROLE_ADMIN,
			});
			console.log("Added Team Member " + email + "(" + id + ")");
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
