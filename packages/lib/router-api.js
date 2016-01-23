Ols.Router = {

  showProjectsPage: function() {
    FlowRouter.go('projectsPage');
  },

	showWorkspacePage: function(projectId) {
		FlowRouter.go('workspacePage', {projectId: projectId});
	},

	showItemMessages: function(item, params) {
		params = _.extend({
			projectId: item.projectId,
			boardId: item.boardId,
			itemId: item._id,
			tabName: 'messages'
		}, params);

		FlowRouter.go('boardItemMessages', params, this._getQueryParams());
	},

	showCreateItemPage: function(queryParams) {
		var boardId = Session.get('currentBoardId');
		FlowRouter.go('createBoardItem', {projectId: Session.get('currentProjectId'), boardId: boardId}, _.extend(this._getQueryParams(), queryParams));
	},

	showEditItemPage: function(itemId) {
			FlowRouter.go('editItemPage', {itemId:itemId}, this._getQueryParams());
	},

	_getQueryParams: function() {
		var queryParams = {};
		return queryParams;
	}

}
