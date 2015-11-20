const { Paper } = mui;

ItemListView = React.createClass({

	mixins: [ReactMeteorData],

	getMeteorData() {
		console.log("> getMeteorData");

		var filter = OpenLoops.getFilterQuery(Session.get('filterQuery'));
		filter.projectId =  Ols.Context.getProjectId();
		filter.boardId = Ols.Context.getBoardId()
		return {
			items: Items.find(filter, {sort: {updatedAt: -1}}).fetch()
		};
	},

	render() {
		return (
			<div className="itemListView" style={{height:'calc(100% - 65px)', overflow:'auto'}}>
				{this.renderItems()}
			</div>
		);
	},

	renderItems() {
		return this.data.items.map((item) => {
			return <ItemView key={item._id} item={item}/>;
		});
	}
});
