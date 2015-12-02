if(Meteor.isClient) {
	Template.editItemForm.onCreated(function() {
		var template = this;
		template.isBusy = new ReactiveVar();
	});

	Template.editItemForm.onRendered(function() {
		//FIXME: Should not be using session here - use FlowRouter.param() instead.
		var createItemType = Session.get('createItemType');
		if(createItemType) {
			Session.set('editItemForm.selectedType', createItemType);
			this.$("#editItemForm select[name='type']").val(createItemType);
			Session.set('createItemType', null);
		} else {
			Session.set('editItemForm.selectedType', 'issue');
		}
		this.$('input[name="title"]').focus();
	});

	Template.editItemForm.helpers({

		formTitle: function() {
			var template = Template.instance();
			return (Session.get('currentItemId')?"Edit ":"Create ") + (Session.get('editItemForm.selectedType') || 'Issue');
		},

		isBusy: function() {
			 var template = Template.instance();
			 return template.isBusy.get();
		},

		currentItem: function() {
			return Items.findOne(Session.get('currentItemId'));
		},

		title: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.title:'';
		},

		description: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.description:'';
		},

		labels: function() {
			var item = Items.findOne(Session.get('currentItemId'));
			return item?item.labels:'';
		},

		isSelectedType: function(type) {
			var item = Items.findOne(Session.get('currentItemId'));
			if(item) {
				return type == item.type?'selected':'';
			} else {
				return '';
			}
		},

		selectedType: function() {
			return Session.get('editItemForm.selectedType');
		},

		isSelectedIssueType: function(issueType) {
			var item = Items.findOne(Session.get('currentItemId'));
			if(item) {
				return issueType == item.issueType?'selected':'';

			} else {
				return '';
			}
		},

		showIssueType: function() {
			var selectedType = Session.get('editItemForm.selectedType') || 'issue';
			return selectedType == 'issue'?'':'hide';
		}
	});

	Template.editItemForm.events({
		'change select[name="type"]': function() {
			Session.set('editItemForm.selectedType', $('select[name="type"]').val());
		},
		'click #cancel-button': function(e) {
			e.preventDefault();
			Ols.Router.showHomeMessages();
		},

		'click #save-button': function(e, template) {
			e.preventDefault();
			var currentItem = Items.findOne(Session.get('currentItemId'));
			var title = $("#editItemForm input[name='title']").val();
			if(title != null && title.length > 0) {
				template.isBusy.set(true);
				var description = $("#editItemForm textarea[name='description']").val();

				var item = {
					title: title,
					description: description,
					type: $("#editItemForm select[name='type']").val(),
					issueType: $("#editItemForm select[name='issueType']").val(),
					assignee: $("#editItemForm input[name='assignee']").val(),					
				};
				var currentItemId = Session.get('currentItemId');
				if(currentItemId == null) {
					item.projectId = Session.get('currentProjectId');
					item.boardId = Session.get('currentBoardId');
					Meteor.call('insertItem', item, function(err, newItem) {
						if(err) {
							alert("Error adding item: " + err);
						} else {
							OpenLoops.insertActivityMessage(newItem, {
								activityType: Ols.ACTIVITY_TYPE_NEW_ITEM
							});
							if(Ols.StringUtils.notEmpty(newItem.description)) {
								OpenLoops.insertActivityMessage(newItem, {
									activityType: Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED
								});
							}
							Ols.Router.showItemMessages(newItem);
						}
					});

				} else {
					Meteor.call('updateItem', currentItemId, item, function(err, newItem) {
						if(err) {
							alert("Error editing item: " + err);
						} else {
							if(currentItem.title != newItem.title) {
								OpenLoops.insertActivityMessage(newItem, {
									activityType: Ols.ACTIVITY_TYPE_ITEM_TITLE_CHANGED,
								});
							}
							if(currentItem.description != newItem.description) {
								OpenLoops.insertActivityMessage(newItem, {
									activityType: Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED
								});
							}
							Ols.Router.showItemMessages(newItem);
						}
					});
				}
			}
		}
	});
}
