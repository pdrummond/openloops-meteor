
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
	Sortable.collections = ['cards'];

	Cards.remove({});

	if(Cards.find().count() == 0) {
		console.log("Inserting cards");
		Cards.insert({
			title: 'Q1 Card One',
			queue: 1,
			order: 1,
		});
		Cards.insert({
			title: 'Q1 Card Two',
			queue: 1,
			order: 2,
		});
		Cards.insert({
			title: 'Q1 Card Three',
			queue: 1,
			order: 3
		});

		Cards.insert({
			title: 'Q2 Card One',
			queue: 2,
			order: 1,
		});
		Cards.insert({
			title: 'Q2 Card Two',
			queue: 2,
			order: 2,
		});

		Cards.insert({
			title: 'Q3 Card One',
			queue: 3,
			order: 1,
		});

	}

	Meteor.publish("cards", function() {
		return Cards.find({}, {sort: {order: 1}});
	});
}

if(Meteor.isClient) {

	Template.cardList.helpers({
		cards: function () {
			return Cards.find({queue: this.queue}, { sort: { order: 1 } });
		},

		cardsOptions: {
			sortField: 'order',  // defaults to 'order' anyway
			group: {
				name: 'queue',
				pull: true,
				put: true
			}
		},

	});

	Template.cardList.events({
		'click #resize-button': function(e, t) {
			var containerEl = t.find(".card-list-container");
			var width = $(containerEl).css('width');
			switch(width) {
				case '350px': width = '700px'; icon = 'fa-arrow-circle-o-left'; break;
				case '700px': width = '350px'; icon = 'fa-arrow-circle-o-right'; break;
			}
			$(containerEl).css('width', width);
			$(containerEl).find('#resize-button').attr('class', 'fa ' + icon);
		}
	});

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

}
