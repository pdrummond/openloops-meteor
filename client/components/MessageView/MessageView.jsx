MessageView = React.createClass({

	render() {
		return (
			<li className="chat message" data-id={this.props.message._id}>
				<span className="meta">
					<strong>{this.props.message.createdBy}</strong>
					<span className="created-at"> {Ols.DateFormat.timeAgo(this.props.message.createdAt)}</span>
				</span>
				<div className="text">
					{this.props.message.text}
				</div>
			</li>
		);
	}
});
