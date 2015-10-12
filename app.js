
const MESSAGE_AGE_HOURS_INCREMENT = 48;

var pageCounter = 0;

if(Meteor.isClient) {

  Template.registerHelper('formatDate', function (context, options) {
  	if (context) {
  		return moment(context).format('MMMM Do YYYY, h:mm:ss a');
  	}
  });


  Meteor.startup(function() {
    //Session.setDefault("messageAgeLimit", MESSAGE_AGE_HOURS_INCREMENT);
    Session.set("messageAgeLimit", MESSAGE_AGE_HOURS_INCREMENT);
    Deps.autorun(function() {
      Meteor.subscribe('messages', {
        messageAgeLimit: Session.get('messageAgeLimit')
      });
    });
  });

  Template.app.helpers({
    messages: function() {
      var messages = Messages.find({}, {sort: {timestamp: 1}});
      messages.observeChanges({
        added: function(id, fields) {
          console.log('message inserted');
          /*pageCounter++;
          if(pageCounter == MESSAGES_INCREMENT) {
          console.log("BOOM - NEW MESSAGES ALL LOADED");
          $("#message-list").scrollTop(($(".user-message").outerHeight() * MESSAGES_INCREMENT));
        }*/
      },
      changed: function(id, fields) {
        console.log('message updated');
      },
      removed: function() {
        console.log('message removed');
      }
    });
    return messages;
  },

  moreResults: function() {
    //return !(Messages.find().count() < Session.get('messagesLimit'));
    return true;
  }

});

//message 100: eCuPav8Nfgp5jfwBN

Template.app.onRendered(function() {
  setTimeout(function() {
    var selectedMessageId = Session.get('selectedMessageId');
    if(selectedMessageId) {
      /*$('#message-list').animate({
      scrollTop: $("." + selectedMessageId).offset().top
    }, 1000);*/
    $(".user-message[data-id='" + selectedMessageId + "']").addClass("selected");
  } else {
    $("#message-list").scrollTop($("#message-list").height());
  }
  //$("#message-list").scroll(showMoreVisible);
}, 2000);
});

function showMoreVisible() {
  console.log('xxx');
  var theshold, target = $("#showMoreResults");
  if(!target.length) return;

  threshold = $(window).scrollTop() + $(window).height() - target.height();
  console.log("message list scrollTop:" + $("#message-list").scrollTop());
  console.log("threshold:" + threshold);
  console.log("target offset top: " + target.offset().top);
  console.log("user message height: " + $(".user-message").outerHeight())

  //if (target.offset().top == threshold) {
  if($("#message-list").scrollTop() == 0) {
    if (!target.attr("data-visible") == false) {
      target.attr("data-visible", true);
    }
    //$(".user-message:first").addClass('anchor-message');
    Meteor.setTimeout(function() {
      pageCounter = 0;
      Session.set("messageAgeLimit", Session.get("messageAgeLimit") + MESSAGE_AGE_HOURS_INCREMENT);
      //$(window).scrollTo(".anchor-message");
    }, 5);

  } else {
    if (target.attr("data-visible")) {
      target.attr("data-visible", false);
    }
  }
}
}

Messages = new Meteor.Collection('messages');

if(Meteor.isServer) {

  Meteor.startup(function() {
    Messages.remove({});
    for(var id=200, hour = 1; id>=1; id--, hour++) {
      Messages.insert({
        title: 'Message ' + id,
        timestamp: moment().subtract({hours: hour}).toDate().getTime()
      });
    }
  });

  Meteor.publish("messages", function(opts) {
    console.log("xxx: " + opts.messageAgeLimit);
    var messageAge = moment(new Date()).subtract({hours: opts.messageAgeLimit});
    console.log("messageAge: " + messageAge.format('MMMM Do YYYY, h:mm:ss a'));
    var messageAgeTimestamp = messageAge.toDate().getTime();
    //console.log("messageAgeTimestamp: " + messageAgeTimestamp);
    //return Messages.find({timestamp: {$gte: messageAgeTimestamp}}, {sort: {timestamp: -1}});
    return Messages.find({}, {sort: {timestamp: 1}});
  });
}

FlowRouter.route('/messages/:messageId', {
  action: function(params, queryParams) {
    console.log("MESSAGE ID IS " + params.messageId);
    Session.set('startMessageId', params.messageId);
  }
});
