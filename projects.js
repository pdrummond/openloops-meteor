
if(Meteor.isClient) {
	Template.projectList.helpers({
		projects: function() {
			return Projects.find();
		}
	});

	Template.editProjectForm.helpers({
		currentProject: function() {
			console.log("current project id: " + Session.get('currentProjectId'));
			var project = Projects.findOne(Session.get('currentProjectId'));
			return project?project:{};
		}
	});

	Template.editProjectForm.events({
		'click #save-button': function(e) {
			e.preventDefault();

			var title = $("#editProjectForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var projectAttrs = {
					title: title,
					key: $("#editProjectForm input[name='key']").val(),
					description: $("#editProjectForm textarea[name='description']").val()
				};
				var currentProjectId = Session.get('currentProjectId');
				if(currentProjectId == null) {
					Meteor.call('insertProject', projectAttrs, function(err) {
						if(err) {
							alert("Error inserting project: " + err.reason);
						} else {
							FlowRouter.go("/projects");
						}
					});
				} else {
					Meteor.call('updateProject', currentProjectId, projectAttrs, function(err) {
						if(err) {
							alert("Error updating project: " + err.reason);
						} else {
							FlowRouter.go("/projects");
						}
					});
				}

			}
		}
	});

	Template.deleteProjectForm.events({
		'click #delete-project': function(e) {
			e.preventDefault();
			var title = $("#deleteProjectForm input[name='project-title']").val();
			var currentProjectId = Session.get('currentProjectId');
			var project = Projects.findOne(currentProjectId);
			if(title != project.title) {
				alert("That name doesn't match the title of the project");
			} else {
				Meteor.call('deleteProject', currentProjectId, function(err) {
					if(err) {
						alert("Unable to delete project: " + err.reason);
					} else {
						FlowRouter.go("/projects");
					}
				})
			}
		}
	})
}

Projects = new Meteor.Collection("projects");

if(Meteor.isServer) {

	Meteor.publish("projects", function() {
		return Projects.find();
	});

	Meteor.methods({
		insertProject: function(newProject) {
			var now = new Date().getTime();
			newProject = _.extend({
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
				members: [],
				numMessages: 0
			}, newProject);

			var projectId = Projects.insert(newProject);
			return projectId;
		},

		updateProject: function(projectId, attrs) {
			var project = Projects.findOne(projectId);
			Projects.update(projectId, {$set: attrs});
		},

		deleteProject: function(projectId) {
			Items.remove({projectId: projectId});
			ServerMessages.remove({projectId: projectId});
			Boards.remove({projectId: projectId});
			Projects.remove(projectId);
		}
	})
}
