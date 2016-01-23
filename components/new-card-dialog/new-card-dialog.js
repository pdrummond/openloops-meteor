if(Meteor.isClient) {

  Template.newCardDialog.onCreated(function() {
    this.toField = new ReactiveVar();
    this.selectedType = new ReactiveVar("task");
  });

  Template.newCardDialog.onRendered(function() {
    var self = this;
    this.$('#new-card-dialog').on('shown.bs.modal', function () {
      self.$('#new-card-dialog input[name="title"]').focus();
      self.$('#new-card-dialog select[name="project"]').val(Session.get('currentProjectId'));
    });
  });

  Template.newCardDialog.helpers({

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
    },

    createButtonLabel: function() {
      var label = 'Save to Backlog';
      var assignee = Template.instance().toField.get();

      if(assignee) {
        assignee = assignee.trim();
        if(assignee.length === 0) {
          label = 'Save to Backlog';
        } else if(assignee === Meteor.user().username) {
          label = 'Save to my queue';
        } else {
          label = 'Save to ' + assignee + '\'s queue';
        }
      }
      return label;
    }
  })

  Template.newCardDialog.events({

    'keyup input[name="to"]': function(e, t) {
      t.toField.set($(e.target).val());
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

    'click #save-button': function(e, t) {
      var title = $("#new-card-dialog input[name='title']").val();
      if(title != null && title.length > 0) {
        var description = $("#new-card-dialog .card-description").text();
        var type = t.selectedType.get();
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
          item.inInbox = assignee !== Meteor.user().username;
        } else {
          item.inInbox = false;
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
