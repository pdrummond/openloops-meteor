if(Meteor.isClient) {

	Template.messageBox.events({
		'keypress #messageBox': function(e) {
			Streamy.broadcast('userTyping', { username: Meteor.user().username });
			var inputVal = $('#messageBox').val();
			var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
			if(charCode == 13 && (inputVal == null || inputVal.length == 0)) {
				e.preventDefault();
				e.stopPropagation();
			} else {
				if (charCode == 13 && e.shiftKey == false) {
					e.preventDefault();
					e.stopPropagation();
					if(inputVal.length > 0) {
						var newMessage = OpenLoops.insertClientMessage({text:inputVal});
						$("#messageBox").val('');
						Meteor.call('saveMessage', newMessage, function(err, result) {
							if(err) {
								alert("error sending message");
							} else {
								Ols.HistoryManager.scrollBottom();
								Streamy.broadcast('sendMessage', newMessage);
							}
						});
					}
				}
			}
		}
	});

}
