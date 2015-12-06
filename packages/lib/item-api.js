Ols.Item = {

	getCurrent: function() {
		return Items.findOne(Session.get('currentItemId'));
	},

	get: function(itemId) {
		return Items.findOne(itemId)
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

	Tab: {
		TAB_TYPE_MESSAGE_HISTORY: "TAB_TYPE_MESSAGE_HISTORY",
		TAB_TYPE_ACTIVITY_HISTORY: "TAB_TYPE_ACTIVITY_HISTORY",
		TAB_TYPE_CHECKLIST: "TAB_TYPE_CHECKLIST",
	},

	ITEM_TYPE_DISCUSSION: 'discussion',
	ITEM_TYPE_ISSUE: 'issue',
	ITEM_TYPE_ARTICLE: 'article',

	ISSUE_TYPE_BUG: 'bug',
	ISSUE_TYPE_TASK: 'task',
	ISSUE_TYPE_ENHANCEMENT: 'enhancement',
}
