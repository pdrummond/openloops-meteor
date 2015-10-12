
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
		Meteor.subscribe('items');
		Deps.autorun(function() {
			Meteor.subscribe('messages', {
				messageAgeLimit: Session.get('messageAgeLimit'),
				itemId: Session.get('currentItemId')
			}, {
				onReady: function() {
					var numNewMessages = Messages.find().count() - msgCountBeforePaging;
					$("#message-list").scrollTop(($(".user-message").outerHeight() * numNewMessages));
				}
			});
		});
	});

	Template.createForm.events({
		'click #create-button': function(e) {
			e.preventDefault();
			var title = $("#createForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var description = $("#createForm textarea[name='description']").val();

				Items.insert({
					title: title,
					description: description,
					timestamp: new Date().getTime()
				});
				Session.set('currentPage', 'feedPage');
			}
		}
	});

	Template.messageBox.events({
		'keypress #message-box': function(e) {
			var inputVal = $('#message-box').val();
			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			if(charCode == 13 && (inputVal == null || inputVal.length == 0)) {
				e.preventDefault();
				e.stopPropagation();
			} else {
				if (charCode == 13 && e.shiftKey == false) {
					e.preventDefault();
					e.stopPropagation();
					if(inputVal.length > 0) {
						Messages.insert({
							title: inputVal,
							timestamp: new Date().getTime(),
							itemId: Session.get('currentItemId')
						});
						$("#message-box").val('');
					}
				}
			}
		}
	});

	Template.app.helpers({
		currentPage: function() {
			return Session.get('currentPage');
		}
	});

	Template.feed.helpers({
		messages: function() {
			return Messages.find({}, {sort: {timestamp: 1}});
		}
	});

	Template.leftSidebar.helpers({
		items: function() {
			return Items.find();
		}
	});

	Template.app.onRendered(function() {
		$("#message-list").scrollTop($("#message-list").height());
		$("#message-list").scroll(showMoreVisible);
	});

	function showMoreVisible() {
		if($("#message-list").scrollTop() == 0) {
			msgCountBeforePaging = Messages.find().count();
			Session.set("messageAgeLimit", Session.get("messageAgeLimit") + MESSAGE_AGE_HOURS_INCREMENT);
		}
	}

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_AND_EMAIL"
	});
} //isClient

Items = new Meteor.Collection('items');
Messages = new Meteor.Collection('messages');

if(Meteor.isServer) {

	Meteor.publish("items", function() {
		return Items.find();
	});

	Meteor.publish("messages", function(opts) {
		var messageAge = moment(new Date()).subtract({hours: opts.messageAgeLimit});
		var messageAgeTimestamp = messageAge.toDate().getTime();
		return Messages.find({
			itemId: opts.itemId,
			timestamp: {$gte: messageAgeTimestamp}
		}, {
			sort: {timestamp: -1}
		});
	});

	Meteor.startup(function() {
		//loadSampleData();
	});

	function loadSampleData() {
		Items.remove({});
		var itemOneId = Items.insert({
			title: 'Item One',
			description: 'Item one description',
			timestamp: new Date().getTime()
		});
		console.log("ITEM ONE ID: " + itemOneId);
		Messages.remove({});
		for(var id=200, hour = 1; id>=1; id--, hour++) {
			Messages.insert({
				title: 'Message ' + id,
				timestamp: moment().subtract({hours: hour}).toDate().getTime(),
				itemId: itemOneId
			});
		}
	}
}
FlowRouter.route('/', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'feedPage');
	}
});

FlowRouter.route('/item/:itemId', {
	action: function(params, queryParams) {
		Session.set('currentItemId', params.itemId);
		Session.set('currentPage', 'feedPage');
	}
});

FlowRouter.route('/create', {
	action: function(params, queryParams) {
		Session.set('currentPage', 'createPage')
	}
});
