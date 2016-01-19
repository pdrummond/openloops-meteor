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

    var username = user.username;
		var email = user.emails[0].address;
    Workspaces.insert({
      username: username,
      title: username,
      queues: [
                {title:username, 'type': 'USER_QUEUE', 'username': username},
              ]
    });
    Projects.insert({
      title: "Default",
      key: username.toUpperCase(),
      description: "Your very own personal space - only you can see the cards in here",
      members: [{
          role: 'ADMIN',
          username: username,
      }]
    });
    var email = user.emails[0].address;
    TeamMembers.insert({
      email: email,
      role: "ADMIN",
    });

		user.profileImage = Gravatar.imageUrl(email, {size: 50,default: 'wavatar'});

		// We still want the default hook's 'profile' behavior.
		if (options.profile) {
			user.profile = options.profile;
		}
		return user;
	});

}
