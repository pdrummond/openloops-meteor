Meteor.methods({
  insertItem: function(newItem) {
    console.log("insertItem - boardId:" + newItem.boardId);
    var now = new Date().getTime();
    console.log("new item project id " + newItem.projectId);

    /*let itemCount = Items.find().count();
    let order     = itemCount + 1;*/
    let order = 99999;

    newItem = _.extend({
      pid: newItem.projectId?incrementCounter('counters', newItem.projectId):0,
      createdAt: now,
      createdBy: Meteor.user().username,
      updatedAt: now,
      isOpen: true,
      numMessages: 0,
      order: order,
      tabs: [
        {_id: "description", icon: 'fa-book', label: "Description", type: Ols.Item.Tab.TAB_TYPE_ITEM_DESCRIPTION},
        {_id: "messages", icon: 'fa-comments-o', label: "Messages", type: Ols.Item.Tab.TAB_TYPE_MESSAGE_HISTORY},
        {_id: "activity", icon: 'fa-exchange', label: "Activity", type: Ols.Item.Tab.TAB_TYPE_ACTIVITY_HISTORY},
        {_id: Random.id(), icon: 'fa-check', label: "Todo List", type: Ols.Item.Tab.TAB_TYPE_CHECKLIST},
        //{_id: Random.id(), icon: 'fa-check-circle-o', label: "Check List", type: Ols.Item.Tab.TAB_TYPE_CHECKLIST}
        {_id: Random.id(), icon: 'fa-book', label: "References", type: Ols.Item.Tab.TAB_TYPE_REFLIST}
      ],
      subItems: []
    }, newItem);

    var newItemId = Ols.Item.insert(newItem);
    //Meteor._sleepForMs(2000);
    var newItem = _.extend(newItem, {_id: newItemId});

    Ols.Activity.insertActivityMessage({
      activityType: Ols.ACTIVITY_TYPE_NEW_ITEM
    }, newItem);
    if(Ols.StringUtils.notEmpty(newItem.description)) {
      Ols.Activity.insertActivityMessage({
        activityType: Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED
      }, newItem);
    }

    return newItem;
  },

  updateItem: function(itemId, attrs) {
    console.log("> updateItem: " + JSON.stringify(attrs));
    var item = Ols.Item.findOne(itemId);
    Ols.Item.update(itemId, {$set: attrs});
    var newItem = Ols.Item.findOne(itemId);
    if(item.title != newItem.title) {
      Ols.Activity.insertActivityMessage({
        activityType: Ols.ACTIVITY_TYPE_ITEM_TITLE_CHANGED,
      }, newItem);
    }
    if(item.description != newItem.description) {
      Ols.Activity.insertActivityMessage({
        activityType: Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED
      }, newItem);
    }
    return newItem;
  },

  updateItemAssignee: function(itemId, newAssignee) {
    var item = Ols.Item.findOne(itemId);
    Ols.Item.update(itemId, {
      $set: {
        assignee: newAssignee,
        updatedAt: Date.now(),
        updatedBy: Meteor.userId(),
      }
    });
  },

  updateItemsOrder( items ) {
    check( items, [{
      _id: String,
      order: Number
    }]);

    for ( let item of items ) {
      Items.update( { _id: item._id }, { $set: { order: item.order } } );
    }
  },

  removeItemAssignee: function(itemId) {
    Items.update( {_id: itemId} , {$unset: { assignee : "" } } );
  },

  moveItem: function(itemId, toBoardId) {
    var item = Ols.Item.findOne(itemId);
    var fromBoardId = item.boardId;

    Ols.Item.update(itemId, {
      $set: {
        boardId: toBoardId,
        updatedAt: Date.now(),
        updatedBy: Meteor.userId(),
      }
    });

    Ols.Activity.insertActivityMessage({
      activityType: Ols.Activity.ACTIVITY_TYPE_ITEM_MOVED_TO_BOARD,
      item: item,
      boardId: fromBoardId, //The from board displays the "moved to board" activity item
      fromBoard: Boards.findOne(fromBoardId),
      toBoard: Boards.findOne(toBoardId)
    }, item);

    Ols.Activity.insertActivityMessage({
      activityType: Ols.Activity.ACTIVITY_TYPE_ITEM_MOVED_FROM_BOARD,
      item: item,
      boardId: toBoardId, //The to board displays the "moved from board" activity item
      fromBoard: Boards.findOne(fromBoardId),
      toBoard: Boards.findOne(toBoardId)
    }, item);

    var num = Ols.ServerMessage.update({itemId: itemId}, {$set: {boardId: toBoardId}}, {multi:true});
  },

  toggleItemOpenStatus: function(itemId) {
    check(itemId, String);

    var item = Ols.Item.findOne(itemId);

    var isOpen = !item.isOpen;

    Ols.Item.update(itemId, {
      $set: {isOpen: isOpen},
      $unset: { assignee : "" }
    });

    var item = Ols.Item.findOne(itemId);

    Ols.Activity.insertActivityMessage({
      activityType: isOpen?Ols.ACTIVITY_TYPE_ITEM_OPENED:Ols.ACTIVITY_TYPE_ITEM_CLOSED
    }, item);

    //update label counters
    _.each(item.labels, function(labelId) {
      if(item.isOpen) {
        Labels.update(labelId, {$inc: {numOpenMessages: 1, numClosedMessages: -1}});
      } else {
        Labels.update(labelId, {$inc: {numOpenMessages: -1, numClosedMessages: 1}});
      }
    });
  }
});

Meteor.publish("currentItem", function(itemId) {
  var items = Ols.Item.find({_id: itemId});
  return items;
});

Meteor.publish("items", function(opts) {
  console.log("publish items: " + JSON.stringify(opts));
  var filter = {};
  if(opts && opts.filter) {
    filter = _.extend(filter, opts.filter);
  }
  var projectIds = [];

  if(opts.username) {

    Projects.find({'members.username': opts.username}).forEach(function(project) {
      projectIds.push(project._id);
    });
    //User can see this card if they are a member or if they are the assignee or if they are the creator.
    filter['$or'] = [{projectId: {$in:projectIds}}, {assignee: opts.username}, {createdBy: opts.username}];
  } else {
    filter.projectId = {$in: projectIds};
  }

  console.log("ITEM filter: " + JSON.stringify(filter));
  return Ols.Item.find(filter, {sort: {order: 1}});
});

Meteor.publish("articles", function(opts) {
  var filter = {};
  if(opts && opts.filter) {
    filter = _.extend(filter, opts.filter);
  }
  filter.type = 'article';
  return Ols.Item.find(filter, {sort: {updatedAt: -1}});
});

Meteor.publish("issues", function(opts) {
  var filter = {};
  if(opts && opts.filter) {
    filter = _.extend(filter, opts.filter);
  }
  filter.type = 'issue';
  return Ols.Item.find(filter, {sort: {updatedAt: -1}});
});
