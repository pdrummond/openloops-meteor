Ols.Router = {

	showHomeMessages: function() {
		var boardId = Session.get('currentBoardId');
		if(boardId) {
			FlowRouter.go('boardMessages', {projectId: Session.get('currentProjectId'), boardId: boardId});
		} else {
			FlowRouter.go('projectMessages', {projectId: Session.get('currentProjectId')});
		}
	},

	showItemMessages: function(item) {
		if(item.boardId) {
			FlowRouter.go('boardItemMessages', {projectId: item.projectId, boardId: item.boardId, itemId: item._id});
		} else {
			FlowRouter.go('projectItemMessages', {projectId: item.projectId, itemId: item._id});
		}
	},

	showCreateItemPage: function(queryParams) {
		var boardId = Session.get('currentBoardId');
		if(boardId) {
			FlowRouter.go('createBoardItem', {projectId: Session.get('currentProjectId'), boardId: boardId}, queryParams);
		} else {
			FlowRouter.go('createProjectItem', {projectId: Session.get('currentProjectId')}, queryParams);
		}
	},

	showEditItemPage: function(itemId) {
		var boardId = Session.get('currentBoardId');
		if(boardId) {
			FlowRouter.go('editBoardItem', {projectId: Session.get('currentProjectId'), boardId: boardId, itemId:itemId});
		} else {
			FlowRouter.go('editProjectItem', {projectId: Session.get('currentProjectId'), itemId:itemId});
		}
	},

}
