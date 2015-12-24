Ols.Router = {

	showBoardMessages: function(boardId) {
		boardId = boardId || Session.get('currentBoardId');
		var projectId = boardId ? Ols.Board.findOne(boardId).projectId : Session.get('currentProjectId');
		FlowRouter.go('boardMessages', {projectId: projectId, boardId: boardId}, this._getQueryParams());
	},

	showItemMessages: function(item) {
		var params = {
			projectId: item.projectId,
			boardId: item.boardId,
			itemId: item._id
		};
		params.tabName = 'messages';

		FlowRouter.go('boardItemMessages', params, this._getQueryParams());
	},

	showCreateItemPage: function(queryParams) {
		var boardId = Session.get('currentBoardId');
		FlowRouter.go('createBoardItem', {projectId: Session.get('currentProjectId'), boardId: boardId}, _.extend(this._getQueryParams(), queryParams));
	},

	showEditItemPage: function(itemId) {
		var boardId = Session.get('currentBoardId');
		if(boardId) {
			FlowRouter.go('editBoardItem', {projectId: Session.get('currentProjectId'), boardId: boardId, itemId:itemId}, this._getQueryParams());
		} else {
			FlowRouter.go('editProjectItem', {projectId: Session.get('currentProjectId'), itemId:itemId}, this._getQueryParams());
		}
	},

	_getQueryParams: function() {
		var queryParams = {};
		return queryParams;
	}

}
