
OpenLoops = {};

if(Meteor.isClient) {

	Meteor.startup(function() {
    Session.set('numIncomingMessages', 0);
		Session.set('exploreMode', false);
	});

	OpenLoops.removeSidebarNewMessages = function(itemId) {
		var $itemMsgCount;
		if(itemId) {
			$itemMsgCount = $(".left-sidebar .item-list li[data-id='" + itemId + "'] .item-msg-count");

		} else {
			$itemMsgCount = $(".left-sidebar #board-item .new-messages")
		}
		$itemMsgCount.attr("data-msg-count", 0);
		$itemMsgCount.removeClass("new-messages");
	}

	OpenLoops.getFilterQuery = function(filterString) {
		var filter = {};
		var remainingText = filterString;
		var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
		var match = re.exec(filterString);
		while (match != null) {
			var field = match[1].trim();
			var value = match[2].trim();
			remainingText = remainingText.replace(field, '');
			remainingText = remainingText.replace(value, '');
			remainingText = remainingText.replace(/:/g, '');
      if(field == 'projectId') {
        value = {$in: value.split('-') };
      } else if(field == "label") {
				field = "labels";
				var label = Labels.findOne({title: value});
				if(label != null) {
					value = label._id;
				}
			} else if(field == 'type') {
				if(value == 'bug' || value == 'enhancement' || value == 'task') {
					field = 'issueType';
				}
			} else if(field == 'label') {
				field = 'labels';
			} else if(field == 'open') {
				field = "isOpen";
			} else if(field == 'closed') {
				field = "isOpen";
				value = (value=="true" ? "false" : "true");
			}

			if(value == "true") {
				value = true;
			} else if(value == "false") {
				value = false;
			}
			filter[field] = value;
			match = re.exec(filterString);
		}
		if(remainingText && remainingText.length > 0) {
			//console.log("REMAINING TEXT: " + remainingText);
			filter["$or"] = [{title: {$regex:remainingText}}];
		}
		console.log("getFilterQuery: Current client-side item filter is: " + JSON.stringify(filter));
		return filter;
	}

	Template.createFilterForm.events({
		'click #create-button': function(e) {
			e.preventDefault();
			var title = $("#createFilterForm input[name='title']").val();
			if(title != null && title.length > 0) {
				var query = $("#createFilterForm input[name='query']").val();
				Meteor.call('insertFilter', {
					boardId: Session.get('currentBoardId'),
					title: title,
					query: query
				});
				FlowRouter.go("/project/" + Session.get('currentProjectId') + "/board/" + Session.get('currentBoardId'));
			}
		}
	});

  Template.app.onCreated(function() {
    var self = this;
    Meteor.defer(function() {
      self.subscribe('workspaces', function() {
        var workspace = Workspaces.findOne({username: Meteor.user().username});
        Session.set('currentWorkspaceId', workspace._id);
      });
    });
		this.subscribe('allUsernames');
		this.subscribe('userStatus');
		this.subscribe('projects');
		this.subscribe('boards');
		this.subscribe('teamMembers');
		this.subscribe('labels');
		this.subscribe('cards');
    this.subscribe('activity');
    this.subscribe('milestones');
	});

	Template.app.events({
		'click #logout-link': function() {
			Meteor.logout();
			FlowRouter.go("/");
		}
	});

	/*
	var previousMessageDate = null;
	Template.messageItemView.onRendered(function() {
	var messageDate = moment(this.data.createdAt).date();
	if(previousMessageDate && (messageDate < previousMessageDate)) {
	this.$(".user-message").addClass('new-day');
	this.$(".user-message").attr('data-date', moment(this.data.createdAt).format('MMMM Do YYYY'));
	}
	previousMessageDate = messageDate;
	console.log("previousMessageDate: " + previousMessageDate);
	});*/

	Template.messageItemView.helpers({

		messageTemplate: function() {
			var t;
			switch(this.type) {
				case Ols.MSG_TYPE_CHAT: t = 'chatMessageItemView'; break;
				case Ols.MSG_TYPE_ACTIVITY: t = 'activityMessageItemView'; break;
			}
			return t;
		}
	});

	Template.chatMessageItemView.events({
		'click .board-title': function() {
			FlowRouter.go('boardMessages', {projectId: this.projectId, boardId: this.boardId});
		}
	});

	Template.chatMessageItemView.helpers({

		itemTitle: function() {
			var item = Ols.Item.findOne(this.itemId);
			return item ? 'in ' + item.title:'';
		},

		showItemLink: function() {
			return Session.get('currentItemId')?'hide':'';
		},

		messageDate: function() {
			return moment(this.createdAt).date();
		},

		userImageUrl: function() {
			return Ols.User.getProfileImageUrl(this.createdBy);
		},

		boardTitle: function() {
			var board = Boards.findOne(this.boardId);
			return board?board.title:'';
		}
	});

	Template.activityMessageItemView.events({
		'click .board-title': function() {
			FlowRouter.go('boardMessages', {projectId: this.projectId, boardId: this.boardId});
		}
	});

	Template.activityMessageItemView.helpers({

		userImageUrl: function() {
			return this.activityImageUrl?this.activityImageUrl:Ols.User.getProfileImageUrl(this.createdBy);
		},

		activityMessage: function() {
			return Ols.Activity.getActivityMessage(this);
		},

		activityContent: function() {
			return Ols.Activity.getActivityContent(this);
		},

		showActivityContentClass: function() {
			return Ols.Activity.showActivityContentClass(this);
		},

		showItemLink: function() {
			return Session.get('currentItemId')?'hide':'';
		},

		messageDate: function() {
			return moment(this.createdAt).date();
		},

		boardTitle: function() {
			var board = Boards.findOne(this.boardId);
			return board?board.title:'';
		}
	});

	Template.itemItemView.helpers({
		isClosedClass: function() {
			return this.isOpen?'':'closed';
		},

		numMessages: function() {
			return this.numMessages - 1; //to remove the description
		},

		typeIcon: function() {
			return Ols.Item.getTypeIconClass(this);
		},

		typeIconColor: function() {
			return Ols.Item.getTypeIconColor(this);
		},

		itemLabelIds: function() {
			var item = Ols.Item.findOne(this._id);
			return item?item.labels:[];
		},

		isActive: function() {
			return this._id == Session.get('currentItemId')?'active':'';
		}
	});

	Template.itemItemView.events({
		'click #top-content': function() {
      Session.set('currentItemId', this._id);

      $("#card-detail-dialog").modal({
          backdrop: 'static'
      });
		},

		'click .label-item': function(e) {
			//FIXME: this should be merged with same code in labels.js
			var labelTitle = $(e.target).text();
			var labelColor = $(e.target).data('color');
			Session.set('filterQuery', 'label:' + labelTitle);
			Session.set('leftSidebarActiveTab', 'items-tab');
			Session.set('filterSentence', Ols.Filter.generateFilterSentenceFromLabel({
				title: labelTitle,
				color: labelColor
			}));
		}
	});

	OpenLoops.getItemTypePhrase = function(itemType, issueType) {
		var type = 'an item';
		switch(itemType) {
			case Ols.ITEM_TYPE_DISCUSSION: type = 'a discussion'; break;
			case Ols.ITEM_TYPE_ISSUE: type = 'an issue'; break;
			case Ols.ITEM_TYPE_ARTICLE: type = 'an article'; break;
		}
		if(itemType == Ols.ITEM_TYPE_ISSUE && issueType != null) {
			switch(issueType) {
				case Ols.ISSUE_TYPE_BUG: type = 'a bug'; break;
				case Ols.ISSUE_TYPE_TASK: type = 'a task'; break;
				case Ols.ISSUE_TYPE_ENHANCEMENT: type = 'an enhancement'; break;
			}
		}
		return type;
	},

	Template.tabHeader.events({
		'click': function() {
			Session.set('activeItemTab', this._id);
			console.log("activeItemTab: " + Session.get('activeItemTab'))
		}
	});

	Template.tabBody.helpers({

		tabBodyTemplate: function() {
			switch(this.type) {
				case Ols.Item.Tab.TAB_TYPE_ITEM_DESCRIPTION:
					template = "itemDescription";
					break;
				case Ols.Item.Tab.TAB_TYPE_MESSAGE_HISTORY:
					template = "messageHistory";
					break;
				case Ols.Item.Tab.TAB_TYPE_ACTIVITY_HISTORY:
					template = "activityHistory";
					break;
				case Ols.Item.Tab.TAB_TYPE_CHECKLIST:
					template = "checkList";
					break;
				case Ols.Item.Tab.TAB_TYPE_REFLIST:
					template = "refList";
					break;
				default:
					console.error("No template for tab " + this.type);
					break;
			}
			return template;
		}
	});

	Template.itemDescription.helpers({
		itemDescription: function() {
			var item = Ols.Item.getCurrent();
			return item && item.description && item.description.length > 0 ? item.description : '*No Description*';
		}
	});

	Template.filterItem.events({
		'click': function() {
			Session.set('filterQuery', this.query);
			Session.set('activeFilterLabel', this.title);
			$("#list-menu").slideUp();
		}
	});

	Template.boardChooserMenu.helpers({
		boards: function() {
			return Boards.find({favourite:true});
		}
	});

	Template.boardChooserItem.helpers({
		projectTitle: function() {
			var project = Ols.Project.get(this.projectId);
			return project.title?project.title:'';
		}
	});

	Template.boardChooserItem.events({

		'click': function() {
			var self = this;
			$("#board-chooser-menu").slideUp();
			Ols.Router.showBoardMessages(this._id);
			Ols.Explore.setExploreMode(false);
		}
	});

	Template.moveToBoardList.helpers({
		boards: function() {
			return Boards.find({_id: {$ne: Session.get('currentBoardId')}, projectId: Session.get('currentProjectId')});
		}
	});

	Template.moveToBoardItem.events({
		'click': function() {
			var self = this;
			$("#move-to-board-list").slideUp();
			var item = Ols.Item.findOne(Session.get('currentItemId'));
			Meteor.call('moveItem', Session.get('currentItemId'), this._id, function(err, result) {
				if(err) {
					Ols.Error.showError('Error moving item: ', err);
				}
			});
			Ols.Router.showBoardMessages();
		}
	});

	Template.onlyIfProjectAccess.helpers({
		authInProcess: function() {
			return Meteor.loggingIn();
		},
		canShow: function() {
			var canShow = false;
			if(Meteor.user() != null && Session.get('currentProjectId') != null) {
				canShow = Ols.Project.isUserProjectMember(Session.get('currentProjectId'), Meteor.user().username);
			}
			return canShow;
		}
	});

	Template.onlyIfLoggedIn.helpers({
		authInProcess: function() {
			return Meteor.loggingIn();
		},
		canShow: function() {
			return !!Meteor.user();
		}
	});

	Template.onlyIfAdminUser.helpers({
		authInProcess: function() {
			return Meteor.loggingIn();
		},
		canShow: function() {
			return Ols.User.currentUserRole() == Ols.ROLE_ADMIN;
		}
	});

} //isClient
