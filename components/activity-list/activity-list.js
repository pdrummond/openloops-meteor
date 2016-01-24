if(Meteor.isClient) {

  var getFilter = function() {
    var filter = {type: 'MSG_TYPE_ACTIVITY'};
    return filter;
  }

  Template.activityList.onCreated(function() {
    var self = this;
    Tracker.autorun(function() {
      self.subscribe('activityItems', function(err, result) {
        if(err) {
          Ols.Error.showError("Unable to subscribe to activity items", err);
        }
      });
    });
  });

  Template.activityList.helpers({

    messageTemplate: function() {
      var t;
      switch(this.type) {
        case Ols.MSG_TYPE_CHAT: t = 'activityListChatMessageItemView'; break;
        case Ols.MSG_TYPE_ACTIVITY: t = 'activityListActivityItemView'; break;
      }
      return t;
    },

    noItems: function() {
      return Activity.find().count() == 0;
    },

    activityItems: function() {
      return Activity.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.activityListActivityItemView.helpers({
    activityMessage: function() {
      return Ols.Activity.getActivityMessage(this);
    },

    activityContent: function() {
      return Ols.Activity.getActivityContent(this);
    },

    userImageUrl: function() {
      return Ols.User.getProfileImageUrl(this.createdBy);
    },

    showActivityContentClass: function() {
      return Ols.Activity.showActivityContentClass(this);
    }
  });

  Template.activityListActivityItemView.events({
    'click .card-key': function() {
        Ols.Item.showCardDetailDialog(this.itemId);
    }
  });

  Template.activityListChatMessageItemView.helpers({
    cardKey: function() {
      var cardKey = '???';
      item = Ols.Item.findOne(this.itemId);
      if(item) {
        var project = Ols.Project.findOne(item.projectId);
        if(project) {
          cardKey = project.key + "-" + item.pid;
        }
      }
      return cardKey;
    },

    userImageUrl: function() {
      return Ols.User.getProfileImageUrl(this.createdBy);
    },
  });

  Template.activityListChatMessageItemView.events({
    'click .card-key': function() {
        Ols.Item.showCardDetailDialog(this.itemId);
    }
  });

}
