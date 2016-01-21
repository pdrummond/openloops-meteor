if(Meteor.isClient) {

  Template.cardDetailDialog.onCreated(function() {
    this.toField = new ReactiveVar();
    this.statusField = new ReactiveVar();
  });

  Template.cardDetailDialog.onRendered(function() {
    var self = this;
    this.$('#card-detail-dialog').on('shown.bs.modal', function () {
      var item = Items.findOne(Session.get('currentItemId'));
      var type = item.type;
      if(type == 'issue') {
        type = item.issueType;
      }
      $('#card-detail-dialog select[name="type"]').val(type);

      $('#card-detail-dialog select[name="project"]').val(item.projectId);

      var item = Items.findOne(Session.get('currentItemId'));
      self.toField.set(item.assignee);
      self.statusField.set(item.isOpen);

    });
  })

  Template.cardDetailDialog.helpers({

    statusLabel: function() {
      return Items.findOne(Session.get('currentItemId')).isOpen?'OPEN':'CLOSED';
    },

    statusClass: function() {
      return Items.findOne(Session.get('currentItemId')).isOpen?'btn-primary':'btn-danger';
    },

    currentItem: function() {
      return Items.findOne(Session.get('currentItemId')) || {};
    },

    projects: function() {
      return Ols.Project.find({'members.username': Meteor.user().username});
    },

    saveButtonLabel: function() {
      var t = Template.instance();
      var label = 'Save to Backlog';
      var assignee = Template.instance().toField.get();

      if(t.statusField.get() === false) {
        label = "Save to Done List";
      } else if(assignee) {
        assignee = assignee.trim();
        if(assignee.length === 0) {
          label =  'Save to Backlog';
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

    'click #status-button': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('toggleItemOpenStatus', Session.get('currentItemId'), function(err, result) {
        if(err) {
          Ols.Error.showError("Error toggling item status: ", err);
        }
      });
    },

    'keyup input[name="to"]': function(e, t) {
      t.toField.set($(e.target).val());
    },

    'click #save-button': function() {
      var title = $("#card-detail-dialog input[name='title']").val();
      if(title != null && title.length > 0) {
        var description = $("#card-detail-dialog .card-description").text();
        var type = $("#card-detail-dialog select[name='type']").val();
        var project = $("#card-detail-dialog select[name='project']").val();
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
        var assignee = $("#card-detail-dialog input[name='to']").val();
        if(assignee && assignee.trim().length > 0) {
          item.assignee = assignee.trim();
        }

        Meteor.call('updateItem', Session.get('currentItemId'), item, function(err, newItem) {
          if(err) {
            Ols.Error.showError("Error adding item",  err);
          } else {
            if(assignee.trim().length == 0) {
              Meteor.call('removeItemAssignee', Session.get('currentItemId'), function(err, result) {
                if(err) {
                  Ols.Error.showError('Error un-assigning item: ', err);
                }
              });
            }
          }
        });
      }
    }
  });
}
