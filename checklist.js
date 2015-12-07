if(Meteor.isClient) {
	Template.checkList.helpers({
		numOpenCheckItems: function() {
			var num = 0;
			var item = Ols.Item.getCurrent();
			if(item) {
				num =_.filter(item.subItems, function(subItem) {
					return subItem.itemTab == Session.get('activeItemTab') && subItem.isOpen == true;
				}).length;
			}
			return num;
		},

		numClosedCheckItems: function() {
			var num = 0;
			var item = Ols.Item.getCurrent();
			if(item) {
				num =_.filter(item.subItems, function(subItem) {
					return subItem.itemTab == Session.get('activeItemTab') && subItem.isOpen == false;
				}).length;
			}
			return num;
		},

		openCheckItems: function() {
			var checkItems = [];
			var item = Ols.Item.getCurrent();
			if(item) {
				checkItems =  _.filter(item.subItems, function(subItem) {
					return subItem.itemTab == Session.get('activeItemTab') && subItem.isOpen == true;
				});
			}
			return checkItems;
		},

		closedCheckItems: function() {
			var checkItems = [];
			var item = Ols.Item.getCurrent();
			if(item) {
				checkItems =  _.filter(item.subItems, function(subItem) {
					return subItem.itemTab == Session.get('activeItemTab') && subItem.isOpen == false;
				});
			}
			return checkItems;
		},

		noOpenCheckItems: function() {
			var num = 0;
			var item = Ols.Item.getCurrent();
			if(item) {
				num = _.filter(item.subItems, function(subItem) {
					return subItem.itemTab == Session.get('activeItemTab') && subItem.isOpen == true;
				}).length;
			}
			return num == 0;
		},

		noClosedCheckItems: function() {
			var num = 0;
			var item = Ols.Item.getCurrent();
			if(item) {
				num = _.filter(item.subItems, function(subItem) {
					return subItem.itemTab == Session.get('activeItemTab') && subItem.isOpen == false;
				}).length;
			}
			return num == 0;
		}
	});

	Template.checkList.events({
		'submit': function(e, t) {
			var $input = $(t.find('#checklist-input'));
			e.preventDefault();
			var inputText = $input.val().trim();
			if(inputText.length > 0) {
				var subItem = {
					text: inputText,
					type: Ols.SubItem.SUB_ITEM_TYPE_CHECKITEM,
					itemId: Session.get('currentItemId'),
					itemTab: Session.get('activeItemTab')
				};
				Meteor.call('insertSubItem', subItem, function(err, res) {
					if(err) {
						alert("Error adding checklist item: " + err.reason);
					} else {
						$input.val('');
					}
				});
			}
		}
	});

	Template.checkItem.onCreated(function() {
		this.editMode = new ReactiveVar();
	});

	Template.checkItem.helpers({
		isOpenClass: function() {
			return this.isOpen?'status-open':'status-closed';
		},

		isEditModeClass: function() {
			return Template.instance().editMode.get()?'edit-mode':'';
		},

		checked: function() {
			return this.isOpen?'':'checked';
		},

		isEditMode: function() {
			var t = Template.instance();
			return t.editMode.get();
		}
	});

	Template.checkItem.events({
		'dblclick .text': function(e, t) {
			t.editMode.set(true);
			Meteor.setTimeout(function() {
				$(t.find('.check-item-input')).select();
			}, 0);
		},

		'click .itemCheck': function(e) {
			e.preventDefault();
			this.isOpen = !this.isOpen;
			Meteor.call('updateSubItem', this, function(err) {
				if(err) {
					alert("Error updating sub-item status: " + err.reason);
				}
			});
		},

		'keyup .check-item-input': function(e, t) {
			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			var inputVal = $(t.find('.check-item-input')).val().trim();
			if(charCode == 27) {
				t.editMode.set(false);
			} else if(charCode == 13 && (inputVal == null || inputVal.length == 0)) {
				e.preventDefault();
				e.stopPropagation();
			} else {
				if (charCode == 13) {
					e.preventDefault();
					e.stopPropagation();
					if(inputVal.length > 0) {
						this.text = inputVal;
						Meteor.call('updateSubItem', this, function(err) {
							if(err) {
								alert("Error updating sub-item text: " + err.reason);
							} else {
								t.editMode.set(false);
							}
						});
					}
				}
			}
		},

		'click .delete-button': function() {
			Meteor.call('removeSubItem', this, function(err) {
				if(err) {
					alert("Error removing sub-item: " + err.reason);
				}
			});
		}
	})
}
