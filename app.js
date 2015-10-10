
const MESSAGES_INCREMENT = 10;

var pageCounter = 0;

if(Meteor.isClient) {

  Meteor.startup(function() {
    Session.setDefault('messagesLimit', MESSAGES_INCREMENT);
    Deps.autorun(function() {
      Meteor.subscribe('messages', {limit: Session.get('messagesLimit')});      
    });

    
  });

  Template.app.helpers({
    messages: function() {
      var messages = Messages.find({}, {sort: {timestamp: 1}});
      messages.observeChanges({
        added: function(id, fields) {
          console.log('message inserted');
          pageCounter++;
          if(pageCounter == MESSAGES_INCREMENT) {
            console.log("BOOM - NEW MESSAGES ALL LOADED");
            $("#message-list").scrollTop(($(".user-message").outerHeight() * MESSAGES_INCREMENT));
          }
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
      return !(Messages.find().count() < Session.get('messagesLimit'));
    }

  });

  Template.app.onRendered(function() {
      setTimeout(function() {
      $("#message-list").scrollTop($("#message-list").height());
      $("#message-list").scroll(showMoreVisible);
      }, 5);
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
        Session.set("messagesLimit", Session.get("messagesLimit") + MESSAGES_INCREMENT);          
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
    for(var i=1; i<=200; i++) {
      Messages.insert({
        title: 'Message ' + i,
        timestamp: new Date()
      });
    }
  });

  Meteor.publish("messages", function(opts) {
    return Messages.find({}, {limit: opts.limit, sort: {timestamp: -1}});
  });
}