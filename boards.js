
if(Meteor.isClient) {
	Template.boardList.helpers({
		boards: function() {
			return Boards.find();
		}
	});

	Template.createBoardForm.events({
		'click #create-button': function(e) {
			e.preventDefault();
			var title = $("#createBoardForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var description = $("#createBoardForm textarea[name='description']").val();
				Meteor.call('insertBoard', {
					title: title,
					description: description
				});
				FlowRouter.go("/boards");
			}
		}
	});
}

Boards = new Meteor.Collection("boards");

if(Meteor.isServer) {

	Meteor.publish("boards", function() {
		return Boards.find();
	});

	Meteor.methods({
		insertBoard: function(newBoard) {
			var now = new Date().getTime();
			newBoard = _.extend({
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now
			}, newBoard);
			return Boards.insert(newBoard);
		},
	})
}
