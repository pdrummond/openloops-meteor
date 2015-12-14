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
					Ols.Error.showError("Error toggling item status: ", err);
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
