Meteor.methods({
	insertProject: function(newProject) {
		check(newProject, {
			title: String,
			key: String,
			description: Match.Optional(String),
			defaultBoardId: Match.Optional(String),
		});

		if(newProject.key.length == 0) {
			throw new Meteor.Error("insert-project-failure-001", "Project key cannot be empty");
		}

		newProject.key = newProject.key.toUpperCase();

		if(Ols.Project.findOne({key:newProject.key}) != null) {
			throw new Meteor.Error("insert-project-failure-002", "Project with key '" + newProject.key + "' already exists");
		}

		var now = new Date().getTime();
		newProject = _.extend({
			createdAt: now,
			createdBy: Meteor.user().username,
			updatedAt: now,
			members: [{username:Meteor.user().username, role:'ADMIN'}],
			numMessages: 0
		}, newProject);

		var projectId = Ols.Project.insert(newProject);
		return projectId;
	},

	updateProject: function(projectId, attrs) {
		check(projectId, String);
		check(attrs, {
			title: String,
			key: String,
			description: Match.Optional(String),
			defaultBoardId: Match.Optional(String)
		});
		var project = Ols.Project.findOne(projectId);

		if(attrs.key != project.key) {

			if(attrs.key.length == 0) {
				throw new Meteor.Error("insert-project-failure-001", "Project key cannot be empty");
			}

			attrs.key = attrs.key.toUpperCase();

			if(Ols.Project.findOne({key:attrs.key}) != null) {
				throw new Meteor.Error("insert-project-failure-002", "Project with key '" + attrs.key + "' already exists");
			}
		}

		Ols.Project.update(projectId, {$set: attrs});
	},

	deleteProject: function(projectId) {
		Ols.Item.remove({projectId: projectId});
		Ols.ServerMessage.remove({projectId: projectId});
		Ols.Board.remove({projectId: projectId});
		Ols.Project.remove(projectId);
	},

	insertProjectMember: function(projectId, member) {
		if(Ols.Project.findOne({members: member.username}) != null) {
			throw new Meteor.Error("insert-project-member-error-001", 'Member ' + member.username + ' already exists');
		}
		Ols.Project.update(projectId, {$addToSet: {members: member}});
	},

	updateProjectMember: function(projectId, projectMemberUsername, member) {
		Ols.Project.update({_id: projectId, 'members.username': projectMemberUsername}, {$set: {'members.$': member}});
	},

	removeProjectMember: function(projectId, projectMemberUsername) {
		console.log("removeProjectMember projectId: "+ projectId + ", username: " + projectMemberUsername);
		var updates = Ols.Project.update(projectId, {$pull: {members: {username: projectMemberUsername}}});
		console.log("removeProjectMember numUpdates: " + updates);
	}
});

Meteor.publish("projects", function() {
	console.log("Publishing all projects");
	return Ols.Project.find();
});
