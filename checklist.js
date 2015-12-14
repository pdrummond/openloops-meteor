if(Meteor.isClient) {

	Template.checkList.onCreated(function() {
		var self = this;
		this.autorun(function() {
			self.subscribe('subItems', {
				itemTab: Session.get('activeItemTab'),
				type: Ols.SubItem.SUB_ITEM_TYPE_CHECKITEM
			});
		});
	});

	Template.checkList.helpers({
		numOpenCheckItems: function() {
			return SubItems.find({isOpen:true}).count();
		},

		numClosedCheckItems: function() {
			return SubItems.find({isOpen:false}).count();
		},

		openCheckItems: function() {
			return SubItems.find({isOpen:true});
		},

		closedCheckItems: function() {
			return SubItems.find({isOpen:false});
		},

		noOpenCheckItems: function() {
			return SubItems.find({isOpen:true}).count() == 0;
		},

		noClosedCheckItems: function() {
			return SubItems.find({isOpen:false}).count() == 0;
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
						Ols.Error.showError("Error adding checklist item", err);
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
					Ols.Error.showError("Error updating sub-item status", err);
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
								Ols.Error.showError("Error updating sub-item text", err);
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
					Ols.Error.showError("Error removing sub-item", err);
				}
			});
		}
	})
}
