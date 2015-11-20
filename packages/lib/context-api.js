Ols.Context = {

	_private: {
		currentProjectId: new ReactiveVar(),
		currentBoardId: new ReactiveVar(),
		currentItemId: new ReactiveVar(),
	},

	setFromRoute: function(route) {
		this.setProjectId(route.getParam('projectId'));
		this.setBoardId(route.getParam('boardId'));
		this.setItemId(route.getParam('itemId'));
	},

	getProjectId: function() {
		return this._private.currentProjectId.get();
	},

	setProjectId: function(projectId) {
		this._private.currentProjectId.set(projectId);
	},

	getBoardId: function() {
		return this._private.currentBoardId.get();
	},

	setBoardId: function(boardId) {
		this._private.currentBoardId.set(boardId);
	},

	getItemId: function() {
		return this._private.currentItemId.get();
	},

	setItemId: function(itemId) {
		this._private.currentItemId.set(itemId);
	},

}
