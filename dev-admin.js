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

		'click #recount-project-messages': function() {
			$("#status").text("Recount Project Messages: working...");
			Meteor.call('recountProjectMessages', function(err, results) {
				if(err) {
					$("#status").text("Error recounting project messages: " + err.reason);
				} else {
					$("#status").text("Recounted project messages successfully.");
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
		},

		'click #set-item-pids': function() {
			$("#status").text("Set Item PIDS: working...");
			Meteor.call('setItemPids', function(err, results) {
				if(err) {
					$("#status").text("Error setting item PIDS: " + err.reason);
				} else {
					$("#status").text("Set all item PIDS successfully.");
				}
			});
		},

		'click #set-item-project-ids': function() {
			$("#status").text("Set Item Project ids: working...");
			Meteor.call('setItemProjectIds', function(err, results) {
				if(err) {
					$("#status").text("Error setting item project ids: " + err.reason);
				} else {
					$("#status").text("Set all item project ids successfully.");
				}
			});
		},

		'click #update-users-icon': function() {
			$("#status").text("Update users icon: working...");
			Meteor.call('updateUsersIcon', function(err, results) {
				if(err) {
					$("#status").text("Error setting users icon: " + err.reason);
				} else {
					$("#status").text("Set all user icons successfully.");
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

		recountProjectMessages: function() {
			console.log("> recountProjectMessages");
			Projects.find().forEach(function(project) {
				console.log("-- BEFORE num messages for project '" + project.title + "': " + project.numMessages);
				var numMessages = ServerMessages.find({projectId: project._id}).count();
				Projects.update(project._id, {$set: {numMessages: numMessages}});
				project = Projects.findOne(project._id);
				console.log("-- AFTER num messages for project '" + project.title + "': " + project.numMessages);
			});
			console.log("< recountProjectMessages");
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
		},

		setItemPids: function() {
			console.log("> setItemPids");
			Items.find({$or: [{pid: {$exists: false}}, {pid: 0}]}).forEach(function(item) {
				console.log("-- Item " + item.title + " has no pid");
				if(item.projectId == null) {
					console.error("-- Item " + item._id + " has no projectId! Skipping...");
				} else {
					var pid = incrementCounter('counters', item.projectId);
					Items.update(item._id, {$set: {pid: pid}});
					item = Items.findOne(item._id);
					console.log("-- New PID for item is " + item.pid);
				}
			});
			console.log("< setItemPids");
		},

		setItemProjectIds: function() {
			console.log("> setItemProjectIds");
			Items.find({projectId: {$exists: false}}).forEach(function(item) {
				console.log("-- Item " + item.title + " has no projectId");
				var board = Boards.findOne(item.boardId);
				if(board == null) {
					console.error("-- Item " + item._id + " has no board! Skipping...");
				} else {
					var projectId = board.projectId;
					Items.update(item._id, {$set: {projectId: projectId}});
					item = Items.findOne(item._id);
					console.log("-- New project ID for item is " + item.projectId);
				}
			});
			console.log("< setItemProjectIds");
		},

		updateUsersIcon: function() {
			Meteor.users.find().forEach(function(user) {
				Meteor.users.update(user._id, {$set: {profileImage: Gravatar.imageUrl(user.emails[0].address, {size: 50,default: 'wavatar'})}});
			});
		}
	})
}
