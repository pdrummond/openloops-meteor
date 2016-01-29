if(Meteor.isClient) {

  Template.newCardDialog.onCreated(function() {
    this.assigneeField = new ReactiveVar();
    this.selectedType = new ReactiveVar("task");
    this.selectedStatus = new ReactiveVar("new");
  });

  Template.newCardDialog.onRendered(function() {
    var self = this;
    this.$('#new-card-dialog').on('shown.bs.modal', function () {
      self.$('#new-card-dialog input[name="title"]').focus();
      self.$('#new-card-dialog select[name="project"]').val(Session.get('currentProjectId'));
    });
  });

  Template.newCardDialog.helpers({

    milestoneTagLabel: function() {
      return Session.get('newCardMilestoneTag') || 'No Milestone';
    },

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

    projects: function() {
      return Ols.Project.find({'members.username': Meteor.user().username});
    },

    milestoneLabel: function() {
      var item = Items.findOne(Session.get('currentItemId'));
      return item && item.milestoneTag ? item.milestoneTag : 'No Milestone';
    },

    statusLabel: function() {
      var item = Items.findOne(Session.get('currentItemId'));
      var label = 'New';
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

    projects: function() {
      return Ols.Project.find({'members.username': Meteor.user().username});
    }
  })

  Template.newCardDialog.events({

    'keyup input[name="to"]': function(e, t) {
      t.assigneeField.set($(e.target).val());
    },

    'click #set-type-task-button': function(e, t) {
      t.selectedType.set("task");
    },

    'click #set-type-bug-button': function(e, t) {
      t.selectedType.set("bug");
    },

    'click #set-type-feature-button': function(e, t) {
      t.selectedType.set("enhancement");
    },

    'click #set-type-task-button': function(e, t) {
      t.selectedType.set("task");
    },

    'click #set-type-discussion-button': function(e, t) {
      t.selectedType.set("discussion");
    },

    'click #set-status-new': function(e, t) {
      t.selectedStatus.set('new');
    },

    'click #set-status-in-progress': function(e, t) {
      t.selectedStatus.set('in-progress');
    },

    'click #set-status-in-test': function(e, t) {
      t.selectedStatus.set('in-test');
    },

    'click #set-status-blocked': function(e, t) {
      t.selectedStatus.set('blocked');
    },

    'click #save-button': function(e, t) {
      var title = $("#new-card-dialog input[name='title']").val();
      if(title != null && title.length > 0) {
        var description = $("#new-card-dialog .card-description").val();
        var type = t.selectedType.get();
        var project = Session.get('currentProjectId');//$("#new-card-dialog select[name='project']").val();
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
          projectId: project,
          status: t.selectedStatus.get()
        };
        var milestoneTag = Session.get('newCardMilestoneTag');
        if(milestoneTag) {
          item.milestoneTag = milestoneTag;
        }
        var assignee = $("#new-card-dialog input[name='assignee']").val();
        if(assignee && assignee.trim().length > 0) {
          item.assignee = assignee.trim();
          item.inInbox = assignee !== Meteor.user().username;
        } else {
          item.inInbox = false;
        }


        Meteor.call('insertItem', item, function(err, newItem) {
          if(err) {
            Ols.Error.showError("Error adding item",  err);
          } else {
            $("#new-card-dialog input[name='title']").val('');
            $("#new-card-dialog .card-description").val('');
            $("#new-card-dialog input[name='assignee']").val('');
            //initSortable( '.sortable', t);
          }
        });
      }
    }
  });

  Template.newCardMilestoneMenuItem.events({
    'click': function() {
      Session.set('newCardMilestoneTag', this.title);
    }
  })

}
