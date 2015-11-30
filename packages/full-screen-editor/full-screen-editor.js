Template.fullScreenEditor.helpers({

	editorOptions: function() {
		return {
			mode: "markdown",
			lineWrapping:true,
			placeholder: 'Type your message here'
		}
	},
});

Template.fullScreenEditor.events({
	'click #close-editor-button': function() {
		if(Ols.FullScreenEditor.onBeforeCloseCallback) {
			Ols.FullScreenEditor.onBeforeCloseCallback();
		}
		Ols.FullScreenEditor.close();
	},

	'click #create-message-button': function(e, t) {
		var inputVal = t.find("#full-screen-editor-textarea").value;
		var newMessage = OpenLoops.insertClientMessage({text:inputVal});
		$("#messageBox").val('');
		Session.set('messageBox.content', "");
		Ols.FullScreenEditor.close();
		Meteor.call('saveMessage', newMessage, function(err, result) {
			if(err) {
				alert("error sending message");
			} else {
				Ols.HistoryManager.scrollBottom();
				Streamy.broadcast('sendMessage', newMessage);
			}
		});
	}
});
