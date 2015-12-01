if(Meteor.isClient) {
	Template.labelsList.helpers({
		labels: function() {
			return Labels.find();
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
					group: $("#editLabelForm input[name='group']").val(),
					description: $("#editLabelForm textarea[name='description']").val()
				};
				var currentLabelId = Session.get('currentLabelId');
				if(currentLabelId == null) {
					Meteor.call('insertLabel', labelAttrs, function(err) {
						if(err) {
							alert("Error inserting label: " + err.reason);
						} else {
							FlowRouter.go("projectMessages", {projectId: Session.get('currentProjectId')});
						}
					});
				} else {
					Meteor.call('updateLabel', currentLabelId, labelAttrs, function(err) {
						if(err) {
							alert("Error updating label: " + err.reason);
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
		'click #label-link': function() {
			Session.set('showSidebarTabs', false);
			Session.set('currentLabelId', this._id);
			Session.set('leftSidebarActiveTab', 'inboxTab');
			Session.set('filterQuery', 'labels:' + this.title);

		}
	})
}

Labels = new Meteor.Collection("labels");

if(Meteor.isServer) {

	Meteor.publish("labels", function() {
		return Labels.find();
	});

	Meteor.methods({
		insertLabel: function(newLabel) {
			var now = new Date().getTime();
			newLabel = _.extend({
				createdAt: now,
				createdBy: Meteor.user().username,
				updatedAt: now,
				numOpenMessages: 0,
				numClosedMessage: 0
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
				numClosedMessage: 0
			}, newLabel);
			newLabel.title = slugify(newLabel.title);
			var result = Labels.upsert(newLabel._id, newLabel);
			console.log("upsertLabel: " + JSON.stringify(result));
		}
	})
}
