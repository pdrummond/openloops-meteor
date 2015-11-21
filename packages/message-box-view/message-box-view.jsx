
const { ListItem, Avatar} = mui;
const Styles = mui.Styles;
const Colors = Styles.Colors;

MessageBoxView = React.createClass({

	onKeyUp(e) {
		var inputVal = e.target.value;
		var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
		if(charCode == 13 && (inputVal == null || inputVal.length == 0)) {
			e.preventDefault();
			e.stopPropagation();
		} else {
			if (charCode == 13 && e.shiftKey == false) {
				e.preventDefault();
				e.stopPropagation();
				if(inputVal.length > 0) {
					this.clearMessageBox();
					Ols.Message.createMessage({text:inputVal}, function() {
						//Ols.HistoryManager.scrollBottom();
						//FIXME: When a new message is added, it's the
						//message-history-view that needs to scroll bottom.  Think
						//about where the logic should be and how it should work.

					});
				}
			}
		}
	},

	render() {
		return (
			<textarea id="messageBox" onKeyUp={this.onKeyUp} placeholder="Type here to add a message">
			</textarea>
		);
	},

	clearMessageBox() {
		var node = ReactDOM.findDOMNode(this);
		node.value = '';
	}
});
