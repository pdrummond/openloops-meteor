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
		},

		'click #recount-board-messages': function() {
			$("#status").text("Recount Board Messages: working...");
			Meteor.call('recountBoardMessages', function(err, results) {
				if(err) {
					$("#status").text("Error recounting board messages: " + err.reason);
				} else {
					$("#status").text("Recounted board messages successfully.");
				}
			});
		},

		'click #recount-item-messages': function() {
			$("#status").text("Recount Item Messages: working...");
			Meteor.call('recountItemMessages', function(err, results) {
				if(err) {
					$("#status").text("Error recounting item messages: " + err.reason);
				} else {
					$("#status").text("Recounted item messages successfully.");
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
		},

		recountBoardMessages: function() {
			console.log("> recountBoardMessages");
			Boards.find().forEach(function(board) {
				console.log("-- BEFORE num messages for board '" + board.title + "': " + board.numMessages);
				var numMessages = ServerMessages.find({boardId: board._id}).count();
				Boards.update(board._id, {$set: {numMessages: numMessages}});
				board = Boards.findOne(board._id);
				console.log("-- AFTER num messages for board '" + board.title + "': " + board.numMessages);
			});
			console.log("< recountBoardMessages");
		},

		recountItemMessages: function() {
			console.log("> recountItemMessages");
			Items.find({}).forEach(function(item) {
				console.log("-- BEFORE num messages for item '" + item.title + "': " + item.numMessages);
				var numMessages = ServerMessages.find({itemId: item._id}).count();
				Items.update(item._id, {$set: {numMessages: numMessages}});
				item = Items.findOne(item._id);
				console.log("-- AFTER num messages for item '" + item.title + "': " + item.numMessages);
			});
			console.log("< recountItemMessages");
		}
	})
}
