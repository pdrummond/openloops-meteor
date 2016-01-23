
Workspaces = new Meteor.Collection('workspace');
Cards = new Meteor.Collection('cards');

Items.allow({
  insert: function (userId, item) {
    return true;
  },
  update: function (userId, item) {
    return true;
  },
  remove: function (userId, item) {
    return true;
  },
});

if(Meteor.isServer) {

  Sortable.collections = ['items'];

  /*
  if(Workspaces.find().count() == 0) {
    Workspaces.insert({
      username: 'pdrummond',
      title: 'pdrummond',
      queues: [
                {title:'pdrummond', 'type': 'USER_QUEUE', 'username': 'pdrummond'},
                {title:'harold', 'type': 'USER_QUEUE', 'username': 'harold'},
              ]
    });
  }*/

  Meteor.publish("workspaces", function() {
    return Workspaces.find();
  });

  Meteor.methods({
    addQueue: function(workspaceId, queue) {
      if(Workspaces.findOne({queues: queue.username}) != null) {
  			throw new Meteor.Error("insert-queue-queue-error-001", 'Queue for ' + queue.username + ' already exists');
  		}
  		Workspaces.update(workspaceId, {$addToSet: {queues: queue}});
    },

    removeQueue: function(workspaceId, queue) {
  		Workspaces.update(workspaceId, {$pull: {queues: {username: queue.username}}});
    }
  });

}

