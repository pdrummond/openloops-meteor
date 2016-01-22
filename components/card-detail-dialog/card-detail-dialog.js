if(Meteor.isClient) {

  Template.cardDetailDialog.onCreated(function() {
    this.toField = new ReactiveVar();
    this.statusField = new ReactiveVar();
    this.selectedType = new ReactiveVar("post");
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

      self.$('#new-card-dialog .card-description').focus();

      Meteor.call('updateUserSetViewingCard', Meteor.userId(), item._id);

    });
  })

  Template.cardDetailDialog.helpers({

    viewingUsers: function() {
      return Meteor.users.find({_id: {$ne: Meteor.userId()}, viewingItemId: Session.get('currentItemId')});
    },

    cardIconClass: function() {
      var t = Template.instance();
      switch(t.selectedType.get()) {
        case 'post': return 'fa-envelope-o';
        case 'discussion': return 'fa-comments-o';
        case 'task': return 'fa-exclamation-circle';
        case 'bug': return 'fa-bug';
        case 'enhancement': return 'fa-bullseye';
        case 'question': return 'fa-question-circle';
        case 'req': return 'fa-fire';
      }
    },

    selectedCardKey: function() {
      var cardKey = '???';
      item = Ols.Item.findOne(Session.get('currentItemId'));
      if(item) {
        var project = Ols.Project.findOne(item.projectId);
        if(project) {
          cardKey = project.key + "-" + item.pid;
        }
      }
      return cardKey;
    },

    statusLabel: function() {
      var item = Items.findOne(Session.get('currentItemId'));
      return item?item.isOpen?'OPEN':'CLOSED':'OPEN';
    },

    statusClass: function() {
      var item = Items.findOne(Session.get('currentItemId'));
      return item?item.isOpen?'btn-primary':'btn-danger':'btn-primary';
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
          label = 'Save to ' + assignee + '\'s queue';
        }
      }
      return label;
    },

    inInboxAttr: function() {
      var item = Items.findOne(Session.get('currentItemId'));
      return item && item.inInbox?'checked':'';
    }
  })

  Template.cardDetailDialog.events({

    'change select[name="type"]': function(e, t) {
      var type = $("#card-detail-dialog select[name='type']").val();
      t.selectedType.set(type);
    },

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

    'click #header-new-messages-toast': function() {
      Session.set("numIncomingMessages", 0);
      Ols.HistoryManager.scrollBottom();
    },

    'click #close-button': function() {
      Meteor.defer(function() {
        Meteor.call('updateUserUnSetViewingCard', Meteor.userId());
      })
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
          item.inInbox = assignee !== Meteor.user().username
        } else {
          item.inInBox = false;
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
        Meteor.defer(function() {
          Meteor.call('updateUserUnSetViewingCard', Meteor.userId());
        })
      }
    }
  });
}
