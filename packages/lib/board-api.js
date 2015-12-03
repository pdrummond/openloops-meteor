Ols.Board = {
	getCurrent: function() {
		return Boards.findOne(Session.get('currentBoardId'));
	}
}
