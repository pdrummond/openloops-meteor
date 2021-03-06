if(Meteor.isClient) {
	Template.refList.onCreated(function() {
		var self = this;
		this.autorun(function() {
			self.subscribe('subItems', {
				itemTab: Session.get('activeItemTab'),
				type: Ols.SubItem.SUB_ITEM_TYPE_REFITEM
			});
		});
	});

	Template.refList.helpers({
		numRefItems: function() {
			return Ols.Item.find().count();
		},

		refItems: function() {
			return Ols.Item.find();
		},

		noRefItems: function() {
			return Ols.Item.find().count() == 0;
		},

		autoCompleteSettings: function() {
			return {
				position: "bottom",
				limit: 5,
				rules: [
					{
						collection: Ols.Item._collection(),
						field: "title",
						template: Template.itemPill
					}
				]
			};
		}
	});

	Template.refList.events({
		'autocompleteselect #auto-input': function(event, template, item) {
			var subItem = {
				type: Ols.SubItem.SUB_ITEM_TYPE_REFITEM,
				itemId: Session.get('currentItemId'),
				itemTab: Session.get('activeItemTab'),
				refItemId: item._id
			};
			Meteor.call('insertSubItem', subItem, function(err, res) {
				if(err) {
					Ols.Error.showError("Error adding reflist item", err);
				} else {
					$(template.find('#auto-input')).val('');
				}
			});
  		}
	});

	Template.refItem.onCreated(function() {
		this.editMode = new ReactiveVar();
	});

	Template.refItem.helpers({
		text:function() {
			var item = Ols.Item.findOne(this.refItemId);
			return item?item.title:'';
		},

		itemProjectId: function() {
			var item = Ols.Item.findOne(this.refItemId);
			return item?item.projectId:'';
		},

		itemBoardId: function() {
			var item = Ols.Item.findOne(this.refItemId);
			return item?item.boardId:'';
		},

		projectKey: function() {
			var projectKey = '???';
			var item = Ols.Item.findOne(this.refItemId);
			if(item) {
				var project = Ols.Project.findOne(item.projectId);
				if(project) {
					projectKey = project.key;
				}
			}
			return projectKey;
		},

		itemPid: function() {
			var item = Ols.Item.findOne(this.refItemId);
			return item?item.pid:'';
		}
	});

	Template.refItem.events({
		'click .remove-button': function() {
			Meteor.call('removeSubItem', this, function(err) {
				if(err) {
					Ols.Error.showError("Error removing sub-item", err);
				}
			});
		}
	});
}
