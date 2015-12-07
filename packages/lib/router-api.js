Ols.Router = {

	showHomeMessages: function() {
		var boardId = Session.get('currentBoardId');
		var queryParams = this._getQueryParams();
		if(boardId) {
			FlowRouter.go('boardMessages', {projectId: Session.get('currentProjectId'), boardId: boardId}, queryParams);
		} else {
			FlowRouter.go('dashboardMessages', {}, queryParams);
		}
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
		if(boardId) {
			FlowRouter.go('createBoardItem', {projectId: Session.get('currentProjectId'), boardId: boardId}, _.extend(this._getQueryParams(), queryParams));
		} else {
			FlowRouter.go('createProjectItem', {projectId: Session.get('currentProjectId')}, _.extend(this._getQueryParams(), queryParams));
		}
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
