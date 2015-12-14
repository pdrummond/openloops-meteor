if(Meteor.isClient) {

	FlowRouter.route('/project/:projectId/manage-members', {
		name: 'manageProjectMembersPage',
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "projectMembersList"});
		}
	});

	FlowRouter.route('/project/:projectId/project-member/create', {
		name: 'createProjectMemberPage',
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentProjectMemberUsername', null);
			BlazeLayout.render("app", {currentPage: "editProjectMemberForm"});
		}
	});

	FlowRouter.route('/project/:projectId/project-member/:projectMemberUsername/edit', {
		name: 'createProjectMemberPage',
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentProjectMemberUsername', params.projectMemberUsername);
			BlazeLayout.render("app", {currentPage: "editProjectMemberForm"});
		}
	});
}

if(Meteor.isClient) {
	Template.projectMembersList.helpers({
		projectMembers: function() {
			var project = Projects.findOne(Session.get('currentProjectId'))
			return project && project.members?project.members:[];
		}
	});

	Template.editProjectMemberForm.events({
		'click #save-button': function(e) {
			e.preventDefault();

			var currentProjectMemberUsername = Session.get('currentProjectMemberUsername');
			if(!currentProjectMemberUsername) {
				Meteor.call('insertProjectMember', Session.get('currentProjectId'), {
					username: $("#editProjectMemberForm input[name='username']").val(),
					role: $("#editProjectMemberForm select[name='role']").val(),
				});
			} else {
				Meteor.call('updateProjectMember', Session.get('currentProjectId'), currentProjectMemberUsername, {
					username: $("#editProjectMemberForm input[name='username']").val(),
					role: $("#editProjectMemberForm select[name='role']").val(),
				});
			}
			FlowRouter.go("manageProjectMembersPage", {projectId: Session.get('currentProjectId')});
		}
	});

	Template.editProjectMemberForm.helpers({
		currentProjectMember: function() {
			var result = {};
			var project = Projects.findOne(Session.get('currentProjectId'));
			if (project && project.members) {
				var member = _.findWhere(project.members, {username: Session.get('currentProjectMemberUsername')});
				if(member != null) {
					result = member;
				}
			}
			return result;
		},

		isSelectedRole: function(role) {
			var result = '';
			var project = Projects.findOne(Session.get('currentProjectId'));
			if (project && project.members) {
				var member = _.findWhere(project.members, {username: Session.get('currentProjectMemberUsername')});
				result = member.role == role ? 'selected':'';
			}
			return result;
		},

		isUsernameFieldDisabled: function() {
			return Session.get('currentProjectMemberUsername') != null?'':'disabled';
		}
	});

	Template.projectMemberItem.events({
		'click #delete-link': function() {
			Meteor.call('removeProjectMember', Session.get('currentProjectId'), this.username, function(err) {
				if(err) {
					Ols.Error.showError("Error removing project member", err);
				}
			});
		}
	})
}

if(Meteor.isServer) {

	Meteor.methods({

		insertProjectMember: function(projectId, member) {
			if(Projects.findOne({members: member.username}) != null) {
				throw new Meteor.Error("insert-project-member-error-001", 'Member ' + member.username + ' already exists');
			}
			Projects.update(projectId, {$addToSet: {members: member}});
		},

		updateProjectMember: function(projectId, projectMemberUsername, member) {
			Projects.update({_id: projectId, 'members.username': projectMemberUsername}, {$set: {'members.$': member}});
		},

		removeProjectMember: function(projectId, projectMemberUsername) {
			console.log("removeProjectMember projectId: "+ projectId + ", username: " + projectMemberUsername);
			var updates = Projects.update(projectId, {$pull: {members: {username: projectMemberUsername}}});
			console.log("removeProjectMember numUpdates: " + updates);
		}
	});



}
