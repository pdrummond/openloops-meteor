
if(Meteor.isClient) {
	FlowRouter.route('/project/:projectId/create-label', {
		name: 'createLabelPage',
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', null);
			Session.set('currentLabelId', null);
			BlazeLayout.render("app", {currentPage: "editLabelPage"});
		}
	});

	FlowRouter.route('/project/:projectId/label/:labelId/edit', {
		name: 'editLabelPage',
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', null);
			Session.set('currentLabelId', params.labelId);
			BlazeLayout.render("app", {currentPage: "editLabelPage"});
		}
	});
}

if(Meteor.isClient) {
	Template.labelsList.helpers({
		labels: function() {
			return Labels.find({projectId: Session.get('currentProjectId')}, {sort: {order: 1}});
		}
	});

	Template.editLabelForm.helpers({
		currentLabel: function() {
			var label = Labels.findOne(FlowRouter.getParam("labelId"));
			return label?label:{};
		}
	});

	Template.editLabelForm.events({
		'click #save-button': function(e) {
			e.preventDefault();

			var title = $("#editLabelForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var labelAttrs = {
					title: title,
					color: $("#editLabelForm input[name='color']").val(),
					order: $("#editLabelForm input[name='order']").val(),
					group: $("#editLabelForm input[name='group']").val(),
					description: $("#editLabelForm textarea[name='description']").val(),
					projectId: Session.get('currentProjectId'),
				};
				var currentLabelId = Session.get('currentLabelId');
				if(currentLabelId == null) {
					Meteor.call('insertLabel', labelAttrs, function(err) {
						if(err) {
							Ols.Error.showError("Error inserting label: ", err);
						} else {
							FlowRouter.go("projectMessages", {projectId: Session.get('currentProjectId')});
						}
					});
				} else {
					Meteor.call('updateLabel', currentLabelId, labelAttrs, function(err) {
						if(err) {
							Ols.Error.showError("Error updating label: ", err);
						} else {
							FlowRouter.go("projectMessages", {projectId: Session.get('currentProjectId')});
						}
					});
				}
			}
		}
	});

	Template.labelListItem.helpers({
		description: function() {
			return this.description || "No Description";
		}
	});

	Template.labelListItem.events({
		'click .label.item #title': function() {
			console.log("labelListItem click");
			Session.set('filterQuery', 'label:' + this.title + " open:true");
			Session.set('leftSidebarActiveTab', 'items-tab');
			Session.set('filterSentence', 'Showing all <i class="fa fa-tag" style="margin-left:5px;color:' +
				this.color + '"></i> <strong style="margin-right:5px;color:' + this.color + '">' + this.title + '</strong> items' +
				' <i id="clear-active-filter-icon" class="fa fa-times" title="Clear filter"></i>');
		},

		'click #delete-label-link': function() {
			if(Ols.User.userIsAdmin()) {
				Meteor.call('deleteLabel', this._id, function(err, result) {
					if(err) {
						Ols.Error.showError("Error deleting label: ", err);
					}
				});
			} else {
				Ols.Error.showError("You don't have permission to delete labels");
			}
		}
	});

	Template.labelChooserMenu.helpers({
		labels: function() {
			return Labels.find({projectId: Session.get('currentProjectId')}, {sort: {order: 1}});
		}
	});

	Template.labelChooserItem.helpers({
		showCheck: function() {
			var item = Ols.Item.findOne(Session.get('currentItemId'));
			return item && item.labels?(_.contains(item.labels, this._id)?'':'hide'):'hide';
		}
	});

	Template.labelChooserItem.events({
		'click': function() {
			var item = Ols.Item.findOne(Session.get('currentItemId'));
			var labelExists = _.contains(item.labels, this._id);
			if(labelExists) {
				Meteor.call('removeLabelFromItem', Session.get('currentItemId'), this._id, function(err, result) {
					if(err) {
						Ols.Error.showError("Error removing label", err);
					}
				});
			} else {
				Meteor.call('addLabelToItem', Session.get('currentItemId'), this._id, function(err, result) {
					if(err) {
						Ols.Error.showError("Error adding label", err);
					}
				});
			}
		}
	});
}

Labels = new Meteor.Collection("labels");

if(Meteor.isServer || Meteor.isClient) {

	Meteor.methods({
		addLabelToItem: function(itemId, labelId) {
			Ols.Item.update({
				_id: itemId
			}, {
				$push: { labels: labelId}
			});
			var item = Ols.Item.findOne(itemId);

			if(item.isOpen) {
				Labels.update(labelId, {$inc: {numOpenMessages: 1}});
			} else {
				Labels.update(labelId, {$inc: {numClosedMessages: 1}});
			}

		},

		removeLabelFromItem: function(itemId, labelId) {
			Ols.Item.update({
				_id: itemId
			}, {
				$pull: { labels: labelId}
			});
			var item = Ols.Item.findOne(itemId);
			if(item.isOpen) {
				Labels.update(labelId, {$inc: {numOpenMessages: -1}});
			} else {
				Labels.update(labelId, {$inc: {numClosedMessages: -1}});
			}
		}
	});
}


if(Meteor.isServer) {

	Meteor.publish("labels", function() {
		return Labels.find({}, {sort: {order: 1}});
	});

	Meteor.methods({
		insertLabel: function(newLabel) {
			var now = new Date().getTime();
			newLabel = _.extend({
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
				numOpenMessages: 0,
				numClosedMessages: 0
			}, newLabel);
			newLabel.title = slugify(newLabel.title);
			return Labels.insert(newLabel);
		},

		updateLabel: function(labelId, attrs) {
			console.log("> updateLabel: " + JSON.stringify(attrs));
			var label = Labels.findOne(labelId);
			attrs.title = slugify(attrs.title);
			Labels.update(label, {$set: attrs});
			return Labels.findOne(labelId);
		},

		upsertLabel: function(newLabel) {
			var now = new Date().getTime();
			newLabel = _.extend({
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
				numOpenMessages: 0,
				numClosedMessages: 0
			}, newLabel);
			newLabel.title = slugify(newLabel.title);
			var result = Labels.upsert(newLabel._id, newLabel);
			console.log("upsertLabel: " + JSON.stringify(result));
		},

		deleteLabel: function(labelId) {
			Labels.remove(labelId);
		}
	})
}
