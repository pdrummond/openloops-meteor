
if(Meteor.isClient) {
	Template.projectList.helpers({
		projects: function() {
			if(Ols.User.userIsAdmin()) {
				return Projects.find();
			} else {
				return Projects.find({'members.username': Meteor.user().username});
			}
		},

		projectsListEmpty: function() {
			var projects;
			if(Ols.User.userIsAdmin()) {
				projects = Projects.find();
			} else {
				projects = Projects.find({'members.username': Meteor.user().username});
			}
			return projects.count() == 0;
		}
	});

	Template.projectItem.helpers({
		projectSelectedLink: function() {
			var link = "/project/" + this._id;
			link += this.defaultBoardId && this.defaultBoardId.length > 0?"/board/" + this.defaultBoardId:"/manage-boards";
			return link;
		}
	})

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
					description: $("#editProjectForm textarea[name='description']").val(),
					defaultBoardId: $("#editProjectForm input[name='defaultBoardId']").val(),
				};
				var currentProjectId = Session.get('currentProjectId');
				if(currentProjectId == null) {
					Meteor.call('insertProject', projectAttrs, function(err) {
						if(err) {
							Ols.Error.showError("Error inserting project", err);
						} else {
							FlowRouter.go("/projects");
						}
					});
				} else {
					Meteor.call('updateProject', currentProjectId, projectAttrs, function(err) {
						if(err) {
							Ols.Error.showError("Error updating project", err);
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
				Ols.Error.showError("That name doesn't match the title of the project");
			} else {
				Meteor.call('deleteProject', currentProjectId, function(err) {
					if(err) {
						Ols.Error.showError("Unable to delete project", err);
					} else {
						FlowRouter.go("/projects");
					}
				})
			}
		}
	});
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
