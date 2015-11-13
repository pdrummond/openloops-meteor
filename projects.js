
if(Meteor.isClient) {
	Template.projectList.helpers({
		projects: function() {
			return Projects.find();
		}
	});

	Template.editProjectForm.events({
		'click #save-button': function(e) {
			e.preventDefault();
			var title = $("#editProjectForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var description = $("#editProjectForm textarea[name='description']").val();
				Meteor.call('insertProject', {
					title: title,
					description: description
				});
				FlowRouter.go("/projects");
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
				updatedAt: now
			}, newProject);

			var projectId = Projects.insert(newProject);
			return projectId;
		},
	})
}
