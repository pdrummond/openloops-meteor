if(Meteor.isClient) {
	Template.rightSidebar.helpers({
		assigneeLabel: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item && item.assignee?item.assignee:"Unassigned";
		}
	});

	Template.rightSidebar.events({
		'click #create-discussion-link': function() {
			Ols.Router.showCreateItemPage({type:'discussion'});
		},

		'click #create-issue-link': function() {
			Ols.Router.showCreateItemPage({type:'issue'});
		},

		'click #create-article-link': function() {
			Ols.Router.showCreateItemPage({type:'article'});
		},

		'click #edit-link': function() {
			Ols.Router.showEditItemPage(Session.get('currentItemId'));
		},

		'click #open-close-link': function() {
			Meteor.call('toggleItemOpenStatus', Session.get('currentItemId'), function(err, result) {
				if(err) {
					alert("Error toggling item status: " + err.reason);
				} else {
					var item = Items.findOne(Session.get('currentItemId'));
					var activityType = item.isOpen?Ols.ACTIVITY_TYPE_ITEM_OPENED:Ols.ACTIVITY_TYPE_ITEM_CLOSED;
					var activityMessage = {
						activityType: activityType,
						itemTitle: item.title,
						itemType: item.type,
						issueType: item.issueType,
						boardId: item.boardId,
						itemId: item._id
					};
					OpenLoops.insertActivityMessage(item, activityMessage);
					Ols.HistoryManager.scrollBottom();
				}
			});
		},

		'click #move-link': function() {
			$("#move-to-board-list").slideToggle();
		},

		'click #show-label-chooser-button': function() {
			$("#label-chooser-menu").slideToggle();
		}
	});
}
