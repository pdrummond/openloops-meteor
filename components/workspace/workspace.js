
Queues = new Meteor.Collection('queues');
Cards = new Meteor.Collection('cards');

Cards.allow({
  insert: function (userId, card) {
    return true;
  },
  update: function (userId, card) {
    return true;
  },
  remove: function (userId, card) {
    return true;
  },
});

if(Meteor.isServer) {
}

if(Meteor.isClient) {

  Template.workspace.helpers({

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

  Template.workspace.events({
    'click #header-new-messages-toast': function() {
      Session.set("numIncomingMessages", 0);
      Ols.HistoryManager.scrollBottom();
    }
  });

  let initSortable = ( sortableClass, template ) => {
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
};

  Template.queue.onCreated(function() {
    var self = this;
    this.selectedCardId = new ReactiveVar();
    Meteor.setTimeout(function() {
      console.log("ENABLING SORTABLE");
      initSortable( '.sortable', self);
    }, 1000);
  });

  Template.queue.helpers({
    items: function () {
      return Items.find({assignee:this.username}, {sort: {order: 1}});
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
      sortField: 'order',  // defaults to 'order' anyway
      group: {
        name: 'queue',
        pull: true,
        put: true
      }
    },

    queueTitle: function() {
      inInbox = false;
      var item = Ols.Item.findOne(Template.instance().selectedCardId.get());
      if(item) {
        inInbox = item.inInbox;
      }
      return inInbox?"INBOX":"QUEUE";
    }

  });

  Template.queue.events({
    'click #resize-button': function(e, t) {
      var containerEl = t.find(".queue-container");
      var width = $(containerEl).css('width');
      switch(width) {
        case '350px': width = '700px'; icon = 'fa-arrow-circle-o-right'; break;
        case '700px': width = '1200px'; icon = 'fa-arrow-circle-o-left'; break;
        case '1200px': width = '350px'; icon = 'fa-arrow-circle-o-right'; break;
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
        assignee = prompt("Enter username of member to assign to:", item.assignee);
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
           updateIndexes( '.sortable' );
        }
      });
    },

    'click #done-button': function(e, t) {
      Meteor.call('toggleItemOpenStatus', t.selectedCardId.get(), function(err, result) {
        if(err) {
          Ols.Error.showError("Error toggling item status: ", err);
        } else {
          t.selectedCardId.set(null);
          updateIndexes( '.sortable' );
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
          initSortable( '.sortable', t);
        }
      });
    },

    'click #item-detail-back-button': function(e, t) {
      t.selectedCardId.set(null);
    }
  });

  Template.cardView.helpers({
    isClosedClass: function() {
      return this.card.isOpen?'':'closed';
    },

    numMessages: function() {
      return this.card.numMessages - 1; //to remove the description
    },

    typeIcon: function() {
      return OpenLoops.getItemTypeIcon(this.card);
    },

    typeIconColor: function() {
      return OpenLoops.getItemTypeIconColor(this.card);
    },

    isActive: function() {
      return this.card._id == Session.get('currentItemId')?'active':'';
    }
  });

  Template.cardView.events({
    'click #top-content': function(e, t) {
      this.selectedCardId.set(this.card._id);
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
