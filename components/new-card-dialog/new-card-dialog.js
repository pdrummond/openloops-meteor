if(Meteor.isClient) {
  Template.newCardDialog.events({
    'click #save-button': function() {
      var title = $("#new-card-dialog input[name='title']").val();
      if(title != null && title.length > 0) {
        var description = $("#new-card-dialog textarea[name='description']").val();
        var type = $("#new-card-dialog select[name='type']").val();
        var issueType;
        switch(type) {
          case 'task':
          type = 'issue';
          issueType = 'task';
          break;
          case 'enhancement':
          type = 'issue';
          issueType = 'enhancement';
          break;
          case 'bug':
          type = 'issue';
          issueType = 'bug';
          break;
        };
        var assignee = $("#new-card-dialog input[name='to']").val();

        var item = {
          title: title,
          description: description,
          type: type,
          issueType: issueType,
          assignee: assignee,
          projectId: Session.get('currentProjectId'),
          boardId: Session.get('currentBoardId'),
        };

        Meteor.call('insertItem', item, function(err, newItem) {
          if(err) {
            Ols.Error.showError("Error adding item",  err);
          } else {
            initSortable( '.sortable', t);
          }
        });
      }
    }
  });
}
