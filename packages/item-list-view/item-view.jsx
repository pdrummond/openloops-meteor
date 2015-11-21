
const { ListItem, Avatar} = mui;
const Styles = mui.Styles;
const Colors = Styles.Colors;

ItemView = React.createClass({

	getTypeIconClassName() {
		return "fa " + Ols.Item.getTypeIconClass(this.props.item);
	},

	getTypeIconColor() {
		return Ols.Item.getTypeIconColor(this.props.item);
	},

	getItemKey() {
		return "#OLS-42";// + {{projectKey this}}-{{pid}}
	},

	onClick() {
		FlowRouter.go('itemMessages', {
			projectId: this.props.item.projectId,
			boardId: this.props.item.boardId,
			itemId: this.props.item._id
		});
	},

	render() {
		return (
			<ListItem
				onClick={this.onClick}
				leftAvatar={<i className={this.getTypeIconClassName()} style={{color: this.getTypeIconColor(), fontSize: '2.5rem'}}></i>}
				primaryText={
					<span style={{fontSize:'16px', fontWeight: 'bold'}}>
						{this.props.item.title}
					</span>
				}
				secondaryText={
					<div style={{margin:'0', marginTop:'0'}}>
					<p style={{margin:'0'}}>{this.props.item.description ? this.props.item.description : <i>No Description</i>}</p>
					<span style={{color: Colors.grey400}}>
						{this.getItemKey()} ● {this.props.item.createdBy} ● {Ols.TimeUtils.timeAgo(this.props.item.createdAt)}
					</span>
					</div>
				}
				secondaryTextLines={2} />
		);
	}
});
