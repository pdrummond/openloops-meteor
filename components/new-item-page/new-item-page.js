if(Meteor.isClient) {

	Template.newItemPage.onCreated(function() {
		var template = this;
		template.isBusy = new ReactiveVar();
		template.itemType = new ReactiveVar(Ols.Item.ITEM_TYPE_ISSUE);
		template.issueType = new ReactiveVar(Ols.Item.ISSUE_TYPE_TASK);
	});

	Template.newItemPage.onRendered(function() {
		var createItemType = Session.get('createItemType');
		if(createItemType) {
			this.itemType.set(createItemType);
			switch(createItemType) {
				case Ols.Item.ITEM_TYPE_DISCUSSION:
				$("#discussion-type-link").addClass("active");
				break;
				case Ols.Item.ITEM_TYPE_ISSUE:
				$("#task-type-link").addClass("active");
				break;
				case Ols.Item.ITEM_TYPE_ARTICLE:
				$("#article-type-link").addClass("active");
				break;

			}

		}
	});

	Template.newItemPage.helpers({
		isBusy: function() {
			var template = Template.instance();
			return template.isBusy.get();
		},

		typeIconClass: function() {
			var t = Template.instance();
			return Ols.Item.getTypeIconClass({type: t.itemType.get(), issueType: t.issueType.get()});
		},

		typeIconColor: function() {
			var t = Template.instance();
			return Ols.Item.getTypeIconColor({type: t.itemType.get(), issueType: t.issueType.get()});
		},

		headerColor: function() {
			var color = 'green';
			var t = Template.instance();
			var itemType = t.itemType.get();
			var issueType = t.issueType.get();
			switch(itemType) {
				case Ols.Item.ITEM_TYPE_ARTICLE: color = '#c9932e'; break;
				case Ols.Item.ITEM_TYPE_DISCUSSION: color = '#4e89da'; break;
				case Ols.Item.ITEM_TYPE_ISSUE:
				switch(issueType) {
					case Ols.Item.ISSUE_TYPE_TASK: color = '#3e9047'; break;
					case Ols.Item.ISSUE_TYPE_BUG: color = '#d04a4a'; break;
					case Ols.Item.ISSUE_TYPE_ENHANCEMENT: color = '#9a2da9'; break;
				}
			}
			return color;
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
					type: template.itemType.get(),
					issueType: template.issueType.get(),
					projectId: Session.get('currentProjectId'),
					boardId: Session.get('currentBoardId'),
				};

				Meteor.call('insertItem', item, function(err, newItem) {
					if(err) {
						Ols.Error.showError("Error adding item",  err);
						Ols.Router.showBoardMessages();
					} else {
						Ols.Router.showItemMessages(newItem, {tabName: 'description'});
					}
				});
			}
		},

		'click #discussion-type-link': function(e, t) {
			t.itemType.set(Ols.Item.ITEM_TYPE_DISCUSSION);
			t.issueType.set(null);
			$(".item-type-buttons .action-button").removeClass("active");
			$("#discussion-type-link").addClass("active");
		},

		'click #article-type-link': function(e, t) {
			t.itemType.set(Ols.Item.ITEM_TYPE_ARTICLE);
			t.issueType.set(null);
			$(".item-type-buttons .action-button").removeClass("active");
			$("#article-type-link").addClass("active");
		},

		'click #task-type-link': function(e, t) {
			t.itemType.set(Ols.Item.ITEM_TYPE_ISSUE);
			t.issueType.set(Ols.Item.ISSUE_TYPE_TASK);
			$(".item-type-buttons .action-button").removeClass("active");
			$("#task-type-link").addClass("active");
		},

		'click #bug-type-link': function(e, t) {
			t.itemType.set(Ols.Item.ITEM_TYPE_ISSUE);
			t.issueType.set(Ols.Item.ISSUE_TYPE_BUG);
			$(".item-type-buttons .action-button").removeClass("active");
			$("#bug-type-link").addClass("active");
		},

		'click #enhancement-type-link': function(e, t) {
			t.itemType.set(Ols.Item.ITEM_TYPE_ISSUE);
			t.issueType.set(Ols.Item.ISSUE_TYPE_ENHANCEMENT);
			$(".item-type-buttons .action-button").removeClass("active");
			$("#enhancement-type-link").addClass("active");
		},
	});

}
