if(Meteor.isServer) {
	Meteor.startup(function() {
		//loadSampleData();
	});

	function loadSampleData() {
		console.log(">> LOADING SAMPLE DATA");
		Boards.remove({});
		Items.remove({});
		ServerMessages.remove({});

		var boardOneId = Boards.insert({
			numMessages: 0,
		});

		var itemOneId = Items.insert({
			title: 'Item One',
			description: 'Item one description',
			createdAt: new Date().getTime(),
			createdBy: 'loopy',
			numMessages: 0
		});

		var minutes = 1;
		for(var id=200; id>=1; id--) {
			ServerMessages.insert({
				text: 'Message ' + id,
				type: 'MSG_TYPE_CHAT',
				createdBy: 'loopy',
				createdAt: moment().subtract({minutes: minutes++}).toDate().getTime(),
				itemId: itemOneId
			});
			Items.update(itemOneId, {$inc: {numMessages: 1}});
			Boards.update(boardOneId, {$inc: {numMessages: 1}});
		}
		var itemTwoId = Items.insert({
			title: 'Item Two',
			description: 'Item two description',
			createdAt: new Date().getTime(),
			createdBy: 'loopy',
			numMessages: 0
		});
		minutes = 1;
		var hours = 0;
		for(var id=10; id>=1; id--) {
			if(id == 5) {
				hours += 5;
			}
			ServerMessages.insert({
				text: 'XXMessage ' + id,
				type: 'MSG_TYPE_CHAT',
				createdBy: 'loopy',
				createdAt: moment().subtract({hours: hours, minutes: minutes++}).toDate().getTime(),
				itemId: itemTwoId
			});
			Items.update(itemTwoId, {$inc: {numMessages: 1}});
			Boards.update(boardOneId, {$inc: {numMessages: 1}});
		}
		console.log("<< SAMPLE DATA DONE");
	}
}
