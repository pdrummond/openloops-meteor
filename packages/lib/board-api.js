Ols.Board = {
	getCurrent: function() {
		return Boards.findOne(Session.get('currentBoardId'));
	},

	get: function(boardId) {
		return Boards.findOne(boardId);
	}
}
