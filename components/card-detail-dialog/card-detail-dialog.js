if(Meteor.isClient) {

  Template.cardDetailDialog.onCreated(function() {
    this.toField = new ReactiveVar();
    this.statusField = new ReactiveVar();
    this.editMode = new ReactiveVar(false);
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

    milestones: function() {
      return Milestones.find({projectId: Session.get('currentProjectId')});
    },

    projectTitle: function() {
      var item = Ols.Item.getCurrent();
      if(item) {
        var project = Ols.Project.findOne(item.projectId);
        return project.title;
      } else {
        return '';
      }
    },

    viewingUsers: function() {
      return Meteor.users.find({_id: {$ne: Meteor.userId()}, 'status.online': true, viewingItemId: Session.get('currentItemId')});
    },

    cardIconClass: function() {
      var item = Ols.Item.getCurrent();
      return Ols.Item.getTypeIconClass(item);
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

    milestoneLabel: function() {
      var item = Items.findOne(Session.get('currentItemId'));
      return item && item.milestoneTag ? item.milestoneTag : 'No Milestone';
    },

    statusLabel: function() {
      var item = Items.findOne(Session.get('currentItemId'));
      var label = 'new';
      if(item != null) {
        switch(item.status) {
          case 'new': label = 'New'; break;
          case 'in-progress': label = 'In Progress'; break;
          case 'in-test': label = 'In Test'; break;
          case 'blocked': label = 'Blocked'; break;
          case 'completed': label = 'Completed'; break;
          case 'rejected': label = 'Rejected'; break;
          case 'duplicate': label = 'Duplicate'; break;
          case 'out-of-scope': label = 'Out of Scope'; break;
        }
      }
      return label;
    },

    statusClass: function() {
      var item = Items.findOne(Session.get('currentItemId'));
      return item?item.isOpen?'btn-success':'btn-danger':'btn-success';
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
    },

    listLabel: function() {
      var item = Ols.Item.getCurrent();
      if(item) {
        var queueTitle = '';
        if(item.isOpen) {
          queueTitle = 'Backlog';
          if(item.type == 'discussion') {
            queueTitle = 'Discussion List';
          }
          if(item.milestoneTag != null && item.milestoneTag.length > 0) {
            queueTitle = item.milestoneTag;
          }
        } else {
          queueTitle = 'Done List';
        }
        return item && item.assignee?'<b>' + item.assignee + '</b>':'<b>' + queueTitle + '</b>';
      } else {
        return '';
      }
    },

    assigneeLabel: function() {
      var item = Ols.Item.getCurrent();
      return item && item.assignee?'<b>' + item.assignee + '</b>':'<i>Noone</i>';
    },

    milestoneTagLabel: function() {
      var item = Ols.Item.getCurrent();
      return item && item.milestoneTag?item.milestoneTag:'No Milestone';
    },

    hideDescriptionViewerClass: function() {
      return Template.instance().editMode.get() === true ? 'hide':'';
    },

    hideDescriptionEditorClass: function() {
      return Template.instance().editMode.get() === true ? '':'hide';
    },
  })

  Template.cardDetailDialog.events({
    'click #cancel-description-button': function(e, t) {
      t.editMode.set(false);
    },

    'click #save-description-button': function(e, t) {
      var desc = $(".card-description-textarea").val().trim();
      if(desc != null && desc.length > 0) {
        Meteor.call('updateItemDesc', Session.get('currentItemId'), desc, function(err) {
          if(err) {
            Ols.Error.showError("Error changing item desc: ", err);
          }
        });
        t.editMode.set(false);
      }
    },



    'click #edit-description-button': function(e, t) {
      e.preventDefault();
      t.editMode.set(!t.editMode.get());
    },

    'click .card-title': function() {
      var item = Ols.Item.getCurrent();
      var title = prompt("Enter new card title:", item.title);
      if(title != null) {
        Meteor.call('updateItemTitle', Session.get('currentItemId'), title, function(err) {
          if(err) {
            Ols.Error.showError("Error changing item title: ", err);
          }
        });
      }
    },

    'click #set-no-milestone': function() {
      Meteor.call('removeItemMilestoneTag', Session.get('currentItemId'), function(err) {
        if(err) {
          Ols.Error.showError("Error removing milestone tag: ", err);
        }
      });
    },


    'click .card-milestone-tag-field': function() {
      var item = Ols.Item.getCurrent();
      var milestoneTag = prompt("Enter milestone tag:", item.milestoneTag);
      if(milestoneTag != null) {
        milestoneTag = slugify(milestoneTag.trim());
        if(milestoneTag.length == 0) {
          Meteor.call('removeItemMilestoneTag', Session.get('currentItemId'), function(err) {
            if(err) {
              Ols.Error.showError("Error removing milestone tag: ", err);
            }
          });
        } else {
          Meteor.call('updateItemMilestoneTag', Session.get('currentItemId'), milestoneTag, function(err) {
            if(err) {
              Ols.Error.showError("Error changing milestone tag: ", err);
            }
          });
        }
      }
    },

    'click .card-to-field': function() {
      var item = Ols.Item.getCurrent();
      var assignee = prompt("Enter username to assign card to:", item.assignee);
      if(assignee != null) {
        if(assignee.length == 0) {
          Meteor.call('removeItemAssignee', Session.get('currentItemId'), function(err) {
            if(err) {
              Ols.Error.showError("Error removing assignee: ", err);
            }
          });
        } else {
          Meteor.call('updateItemAssignee', Session.get('currentItemId'), assignee, function(err) {
            if(err) {
              Ols.Error.showError("Error changing assignee: ", err);
            }
          });
        }
      }
    },


    'click #set-type-discussion-button': function() {
      Meteor.call('updateItemType', Session.get('currentItemId'), Ols.Item.ITEM_TYPE_DISCUSSION, function(err) {
        if(err) {
          Ols.Error.showError("Error changing item type: ", err);
        }
      });
    },

    'click #set-type-bug-button': function() {
      Meteor.call('updateItemIssueType', Session.get('currentItemId'), Ols.Item.ISSUE_TYPE_BUG, function(err) {
        if(err) {
          Ols.Error.showError("Error changing item type: ", err);
        }
      });
    },

    'click #set-type-feature-button': function() {
      Meteor.call('updateItemIssueType', Session.get('currentItemId'), Ols.Item.ISSUE_TYPE_ENHANCEMENT, function(err) {
        if(err) {
          Ols.Error.showError("Error changing item type: ", err);
        }
      });
    },

    'click #set-type-task-button': function() {
      Meteor.call('updateItemIssueType', Session.get('currentItemId'), Ols.Item.ISSUE_TYPE_TASK, function(err) {
        if(err) {
          Ols.Error.showError("Error changing item type: ", err);
        }
      });
    },

    'click #set-status-new': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('updateItemStatus', Session.get('currentItemId'), 'new', function(err, result) {
        if(err) {
          Ols.Error.showError("Error changing item status: ", err);
        }
      });
    },

    'click #set-status-in-progress': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('updateItemStatus', Session.get('currentItemId'), 'in-progress', function(err, result) {
        if(err) {
          Ols.Error.showError("Error changing item status: ", err);
        }
      });
    },

    'click #set-status-blocked': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('updateItemStatus', Session.get('currentItemId'), 'blocked', function(err, result) {
        if(err) {
          Ols.Error.showError("Error changing item status: ", err);
        }
      });
    },

    'click #set-status-in-test': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('updateItemStatus', Session.get('currentItemId'), 'in-test', function(err, result) {
        if(err) {
          Ols.Error.showError("Error changing item status: ", err);
        }
      });
    },

    'click #set-status-completed': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('updateItemStatus', Session.get('currentItemId'), 'completed', function(err, result) {
        if(err) {
          Ols.Error.showError("Error changing item status: ", err);
        }
      });
    },

    'click #set-status-rejected': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('updateItemStatus', Session.get('currentItemId'), 'rejected', function(err, result) {
        if(err) {
          Ols.Error.showError("Error changing item status: ", err);
        }
      });
    },

    'click #set-status-duplicate': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('updateItemStatus', Session.get('currentItemId'), 'duplicate', function(err, result) {
        if(err) {
          Ols.Error.showError("Error changing item status: ", err);
        }
      });
    },

    'click #set-status-out-of-scope': function(e, t) {
      t.statusField.set(!t.statusField.get());
      Meteor.call('updateItemStatus', Session.get('currentItemId'), 'out-of-scope', function(err, result) {
        if(err) {
          Ols.Error.showError("Error changing item status: ", err);
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
          item.inInbox = false;
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

  Template.cardDetailMilestoneMenuItem.events({
    'click': function() {
      Meteor.call('updateItemMilestoneTag', Session.get('currentItemId'), this.title, function(err) {
        if(err) {
          Ols.Error.showError("Error changing milestone tag: ", err);
        }
      });
    }
  })
}
