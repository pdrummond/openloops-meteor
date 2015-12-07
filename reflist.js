if(Meteor.isClient) {
	Template.checkList.onCreated(function() {
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
			return SubItems.find().count();
		},

		refItems: function() {
			return SubItems.find();
		},

		noRefItems: function() {
			return SubItems.find().count() == 0;
		},

		autoCompleteSettings: function() {
			return {
				position: "bottom",
				limit: 5,
				rules: [
					{
						collection: Items,
						field: "title",
						template: Template.itemPill
					}
				]
			};
		}
	});

	Template.refItem.onCreated(function() {
		this.editMode = new ReactiveVar();
	});

	Template.refItem.helpers({
		text:function() {
			var item = Items.findOne(this.refItemId);
			return item?item.title:'';
		},

		itemProjectId: function() {
			var item = Items.findOne(this.refItemId);
			return item?item.projectId:'';
		},

		itemBoardId: function() {
			var item = Items.findOne(this.refItemId);
			return item?item.boardId:'';
		},

		projectKey: function() {
			var projectKey = '???';
			var item = Items.findOne(this.refItemId);
			if(item) {
				var project = Projects.findOne(item.projectId);
				if(project) {
					projectKey = project.key;
				}
			}
			return projectKey;
		},

		itemPid: function() {
			var item = Items.findOne(this.refItemId);
			return item?item.pid:'';
		}
	});

	Template.refItem.events({
		'click .remove-button': function() {
			Meteor.call('removeSubItem', this, function(err) {
				if(err) {
					alert("Error removing sub-item: " + err.reason);
				}
			});
		}
	});

	Template.itemPill.events({
		'click': function(e, t) {
			var subItem = {
				type: Ols.SubItem.SUB_ITEM_TYPE_REFITEM,
				itemId: Session.get('currentItemId'),
				itemTab: Session.get('activeItemTab'),
				refItemId: this._id
			};
			Meteor.call('insertSubItem', subItem, function(err, res) {
				if(err) {
					alert("Error adding reflist item: " + err.reason);
				} else {
					$(t.find('#msg')).val('');
				}
			});
		}
	})
}
