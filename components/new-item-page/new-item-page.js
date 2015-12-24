if(Meteor.isClient) {

	Template.newItemPage.onCreated(function() {
		var template = this;
		template.isBusy = new ReactiveVar();
	});

	Template.newItemPage.helpers({
		isBusy: function() {
			var template = Template.instance();
			return template.isBusy.get();
		}
	})

	Template.newItemPage.events({
		'click #create-item-link': function(e, template) {
			e.preventDefault();
			var title = $(".new-item-page input[name='title']").val();
			if(title != null && title.length > 0) {
				template.isBusy.set(true);
				var description = $(".new-item-page textarea[name='description']").val();

				var item = {
					title: title,
					description: description,
					type: Ols.Item.ITEM_TYPE_ISSUE,
					issueType: Ols.Item.ISSUE_TYPE_TASK,
					projectId: Session.get('currentProjectId'),
					boardId: Session.get('currentBoardId'),					
				};

				Meteor.call('insertItem', item, function(err, newItem) {
					if(err) {
						Ols.Error.showError("Error adding item",  err);
						Ols.Router.showBoardMessages();
					} else {
						Ols.Router.showItemMessages(newItem);
					}
				});
			}
		}
	});

}
