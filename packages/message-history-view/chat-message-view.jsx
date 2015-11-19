ChatMessageView = React.createClass({

	render() {
		console.log("ChatMessageView.render");
		return (
			<li className="chatMessageView" data-id={this.props.message._id}>
				<span className="meta">
					<strong>{this.props.message.createdBy}</strong>
					<span className="created-at"> {Ols.TimeUtils.timeAgo(this.props.message.createdAt)}</span>
				</span>
				<div className="text">
					{this.props.message.text}
				</div>
			</li>
		);
	}
});