if(Meteor.isClient) {

  Template.workspace.onCreated(function() {
    var self = this;
		Tracker.autorun(function() {
			var opts = {};
			opts.filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
      Tracker.nonreactive(function() {
        opts.username = Meteor.user().username;
      });
      opts.filter.projectId = Session.get('currentProjectId');
			self.subscribe('items', opts, function(err, result) {
				if(err) {
					Ols.Error.showError("Items Subscription error", err);
				}
			});
		});
	});

  Template.workspace.helpers({

    queues: function() {
      var workspace = Workspaces.findOne({username: Meteor.user().username});
      return workspace.queues;
    },

    tabs: function() {
      var item = Ols.Item.getCurrent();
      return item && item.tabs ? item.tabs : [];
    },

    filterQuery: function() {
      return Session.get('filterQuery');
    },

    isActive: function(tabName) {
      var active = false;
      var query = Session.get('filterQuery');
      switch(tabName) {
        case '': active = (!query || query.length == 0); break;
        case 'discussion': active = (query == 'type:discussion'); break;
        case 'issue': active = (query == 'type:issue'); break;
        case 'article': active = (query == 'type:article'); break;
      }
      return active?'active':'';
    },

    currentItemIcon: function() {
      return OpenLoops.getItemTypeIcon(Ols.Item.findOne(Session.get('currentItemId')));
    },

    currentItemIconColor: function() {
      return OpenLoops.getItemTypeIconColor(Ols.Item.findOne(Session.get('currentItemId')));
    },

    currentItemType: function() {
      var item = Ols.Item.findOne(Session.get('currentItemId'));
      return item?item.type:'';
    },

    currentItemIssueType: function() {
      var item = Ols.Item.findOne(Session.get('currentItemId'));
      return item?item.issueType:'';
    },

    currentItemLabels: function() {
      var item = Ols.Item.findOne(Session.get('currentItemId'));
      return item?item.labels:[];
    },

    boardTitle: function() {
      return Boards.findOne(Ols.Item.findOne(Session.get('currentItemId')).boardId).title;
    },

    isTabActive: function(tabName) {
      if(!Session.get('currentItemId') && tabName == 'messages') {
        return 'active';
      } else {
        return Session.get('activeItemTab') == tabName?'active':'';
      }
    }
  });

  /*let initSortable = ( sortableClass, template ) => {
    let sortableList = template.$( sortableClass );
    sortableList.sortable( 'destroy' );
    sortableList.sortable();
    sortableList.sortable().off( 'sortupdate' );
    sortableList.sortable().on( 'sortupdate', () => {
      updateIndexes( '.sortable', template );
    });
  };

  let updateIndexes = ( sortableClass, template ) => {
    let items = [];

    template.$( `${sortableClass} li` ).each( ( index, element ) => {
      items.push( { _id: $( element ).data( 'id' ), order: index + 1 } );
    });

    Meteor.call( 'updateItemsOrder', items, ( error ) => {
      if ( error ) {
        alert( error.reason );
      }
    });
  };*/

  Template.queue.onCreated(function() {
    var self = this;
    this.queueType = new ReactiveVar("WORK");
    this.selectedWidth = new ReactiveVar('370px');
    this.selectedCardId = new ReactiveVar();
    Meteor.setTimeout(function() {
      console.log("ENABLING SORTABLE");
      //initSortable( '.sortable', self);
    }, 1000);
  });

  Template.queue.helpers({
    items: function () {
      var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
      filter.assignee = this.username;
      filter.inInbox = Template.instance().queueType.get() == "INBOX";
      return Items.find(filter, {sort: {order: 1}});
    },

    isCardSelected: function() {
      return Template.instance().selectedCardId.get() != null;
    },

    selectedItemTitle: function() {
      var title = "???";
      item = Ols.Item.findOne(Template.instance().selectedCardId.get());
      if(item) {
        title = item.title;
      }
      return title;
    },

    selectedCardDescription: function() {
      var desc = "No Description";
      item = Ols.Item.findOne(Template.instance().selectedCardId.get());
      if(item && item.description) {
        desc = item.description;
      }
      return desc;
    },

    selectedItemIcon: function() {
      item = Ols.Item.findOne(Template.instance().selectedCardId.get());
      return OpenLoops.getItemTypeIcon(item);
    },

    selectedItemIconColor: function() {
      item = Ols.Item.findOne(Template.instance().selectedCardId.get());
      return OpenLoops.getItemTypeIconColor(item);
    },

    selectedCardKey: function() {
      var cardKey = '???';
      item = Ols.Item.findOne(Template.instance().selectedCardId.get());
      if(item) {
        var project = Ols.Project.findOne(item.projectId);
        if(project) {
          cardKey = project.key + "-" + item.pid;
        }
      }
      return cardKey;
    },

    selectedItemId: function() {
      return Template.instance().selectedCardId.get();
    },

    _getSelectedCardId: function() {
      return Template.instance().selectedCardId;
    },

    itemsOptions: {
      /*sortField: 'order',  // defaults to 'order' anyway
      group: {
        name: 'queue',
        pull: true,
        put: true
      }*/
    },

    queueSwitchCount: function() {
      var t = Template.instance();
      var queueType = Template.instance().queueType.get();
      var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
      filter.assignee = this.username;
      filter.inInbox = queueType === "WORK";
      var count = Items.find(filter).count();
      if(count > 0) {
        if(queueType === 'WORK' && Meteor.user().username === this.username) {
          return '<span class="notification-badge">' + count + '</span>';
        } else {
          return "(" + count + ")";
        }
      } else {
        return "";
      }
    },

    queueSwitchIcon: function() {
      var t = Template.instance();
      return t.queueType.get() === "WORK"?"fa-inbox":"fa-bars";
    },

    queueTitle: function() {
      var t = Template.instance();
      return t.queueType.get() === "WORK"?"QUEUE":"INBOX";
    },

    queueSwitchTitle: function() {
      var t = Template.instance();
      return t.queueType.get() === "WORK"?"Inbox":"Work Queue";
    },

    queueWidth: function() {
      return Template.instance().selectedWidth.get();
    }

  });

  Template.queue.events({

    'click #switch-queue': function(e, t) {
      var type = t.queueType.get();
      if(type === 'INBOX') {
        t.queueType.set('WORK');
      } else {
        t.queueType.set('INBOX');
      }
    },

    'click #remove-queue': function() {
      var queue = this;
      Meteor.call('removeQueue', Session.get('currentWorkspaceId'), queue, function(err, res) {
        if(err) {
          alert("Error - unable to remove queue: " + err);
        }
      });
    },

    'click #resize-button': function(e, t) {
      var containerEl = t.find(".queue-container");
      var width = t.selectedWidth.get();
      switch(width) {
        case '370px': t.selectedWidth.set('700px'); icon = 'fa-arrow-circle-o-right'; break;
        case '700px': t.selectedWidth.set('1200px'); icon = 'fa-arrow-circle-o-right'; break;
        case '1200px': t.selectedWidth.set('370px'); icon = 'fa-arrow-circle-o-left'; break;
      }
      $(containerEl).css('width', width);
      $(containerEl).find('#resize-button').attr('class', 'fa ' + icon);
    },

    'click #edit-button': function(e, t) {
      Ols.Router.showEditItemPage(t.selectedCardId.get());
    },

    'click #send-button': function(e, t) {
      item = Ols.Item.findOne(t.selectedCardId.get());
      if(item) {
        var assignee = item.assignee;
        assignee = prompt("Enter username of queue to assign to:", item.assignee);
        assignee = assignee.trim();
        if(assignee != null && assignee.length > 0) {
          Meteor.call('updateItemAssignee', item._id, assignee, function(err, result) {

            if(err) {
              Ols.Error.showError('Error assigning item: ', err);
            } else {
              t.selectedCardId.set(null);
              updateIndexes( '.sortable' );
            }
          });
        }
      }
    },

    'click #send-to-backlog-button': function(e, t) {
      Meteor.call('removeItemAssignee', t.selectedCardId.get(), function(err, result) {
        if(err) {
          Ols.Error.showError('Error un-assigning item: ', err);
        } else {
          t.selectedCardId.set(null);
          //updateIndexes( '.sortable' );
        }
      });
    },

    'click #done-button': function(e, t) {
      Meteor.call('toggleItemOpenStatus', t.selectedCardId.get(), function(err, result) {
        if(err) {
          Ols.Error.showError("Error toggling item status: ", err);
        } else {
          t.selectedCardId.set(null);
          //updateIndexes( '.sortable' );
        }
      });
    },

    'click #quick-add-card': function(e, t) {
      var item = {
        title: "New Card",
        description: "",
        type: Ols.Item.ITEM_TYPE_ISSUE,
        issueType: Ols.Item.ISSUE_TYPE_TASK,
        projectId: Session.get('currentProjectId'),
        boardId: Session.get('currentBoardId'),
        assignee: this.username
      };

      Meteor.call('insertItem', item, function(err, newItem) {
        if(err) {
          Ols.Error.showError("Error adding item",  err);
          Ols.Router.showBoardMessages();
        } else {
          Ols.Router.showItemMessages(newItem, {tabName: 'description'});
          //initSortable( '.sortable', t);
        }
      });
    },

    'click #back-button': function(e, t) {
      t.selectedCardId.set(null);
    }
  });

  Template.cardView.helpers({
    showAcceptRejectIfCurrentUser: function() {
        return this.assignee == Meteor.user().username?'':'hide';
    },

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

    isActive: function() {
      return this._id == Session.get('currentItemId')?'active':'';
    }
  });

  Template.cardView.events({
    'click #accept-link': function() {
      Meteor.call('acceptItem', this._id, function(err) {
        if(err) {
          alert("Error accepting card");
        }
      });
    },

    'click #reject-link': function() {
      Meteor.call('rejectItem', this._id, function(err) {
        if(err) {
          alert("Error rejecting card");
        }
      });
    },

    'click #top-content': function(e, t) {
      //this.selectedCardId.set(this.card._id);
      //UGH!  This depends on the specific structure of the workspace html
      //t.view.parentView.parentView.parentView.parentView.parentView.parentView.templateInstance().selectedCardId.set(this._id);
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

}
