
if(Meteor.isClient) {
	Template.projectList.helpers({
		projects: function() {
			if(Ols.User.userIsAdmin()) {
				return Ols.Project.find();
			} else {
				return Ols.Project.find({'members.username': Meteor.user().username});
			}
		},

		projectsListEmpty: function() {
			var projects;
			if(Ols.User.userIsAdmin()) {
				projects = Ols.Project.find();
			} else {
				projects = Ols.Project.find({'members.username': Meteor.user().username});
			}
			return projects.count() == 0;
		}
	});

	Template.projectItem.helpers({
		projectSelectedLink: function() {
			return "/project/" + this._id;
		}
	})

	Template.editProjectForm.helpers({
		currentProject: function() {
			console.log("current project id: " + Session.get('currentProjectId'));
			var project = Ols.Project.findOne(Session.get('currentProjectId'));
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
			var project = Ols.Project.findOne(currentProjectId);
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
