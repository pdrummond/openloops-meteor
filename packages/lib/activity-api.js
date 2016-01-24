Ols.Activity = {
  insertWebHookActivityMessage: function(activityMessage) {
    console.log("Ols.Activity.insertWebHookActivityMessage");
    /*
    WebHooks trigger directly in the server-side, so we
    insert the message directly on the server, then broadcast a
    message to the clients to insert the message client-side only.
    */
    Meteor.call('saveMessage', activityMessage);
    Streamy.broadcast('sendMessage', activityMessage);
  },

  insertActivityMessage: function(activityMessage, item) {
    check(activityMessage, {
      activityType: String,
      createdBy: Match.Optional(String),
      createdAt: Match.Optional(Date),
      projectId: Match.Optional(String),
      boardId: Match.Optional(String),
      toBoard: Match.Optional(Match.Any),
      fromBoard: Match.Optional(Match.Any),
      item: Match.Optional(Match.Any),
    });
    if(!Meteor.isServer) {
      throw new Meteor.Error("insert-activity-message-001", "Activity items cannot be inserted client-side");
    }
    activityMessage.type =  Ols.MSG_TYPE_ACTIVITY;
    if(item) {
      activityMessage = _.extend({
        createdBy: Meteor.user().username,
        createdAt: new Date().getTime(),
        itemType: item.type,
        projectId: item.projectId,
        boardId: item.boardId,
        itemId: item._id,
        item: item
      }, activityMessage);
    }
    Meteor.call('saveMessage', activityMessage);
    Streamy.broadcast('sendMessage', activityMessage);
  },

  getActivityMessage: function(activityMsg) {
    if(activityMsg.item) {
      var currentBoardId = Session.get('currentBoardId');
      var currentItemId = Session.get('currentItemId');
      var itemTitleLink = "";
      if(activityMsg.item != null) {
        itemTitleLink = '<a href="" class="card-key" style="color:#337ab7">' + Ols.Item.getItemKey({item: activityMsg.item}) + ': ' + activityMsg.item.title + '</a>';
      } else {
        itemTitleLink = "ERR: Cannot find item";
      }

      var ctx = itemTitleLink;
      var msg = '';
      switch(activityMsg.activityType) {
        case Ols.Activity.ACTIVITY_TYPE_NEW_ITEM:
        msg = '<b>created</b> ' + ctx;
        break;
        case Ols.Activity.ACTIVITY_TYPE_ITEM_TYPE_CHANGE:
        msg = ('<b>changed</b> ' + ctx + ' to ' + OpenLoops.getItemTypePhrase(activityMsg.itemType, activityMsg.issueType));
        break;
        case Ols.Activity.ACTIVITY_TYPE_ITEM_OPENED:
        msg = "<b>re-opened</b> " + ctx;
        break;
        case Ols.Activity.ACTIVITY_TYPE_ITEM_CLOSED:
        msg = "<b>closed</b> " + ctx;
        break;
        case Ols.Activity.ACTIVITY_TYPE_ITEM_TITLE_CHANGED:
        msg = "<b>changed</b> title of item to " + itemTitleLink;
        break;
        case Ols.Activity.ACTIVITY_TYPE_ITEM_DESC_CHANGED:
        var itemCtx = currentItemId?"of this item to:":"of " + ctx + " to:";
        msg = "Set the description " + itemCtx;
        break;
        case Ols.Activity.ACTIVITY_TYPE_ITEM_MOVED_TO_BOARD:
        msg = "<b>moved</b> " + ctx + " to board " + "<a href='/project/" + activityMsg.toBoard.projectId + "/board/" + activityMsg.toBoard.boardId + "'>" + activityMsg.toBoard.title + "</a>";
        break;
        case Ols.Activity.ACTIVITY_TYPE_ITEM_MOVED_FROM_BOARD:
        msg = "<b>moved</b> " + ctx + " here from board " + "<a href='/project/" + activityMsg.fromBoard.projectId + "/board/" + activityMsg.fromBoard.boardId + "'>" + activityMsg.fromBoard.title + "</a>";
        break;
        default:
        msg =  "ERR: activity item " + activityMsg.activityType + " not found";
        break;
      }
    } else {
      switch(activityMsg.activityType) {
        case Ols.ACTIVITY_TYPE_NEW_BOARD:
        var board = Boards.findOne(activityMsg.boardId);
        if(board != null) {
          msg = 'created <span class="board-link">' + board.title + '</span>';
        } else {
          msg = 'ERR: board is null';
        }
        break;
        //FIXME: Need to find someway to defer to the plugin for activityMsg.
        case Ols.ACTIVITY_TYPE_WEBHOOK_EVENT:
        switch(activityMsg.webHookType) {
          case "GITHUB_WEBHOOK_EVENT":
          msg = Ols.GitHub.generateActivityMessage(this);
          break;
        }
        break;
        default:
        msg =  ">> activity item " + activityMsg.activityType + " not found";
        break;
      }
    }
    return msg;
  },

  getActivityContent: function(activityMsg) {
    var activityContent = "";
    if(activityMsg.itemId) {
      var item = Ols.Item.findOne(activityMsg.itemId);

      switch(activityMsg.activityType) {
        case Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED:
        activityContent = activityMsg.item?activityMsg.item.description:'ERR: Something went wrong. Cannot find item description';
        break;

      }
    } else {
      switch(activityMsg.activityType) {
        case Ols.ACTIVITY_TYPE_WEBHOOK_EVENT:
        switch(activityMsg.webHookType) {
          case "GITHUB_WEBHOOK_EVENT":
          activityContent = Ols.GitHub.generateActivityContent(this);
          break;
        }
        break;
      }
    }
    return activityContent;
  },

  showActivityContentClass: function(activityMsg) {
    var show = false;
    var item = Ols.Item.findOne(activityMsg.itemId);
    switch(activityMsg.activityType) {
      case Ols.ACTIVITY_TYPE_ITEM_DESC_CHANGED:
      show = true;
      break;
      case Ols.ACTIVITY_TYPE_WEBHOOK_EVENT:
      switch(activityMsg.webHookType) {
        case "GITHUB_WEBHOOK_EVENT":
        show = Ols.GitHub.showActivityContent(this);
        break;
      }
      break;
    }
    return show?"":"hide";
  },

  ACTIVITY_TYPE_NEW_BOARD: 'ACTIVITY_TYPE_NEW_BOARD',
  ACTIVITY_TYPE_NEW_ITEM: 'ACTIVITY_TYPE_NEW_ITEM',
  ACTIVITY_TYPE_ITEM_TYPE_CHANGE: 'ACTIVITY_TYPE_ITEM_TYPE_CHANGE',
  ACTIVITY_TYPE_ITEM_OPENED: 'ACTIVITY_TYPE_ITEM_OPENED',
  ACTIVITY_TYPE_ITEM_CLOSED: 'ACTIVITY_TYPE_ITEM_CLOSED',
  ACTIVITY_TYPE_ITEM_MOVED_TO_BOARD: 'ACTIVITY_TYPE_ITEM_MOVED_TO_BOARD',
  ACTIVITY_TYPE_ITEM_MOVED_FROM_BOARD: 'ACTIVITY_TYPE_ITEM_MOVED_FROM_BOARD',
  ACTIVITY_TYPE_ITEM_TITLE_CHANGED: 'ACTIVITY_TYPE_ITEM_TITLE_CHANGED',
  ACTIVITY_TYPE_ITEM_DESC_CHANGED: 'ACTIVITY_TYPE_ITEM_DESC_CHANGED',
  ACTIVITY_TYPE_WEBHOOK_EVENT: 'ACTIVITY_TYPE_WEBHOOK_EVENT',
}
