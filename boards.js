
if(Meteor.isClient) {
	Template.boardList.helpers({
		boards: function() {
			return Boards.find({projectId: Session.get('currentProjectId')});
		}
	});

	Template.createBoardForm.events({
		'click #create-button': function(e) {
			e.preventDefault();
			var title = $("#createBoardForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var description = $("#createBoardForm textarea[name='description']").val();
				Meteor.call('insertBoard', {
					projectId: Session.get('currentProjectId'),
					title: title,
					description: description
				});
				FlowRouter.go("/project/" + Session.get('currentProjectId') + "/boards");
			}
		}
	});
}

Boards = new Meteor.Collection("boards");

Meteor.methods({
	toggleBoardFavourite: function(boardId) {
		check(boardId, String);

		var board = Boards.findOne(boardId);

		var favourite = false;
		if(board.favourite) {
			favourite = board.favourite;
		}
		favourite = !favourite;
		Boards.update(boardId, {$set: {favourite: favourite}});
	}
});

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
				updatedAt: now,
				numMessages: 0
			}, newBoard);

			var boardId = Boards.insert(newBoard);

			Meteor.call('insertMessage', {
				type: Ols.MSG_TYPE_ACTIVITY,
				activityType: Ols.ACTIVITY_TYPE_NEW_BOARD,
				projectId: newBoard.projectId,
				boardId: boardId
			});

			return boardId;
		}
	})
}
