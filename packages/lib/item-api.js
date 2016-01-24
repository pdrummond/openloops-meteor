Ols.Item = {

	find: function(selector, options) {
		selector = selector || {};
		return Items.find(selector, options);
	},

	findOne: function(selector, options) {
		return Items.findOne(selector, options);
	},

	insert: function(item, callback) {
		return Items.insert(item, callback);
	},

	update: function(selector, modifier, options, callback) {
		return Items.update(selector, modifier, options, callback);
	},

	remove: function(selector, callback) {
		return Items.remove(selector, callback);
	},

	getCurrent: function() {
		return Items.findOne(Session.get('currentItemId'));
	},

	get: function(itemId) {
		return Items.findOne(itemId)
	},

	_collection: function() {
		return Items;
	},

  showCardDetailDialog: function(itemId) {
    Session.set('currentItemId', itemId);
    $("#card-detail-dialog").modal({
        backdrop: 'static'
    });
  },

	/**
		Given an item or an itemId returns the item key for a project. The item
		key is made up of the project key and the item PID, for example: OLS-42.

		Example: Ols.Item.getItemKey({itemId: '123'})
	*/
	getItemKey: function(args) {
		var item = args.item?args.item:Items.findOne(args.itemId);
		return "#" + Ols.Project.getProjectKey({projectId: item.projectId}) + "-" + item.pid;
	},

	/**
		Given an item, returns the icon class name representing the type of the
		item.

		Example:
		getTypeIconClass({type: 'issue', issueType: 'bug'}) -> 'fa-bug'
	*/
	getTypeIconClass: function(item) {
		var icon = 'fa-square';
		if(item) {
			switch(item.type) {
				case Ols.Item.ITEM_TYPE_DISCUSSION: icon = 'fa-comments-o'; break;
				case Ols.Item.ITEM_TYPE_ISSUE: icon = 'fa-exclamation-circle'; break;
        case Ols.Item.ITEM_TYPE_ARTICLE: icon = 'fa-book'; break;
        case Ols.Item.ITEM_TYPE_POST: icon = 'fa-envelope-o'; break;
        case Ols.Item.ITEM_TYPE_QUESTION: icon = 'fa-question-circle'; break;
        case Ols.Item.ITEM_TYPE_REQ: icon = 'fa-fire'; break;
			}
			if(item.type == Ols.ITEM_TYPE_ISSUE && item.issueType != null) {
				switch(item.issueType) {
					case Ols.Item.ISSUE_TYPE_BUG: icon = 'fa-bug'; break;
					case Ols.Item.ISSUE_TYPE_TASK: icon = 'fa-exclamation-circle'; break;
					case Ols.Item.ISSUE_TYPE_ENHANCEMENT: icon = 'fa-bullseye'; break;
				}
			}
		}
		return icon;
	},

	/**
		Given an item, returns the color of the icon representing the item type.

		Example:
		getItemTypeIconColor({type: 'enhancement'}) --> 'purple'
	*/
	getTypeIconColor: function(item) {
		var color = '#ccc';
		if(item) {
			switch(item.type) {
				case Ols.Item.ITEM_TYPE_DISCUSSION: color = '#90BEF2'; break;
				case Ols.Item.ITEM_TYPE_ISSUE: color = '#6cc644'; break;
				case Ols.Item.ITEM_TYPE_ARTICLE: color = 'orange'; break;
        case Ols.Item.ITEM_TYPE_POST: color = '#808000'; break;
        case Ols.Item.ITEM_TYPE_QUESTION: color = '#808000'; break;
        case Ols.Item.ITEM_TYPE_REQ: color = '#808000'; break;

			}
			if(item.type == Ols.Item.ITEM_TYPE_ISSUE && item.issueType != null) {
				switch(item.issueType) {
					case Ols.Item.ISSUE_TYPE_BUG: color = 'brown'; break;
					case Ols.Item.ISSUE_TYPE_ENHANCEMENT: color = 'purple'; break;
				}
			}
		}
		return color;
	},

	isUserItemOwner: function(itemId, username) {
		var item = Items.findOne(itemId);
		return item && item.createdBy == username;
	},

	Tab: {
		TAB_TYPE_ITEM_DESCRIPTION: "TAB_TYPE_ITEM_DESCRIPTION",
		TAB_TYPE_MESSAGE_HISTORY: "TAB_TYPE_MESSAGE_HISTORY",
		TAB_TYPE_ACTIVITY_HISTORY: "TAB_TYPE_ACTIVITY_HISTORY",
		TAB_TYPE_CHECKLIST: "TAB_TYPE_CHECKLIST",
		TAB_TYPE_REFLIST: "TAB_TYPE_REFLIST"
	},

	ITEM_TYPE_DISCUSSION: 'discussion',
	ITEM_TYPE_ISSUE: 'issue',
	ITEM_TYPE_ARTICLE: 'article',
  ITEM_TYPE_POST: 'post',
  ITEM_TYPE_QUESTION: 'question',
  ITEM_TYPE_REQ: 'req',

	ISSUE_TYPE_BUG: 'bug',
	ISSUE_TYPE_TASK: 'task',
	ISSUE_TYPE_ENHANCEMENT: 'enhancement',
}
