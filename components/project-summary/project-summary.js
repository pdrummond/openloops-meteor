if(Meteor.isClient) {
  Template.projectSummary.helpers({
    numOpenCards: function() {
      return Items.find({isOpen: true, type: 'issue', projectId: Session.get('currentProjectId')}).count();
    },

    numClosedCards: function() {
      return Items.find({isOpen: false, type: 'issue', projectId: Session.get('currentProjectId')}).count();
    },

    percentage: function() {
      var numClosed = Items.find({isOpen: false, type: 'issue', projectId: Session.get('currentProjectId')}).count();
      var numTotal = Items.find({type: 'issue', projectId: Session.get('currentProjectId')}).count();
      var p =  (numClosed / numTotal) * 100;
      return p;
    },

    projects: function() {
      return Ols.Project.find({'members.username': Meteor.user().username});
    },

    currentProjectTitle: function() {
      var project = Ols.Project.getCurrent(Session.get('currentProjectId'));
      return project && project.title?project.title:'';
    },

    backLogVisibility: function() {
      var backlog = Workspaces.findOne({username: Meteor.user().username, 'queues.type': 'BACKLOG_QUEUE'});
      return backlog != null? 'visible':'hidden';
    },

    doneListVisibility: function() {
      var doneList = Workspaces.findOne({username: Meteor.user().username, 'queues.type': 'DONE_QUEUE'});
      return doneList != null? 'visible':'hidden';
    },

    discussionListVisibility: function() {
      var discussionList = Workspaces.findOne({username: Meteor.user().username, 'queues.type': 'DISCUSSIONS_QUEUE'});
      return discussionList != null? 'visible':'hidden';
    },

    backLogCount: function() {
      var filter = {};
      filter.assignee = {$exists: false};
      filter.milestoneTag = {$exists: false};
      filter.isOpen = true;
      filter.type = Ols.Item.ITEM_TYPE_ISSUE;
      return Ols.Item.find(filter).count();
    },

    doneListCount: function() {
      var filter = {};
      filter.isOpen = false;
      filter.type = Ols.Item.ITEM_TYPE_ISSUE;
      return Ols.Item.find(filter).count();
    },

    discussionListCount: function() {
      var filter = {};
      filter.assignee = {$exists: false};
      filter.isOpen = true;
      filter.type = Ols.Item.ITEM_TYPE_DISCUSSION;
      return Ols.Item.find(filter).count();
    },

    projectMembers: function() {
      var project = Ols.Project.findOne(Session.get('currentProjectId'))
			return project && project.members?project.members:[];
    },

    projectMilestones: function() {
      return Milestones.find({projectId: Session.get('currentProjectId')});
    }
  });

  Template.projectSummary.events({
    'click #backlog': function() {
      var backlog = Workspaces.findOne({username: Meteor.user().username, 'queues.type': 'BACKLOG_QUEUE'});
      if(backlog == null) {
        var queue = {title:"Backlog", 'type': 'BACKLOG_QUEUE'};
        Meteor.call('addQueue', Session.get('currentWorkspaceId'), queue, function(err, res) {
          if(err) {
            alert("Error - unable to add backlog: " + err);
          }
        });
      } else {
        Meteor.call('removeQueue', Session.get('currentWorkspaceId'), {type:'BACKLOG_QUEUE'}, function(err, res) {
          if(err) {
            alert("Error - unable to remove backlog: " + err);
          }
        });
      }
    },

    'click #done-list': function() {
      var doneList = Workspaces.findOne({username: Meteor.user().username, 'queues.type': 'DONE_QUEUE'});
      if(doneList == null) {
        var queue = {title:"Resolved Cards", 'type': 'DONE_QUEUE'};
        Meteor.call('addQueue', Session.get('currentWorkspaceId'), queue, function(err, res) {
          if(err) {
            alert("Error - unable to add done list: " + err);
          }
        });
      } else {
        Meteor.call('removeQueue', Session.get('currentWorkspaceId'), {type:'DONE_QUEUE'}, function(err, res) {
          if(err) {
            alert("Error - unable to remove done list: " + err);
          }
        });
      }
    },

    'click #discussion-list': function() {
      var discussionList = Workspaces.findOne({username: Meteor.user().username, 'queues.type': 'DISCUSSIONS_QUEUE'});
      if(discussionList == null) {
        var queue = {title:"Discussions", 'type': 'DISCUSSIONS_QUEUE'};
        Meteor.call('addQueue', Session.get('currentWorkspaceId'), queue, function(err, res) {
          if(err) {
            alert("Error - unable to add discussions list: " + err);
          }
        });
      } else {
        Meteor.call('removeQueue', Session.get('currentWorkspaceId'), {type:'DISCUSSIONS_QUEUE'}, function(err, res) {
          if(err) {
            alert("Error - unable to remove discussion list: " + err);
          }
        });
      }
    }

  });

  Template.projectSummaryMemberItem.events({
    'click': function() {
      var userList = Workspaces.findOne({username: Meteor.user().username, 'queues.username': this.username, 'queues.type': 'USER_QUEUE'});
      if(userList == null) {
        var queue = {title:this.username, 'type': 'USER_QUEUE', username: this.username};
        Meteor.call('addQueue', Session.get('currentWorkspaceId'), queue, function(err, res) {
          if(err) {
            alert("Error - unable to add user list: " + err);
          }
        });
      } else {
        Meteor.call('removeQueue', Session.get('currentWorkspaceId'), {username: this.username, type:'USER_QUEUE'}, function(err, res) {
          if(err) {
            alert("Error - unable to remove user list: " + err);
          }
        });
      }
    }
  })

  Template.projectSummaryMemberItem.helpers({
    cardCount: function() {
      return Items.find({assignee: this.username, type: 'issue', projectId: Session.get('currentProjectId')}).count();
    },

    userListVisibility: function() {
      var userList = Workspaces.findOne({username: Meteor.user().username, 'queues.username': this.username, 'queues.type': 'USER_QUEUE'});
      return userList != null? 'visible':'hidden';
    },
  });

  Template.projectSummaryMilestoneItem.events({
    'click': function() {
      var milestoneList = Workspaces.findOne({username: Meteor.user().username, 'queues.milestoneTag': this.title, 'queues.type': 'MILESTONE_QUEUE'});
      if(milestoneList == null) {
        var queue = {title:this.title, 'type': 'MILESTONE_QUEUE', milestoneTag: this.title};
        Meteor.call('addQueue', Session.get('currentWorkspaceId'), queue, function(err, res) {
          if(err) {
            alert("Error - unable to add milestone list: " + err);
          }
        });
      } else {
        Meteor.call('removeQueue', Session.get('currentWorkspaceId'), {milestoneTag: this.title, type:'MILESTONE_QUEUE'}, function(err, res) {
          if(err) {
            alert("Error - unable to remove milestone list: " + err);
          }
        });
      }
    }
  })

  Template.projectSummaryMilestoneItem.helpers({
    numOpenCards: function() {
      return Items.find({milestoneTag: this.title, type: 'issue', isOpen: true, projectId: Session.get('currentProjectId')}).count();
    },

    numClosedCards: function() {
      return Items.find({milestoneTag: this.title, type: 'issue', isOpen: false, projectId: Session.get('currentProjectId')}).count();
    },

    percentage: function() {
      var numClosed = Items.find({milestoneTag: this.title, type: 'issue', isOpen: false, projectId: Session.get('currentProjectId')}).count();
      var numTotal = Items.find({milestoneTag: this.title, type: 'issue', projectId: Session.get('currentProjectId')}).count();
      var p =  (numClosed / numTotal) * 100;
      return p;
    },

    milestoneListVisibility: function() {
      var milestoneList = Workspaces.findOne({username: Meteor.user().username, 'queues.milestoneTag': this.title, 'queues.type': 'MILESTONE_QUEUE'});
      return milestoneList != null? 'visible':'hidden';
    },
  })
}
