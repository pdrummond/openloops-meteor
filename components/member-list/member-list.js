if(Meteor.isClient) {

	Template.memberList.helpers({

		projectUsers: function() {
			return Meteor.users.find();
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

  Template.userCard.events({
    'click #add-queue': function() {
      var queue = {title:this.username, 'type': 'USER_QUEUE', 'username': this.username};
      Meteor.call('addQueue', Session.get('currentWorkspaceId'), queue, function(err, res) {
        if(err) {
          alert("Error - unable to add queue: " + err);
        }
      });
    }
  })
}
