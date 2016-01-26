if(Meteor.isClient) {
	Template.milestoneList.helpers({
		milestones: function() {
			return Milestones.find({projectId: Session.get('currentProjectId')});
		}
	});

  Template.milestoneList.events({
    'click #create-milestone': function() {
      var title = prompt('Enter milestone name');
      if(title != null && title.trim().length > 0) {
        title = slugify(title.trim());
        Meteor.call('insertMilestone', {title: title, projectId: Session.get('currentProjectId')});
      }
    }
  });

  Template.milestoneItem.events({
    'click #delete-milestone': function() {
      Meteor.call('deleteMilestone', this._id);
    }
  })
}
