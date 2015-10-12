
const MESSAGE_AGE_HOURS_INCREMENT = 10;

var msgCountBeforePaging = 0;

if(Meteor.isClient) {
  Template.registerHelper('formatDate', function (context, options) {
    if (context) {
      return moment(context).format('MMMM Do YYYY, h:mm:ss a');
    }
  });

  Meteor.startup(function() {
    Session.set("messageAgeLimit", MESSAGE_AGE_HOURS_INCREMENT);
    Deps.autorun(function() {
      Meteor.subscribe('messages', {
        messageAgeLimit: Session.get('messageAgeLimit')
      }, {
        onReady: function() {
          var numNewMessages = Messages.find().count() - msgCountBeforePaging;
          $("#message-list").scrollTop(($(".user-message").outerHeight() * numNewMessages));
        }
      });
    });
  });

  Template.app.helpers({
    messages: function() {
      return Messages.find({}, {sort: {timestamp: 1}});
    }
  });

  Template.app.onRendered(function() {
    setTimeout(function() {
      $("#message-list").scrollTop($("#message-list").height());
      $("#message-list").scroll(showMoreVisible);
    }, 2000);
  });

  function showMoreVisible() {
    if($("#message-list").scrollTop() == 0) {
      Meteor.setTimeout(function() {
        msgCountBeforePaging = Messages.find().count();
        Session.set("messageAgeLimit", Session.get("messageAgeLimit") + MESSAGE_AGE_HOURS_INCREMENT);
      }, 5);
    }
  }
}

Messages = new Meteor.Collection('messages');

if(Meteor.isServer) {

  Meteor.publish("messages", function(opts) {
    var messageAge = moment(new Date()).subtract({hours: opts.messageAgeLimit});
    var messageAgeTimestamp = messageAge.toDate().getTime();
    return Messages.find({timestamp: {$gte: messageAgeTimestamp}}, {sort: {timestamp: -1}});
  });

  function loadSampleData() {
    Messages.remove({});
    for(var id=200, hour = 1; id>=1; id--, hour++) {
      Messages.insert({
        title: 'Message ' + id,
        timestamp: moment().subtract({hours: hour}).toDate().getTime()
      });
    }
  }

  Meteor.startup(function() {
    //loadSampleData();
  });
}
