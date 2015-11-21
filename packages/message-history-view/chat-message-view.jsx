
const { Card, CardHeader, CardText, CardActions, FlatButton, Avatar} = mui;

ChatMessageView = React.createClass({

	render() {
		console.log("ChatMessageView.render");
		return (
			<Card className="chatMessageView" data-id={this.props.message._id} initiallyExpanded={false}
				style={{boxShadow:'none'}}>
				<CardHeader
					title={
						<span>
							<span>
								{this.props.message.createdBy}
							</span>
							<span style={{marginLeft:'10px', fontSize: '12px', 'color': 'lightgray'}}>
								{Ols.TimeUtils.timeAgo(this.props.message.createdAt)}
							</span>
						</span>
					}
					avatar={<Avatar>A</Avatar>}
					actAsExpander={true}
					showExpandableButton={true}>
				</CardHeader>
				<CardText style={{display:'inline-block', position:'relative', padding: '0px', top: '-35px', left: '70px'}}>
					{this.props.message.text}
				</CardText>
				<CardActions style={{backgroundColor: 'whitesmoke'}} expandable={true}>
					<FlatButton label="Edit"/>
					<FlatButton label="Delete"/>
				</CardActions>

			</Card>

		);
	}
});
