if(Meteor.isClient) {
	Template.teamMembersList.helpers({
		teamMembers: function() {
			return TeamMembers.find();
		}
	});

	Template.editTeamMemberForm.helpers({
		email: function() {
			var teamMember = TeamMembers.findOne(Session.get('currentTeamMemberId'));
			return teamMember?teamMember.email:'';
		},

		firstName: function() {
			var teamMember = TeamMembers.findOne(Session.get('currentTeamMemberId'));
			return teamMember?teamMember.firstName:'';
		},

		surname: function() {
			var teamMember = TeamMembers.findOne(Session.get('currentTeamMemberId'));
			return teamMember?teamMember.surname:'';
		},

		isSelectedRole: function(role) {
			var teamMember = TeamMembers.findOne(Session.get('currentTeamMemberId'));
			return teamMember?(teamMember.role == role?'selected':''):'';
		}
	});

	Template.editTeamMemberForm.events({
		'click #save-button': function(e) {
			e.preventDefault();
			var email = $("#editTeamMemberForm input[name='email']").val();
			if(email != null && email.length > 0) {
				var currentTeamMemberId = Session.get('currentTeamMemberId');
				if(!currentTeamMemberId) {
					Meteor.call('addTeamMember', {
						email: email,
						firstName: $("#editTeamMemberForm input[name='firstName']").val(),
						surname: $("#editTeamMemberForm input[name='surname']").val(),
						role: $("#editTeamMemberForm select[name='role']").val(),
					});
				} else {
					Meteor.call('updateTeamMember', currentTeamMemberId, {
						email: email,
						firstName: $("#editTeamMemberForm input[name='firstName']").val(),
						surname: $("#editTeamMemberForm input[name='surname']").val(),
						role: $("#editTeamMemberForm select[name='role']").val(),
					});
				}
				FlowRouter.go("/team-members");
			}
		}
	});

	Template.teamMemberItem.events({
		'click #delete-link': function() {
			Meteor.call('removeTeamMember', this._id, function(err) {
				if(err) {
					alert(err.message);
				}
			});
		}
	})
}

TeamMembers = new Meteor.Collection('team-members');

if(Meteor.isServer) {

	Meteor.publish("team-members", function() {
		return TeamMembers.find();
	});

	Meteor.methods({
		addTeamMember: function(newTeamMember) {
			var now = new Date().getTime();
			newTeamMember = _.extend({
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now
			}, newTeamMember);
			return TeamMembers.insert(newTeamMember);
		},

		updateTeamMember: function(teamMemberId, teamMember) {
			TeamMembers.update(teamMemberId, {$set: teamMember});
			return _.extend(teamMember, {_id: teamMemberId});
		},

		removeTeamMember: function(teamMemberId) {
			if(TeamMembers.find({role:'admin'}).count() == 1) {
				throw new Meteor.Error('delete-failed-001', 'Must have at least one ADMIN user');
			}
			TeamMembers.remove(teamMemberId);
		}
	});



}
