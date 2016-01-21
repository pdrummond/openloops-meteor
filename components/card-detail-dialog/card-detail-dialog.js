if(Meteor.isClient) {

  Template.cardDetailDialog.onCreated(function() {
    this.toField = new ReactiveVar();
  });

  Template.cardDetailDialog.onRendered(function() {
      this.$('#card-detail-dialog').on('shown.bs.modal', function () {
        var item = Items.findOne(Session.get('currentItemId'));
        var type = item.type;
        if(type == 'issue') {
          type = item.issueType;
        }
        $('#card-detail-dialog select[name="type"]').val(type);

        $('#card-detail-dialog select[name="project"]').val(item.projectId);

      });
  })

  Template.cardDetailDialog.helpers({

    currentItem: function() {
      return Items.findOne(Session.get('currentItemId')) || {};
    },

    projects: function() {
		    return Ols.Project.find({'members.username': Meteor.user().username});
    },

    createButtonLabel: function() {
      var label = 'Send to Backlog';
      var assignee = Template.instance().toField.get();

      if(assignee) {
        assignee = assignee.trim();
        if(assignee.length === 0) {
          label = 'Send to Backlog';
        } else if(assignee === Meteor.user().username) {
          label = 'Save to my queue';
        } else {
          label = 'Send to ' + assignee + '\'s queue';
        }
      }
      return label;
    }
  })

  Template.cardDetailDialog.events({

    'keyup input[name="to"]': function(e, t) {
      t.toField.set($(e.target).val());
    },

    'click #save-button': function() {
      var title = $("#new-card-dialog input[name='title']").val();
      if(title != null && title.length > 0) {
        var description = $("#new-card-dialog .card-description").text();
        var type = $("#new-card-dialog select[name='type']").val();
        var project = $("#new-card-dialog select[name='project']").val();
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
        var item = {
          title: title,
          description: description,
          type: type,
          issueType: issueType,
          projectId: project
        };
        var assignee = $("#new-card-dialog input[name='to']").val();
        if(assignee && assignee.trim().length > 0) {
          item.assignee = assignee.trim();
        }

        Meteor.call('insertItem', item, function(err, newItem) {
          if(err) {
            Ols.Error.showError("Error adding item",  err);
          } else {
            $("#new-card-dialog input[name='title']").val('');
            $("#new-card-dialog .card-description").text('');
            $("#new-card-dialog input[name='to']").val('');
            //initSortable( '.sortable', t);
          }
        });
      }
    }
  });
}
