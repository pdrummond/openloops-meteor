if(Meteor.isClient) {

	Ols.FullScreenEditor.onBeforeClose(function() {
		$('#messageBox').val(Session.get('messageBox.content'));
	});

	Template.messageBox.events({
		'keypress #messageBox': function(e) {
			Streamy.broadcast('userTyping', { username: Meteor.user().username });

			var inputVal = $('#messageBox').val().trim();

			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			if(charCode == 13 && (inputVal == null || inputVal.length == 0)) {
				e.preventDefault();
				e.stopPropagation();
			} else {
				Session.set('messageBox.content', inputVal);
				if (charCode == 13 && e.shiftKey == false) {
					e.preventDefault();
					e.stopPropagation();
					if(inputVal.length > 0) {
						var newMessage = OpenLoops.insertClientMessage({
							text:inputVal,
							itemId: Session.get('currentItemId')
						});
						$("#messageBox").val('');
						Session.set('messageBox.content', "");
						Meteor.call('saveMessage', newMessage, function(err, result) {
							if(err) {
								Ols.Error.showError("Error sending message", err);
							} else {
								Ols.HistoryManager.scrollBottom();
								Streamy.broadcast('sendMessage', newMessage);
							}
						});
					}
				}
			}

		},

		'click #full-screen-link': function() {
			Ols.FullScreenEditor.open("Boom, boom");
		}
	});

}
