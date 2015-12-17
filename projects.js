
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

			if(Projects.findOne({key:newProject.key}) != null) {
				throw new Meteor.Error("insert-project-failure-002", "Project with key '" + newProject.key + "' already exists");
			}

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
			check(projectId, String);
			check(attrs, {
				title: String,
				key: String,
				description: Match.Optional(String),
				defaultBoardId: Match.Optional(String)
			});
			var project = Projects.findOne(projectId);

			if(attrs.key != project.key) {

				if(attrs.key.length == 0) {
					throw new Meteor.Error("insert-project-failure-001", "Project key cannot be empty");
				}

				attrs.key = attrs.key.toUpperCase();

				if(Projects.findOne({key:attrs.key}) != null) {
					throw new Meteor.Error("insert-project-failure-002", "Project with key '" + attrs.key + "' already exists");
				}
			}

			Projects.update(projectId, {$set: attrs});
		},

		deleteProject: function(projectId) {
			Ols.Item.remove({projectId: projectId});
			Ols.ServerMessage.remove({projectId: projectId});
			Ols.Board.remove({projectId: projectId});
			Ols.Project.remove(projectId);
		}
	})
}
