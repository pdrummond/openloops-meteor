if(Meteor.isClient) {
	Template.labelsList.helpers({
		labels: function() {
			return Labels.find();
		}
	});

	Template.editLabelForm.events({
		'click #save-button': function(e) {
			e.preventDefault();
			var title = $("#editLabelForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var description = $("#editLabelForm textarea[name='description']").val();

				var label = {
					title: title,
					description: description,
					color: $("#editLabelForm input[name='color']").val(),
				};
				Meteor.call('upsertLabel', label, function(err, result) {
					if(err) {
						alert("Error upserting label: " + err);
					} else {
						if(Session.get('currentItemId')) {
							FlowRouter.go("/board/" + Session.get('currentBoardId') + "/item/" + Session.get('currentItemId'));
						} else {
							FlowRouter.go("/board/" + Session.get('currentBoardId'));
						}
					}
				});
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
