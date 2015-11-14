Ols.Item = {
	/**
		Given an item or an itemId returns the item key for a project. The item
		key is made up of the project key and the item PID, for example: OLS-42.

		Example: Ols.Item.getItemKey({itemId: '123'})
	*/
	getItemKey: function(args) {
		var item = args.item?args.item:Items.findOne(args.itemId);
		return "#" + Ols.Project.getProjectKey({projectId: item.projectId}) + "-" + item.pid;
	}
}
