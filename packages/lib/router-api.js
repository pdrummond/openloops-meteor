Ols.Router = {

	showHomeMessages: function() {
		var boardId = Session.get('currentBoardId');
		if(boardId) {
			FlowRouter.go('boardMessages', {projectId: Session.get('currentProjectId'), boardId: boardId}, this._getQueryParams());
		} else {
			FlowRouter.go('projectMessages', {projectId: Session.get('currentProjectId')}, this._getQueryParams());
		}
	},

	showItemMessages: function(item) {
		if(item.boardId) {
			FlowRouter.go('boardItemMessages', {projectId: item.projectId, boardId: item.boardId, itemId: item._id}, this._getQueryParams());
		} else {
			FlowRouter.go('projectItemMessages', {projectId: item.projectId, itemId: item._id}, this._getQueryParams());
		}
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
		var userDashboard = Session.get('userDashboard');
		if(userDashboard != null) {
			queryParams.userDashboard = userDashboard;
		}
		return queryParams;
	}

}
