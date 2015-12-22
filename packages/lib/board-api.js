Ols.Board = {

	find: function(selector, options) {
		selector = selector || {};
		return Boards.find(selector, options);
	},

	findOne: function(selector, options) {
		return Boards.findOne(selector, options);
	},

	insert: function(item, callback) {
		return Boards.insert(item, callback);
	},

	update: function(selector, modifier, options, callback) {
		return Boards.update(selector, modifier, options, callback);
	},

	remove: function(selector, callback) {
		return Boards.remove(selector, callback);
	},

	getCurrent: function() {
		return Boards.findOne(Session.get('currentBoardId'));
	},

	get: function(boardId) {
		return Boards.findOne(boardId);
	}
}
