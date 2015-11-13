if(Meteor.isClient) {
	Template.devAdminPage.events({
		'click #add-default-project': function() {
			$("#status").text("Add Default Project: creating project...");
			Meteor.call('addDefaultProject', function(err, results) {
				if(err) {
					$("#status").text("Error adding default project: " + err.reason);
				} else {
					$("#status").text("Added Default Project sucessfully. " + results.numBoards + " orphan boards added.");
				}
			});
		}
	});
}

if(Meteor.isServer) {
	Meteor.methods({
		addDefaultProject: function() {
			var defaultProjectId;
			var defaultProject = Projects.findOne({defaultProject: true});
			if(defaultProject == null) {
				console.log("creating new default project");
				defaultProjectId = Projects.insert({
					title: "Default Project",
					defaultProject:true
				});
			} else {
				console.log("Default project already exists");
				defaultProjectId = defaultProject._id;
			}
			var numBoards = Boards.update({projectId: {$exists: false}}, {$set: {projectId: defaultProjectId}}, {multi:true});
			var results = {
				numBoards: numBoards
			};
			console.log("Added to default board: " + JSON.stringify(results, null, 4));
			return results;
		}
	})
}
