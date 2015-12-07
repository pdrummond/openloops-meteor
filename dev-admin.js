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

		'click #recalculate-label-counts': function() {
			$("#status").text("Recalculate label counts: working...");
			Meteor.call('recalculateLabelCounts', function(err, results) {
				if(err) {
					$("#status").text("Error recalculating label counts: " + err.reason);
				} else {
					$("#status").text("Recalculated label counts successfully.");
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
		},

		'click #remove-all-labels': function() {
			$("#status").text("Remove all labels: working...");
			Meteor.call('removeAllLabels', function(err, results) {
				if(err) {
					$("#status").text("Error removing all labels: " + err.reason);
				} else {
					$("#status").text("Removed all labels successfully.");
				}
			});
		},

		'click #add-item-tabs': function() {
			$("#status").text("Add Item Tabs: working...");
			Meteor.call('addItemTabs', function(err, results) {
				if(err) {
					$("#status").text("Error adding item tabs: " + err.reason);
				} else {
					$("#status").text("Added Item Tabs sucessfully. ");
				}
			});
		},
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

		recalculateLabelCounts: function() {
			console.log("> recalculateLabelCounts");
			Labels.find({}).forEach(function(label) {
				console.log("-- BEFORE label '" + label.title + "': open: " + label.numOpenMessages, ", closed: " + label.numClosedMessages);
				var numOpenMessages = Items.find({isOpen: true, labels: label._id}).count();
				var numClosedMessages = Items.find({isOpen: false, labels: label._id}).count();
				console.log("numOpenMessages: " + numOpenMessages);
				console.log("numClosedMessages: " + numClosedMessages);
				Labels.update(label._id, {$set: {numOpenMessages: numOpenMessages, numClosedMessages: numClosedMessages}});
				label = Labels.findOne(label._id);
				console.log("-- AFTER label '" + label.title + "': open: " + label.numOpenMessages, ", closed: " + label.numClosedMessages);
			});
			console.log("< recalculateLabelCounts");
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
		},

		removeAllLabels: function() {
			Labels.remove({});
			Items.find().forEach(function(item) {
				Items.update(item._id, {$set: {labels: []}});
			});
		},

		addItemTabs: function() {
			Items.find().forEach(function(item) {
				Items.update(item._id, {$set: {tabs: [
					{_id: 'messages', icon: 'fa-comments-o', label: "Messages", type: Ols.Item.Tab.TAB_TYPE_MESSAGE_HISTORY},
					{_id: 'activity', icon: 'fa-exchange', label: "Activity", type: Ols.Item.Tab.TAB_TYPE_ACTIVITY_HISTORY},
					{_id: Random.id(), icon: 'fa-check', label: "Todo List", type: Ols.Item.Tab.TAB_TYPE_CHECKLIST}
				], subItems: []}});
			});
		}
	})
}
