const { List, ListItem, ListDivider, FontIcon, Toolbar, ToolbarGroup, RaisedButton, TextField, ToolbarSeparator } = mui;

ItemListView = React.createClass({

	mixins: [ReactMeteorData],

	filterQuery: new ReactiveVar(),

	getMeteorData() {
		console.log("> getMeteorData");

		var filter = this.generateFilterOptions(this.filterQuery.get());
		filter.projectId =  Ols.Context.getProjectId();
		filter.boardId = Ols.Context.getBoardId()
		return {
			items: Items.find(filter, {sort: {updatedAt: -1}}).fetch()
		};
	},

	render() {
		return (
			<div className="itemListView" style={{height:'calc(100% - 65px)', overflow:'auto'}}>
				<List>
					<ListItem onClick={this.onFeedItemClicked} primaryText="Feed" leftIcon={<FontIcon className="material-icons">home</FontIcon>} />
				</List>
				<ListDivider />
				<TextField onChange={this.onFilterInputChanged} hintText="Type here to filter items" style={{paddingLeft:'10px', background: 'whitesmoke', width:'100%', borderBottom: '1px solid lightgray'}} underlineStyle={{borderColor:'whitesmoke'}}/>
				<List style={{clear:'both'}}>
					{this.renderItems()}
				</List>
			</div>
		);
	},

	onFeedItemClicked() {
		FlowRouter.go('boardMessages', {
			projectId: Ols.Context.getProjectId(),
			boardId: Ols.Context.getBoardId()
		});
	},

	onFilterInputChanged(e) {
		clearTimeout(this.keyTimer);
		this.keyTimer = setTimeout(() => {
			this.setFilterQuery(e.target.value);
		}, 500);
	},

	setFilterQuery(query) {
		if(query && query.trim().length > 0) {
			this.filterQuery.set(query);
		} else {
			this.filterQuery.set("");
		}
	},

	renderItems() {
		return this.data.items.map((item) => {
			return <ItemView key={item._id} item={item}/>;
		});
	},

	generateFilterOptions(filterString) {
		var filter = {};
		var remainingText = filterString;
		var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
		var match = re.exec(filterString);
		while (match != null) {
			var field = match[1].trim();
			var value = match[2].trim();
			remainingText = remainingText.replace(field, '');
			remainingText = remainingText.replace(value, '');
			remainingText = remainingText.replace(/:/g, '');
			if(field == 'type') {
				if(value == 'bug' || value == 'enhancement' || value == 'task') {
					field = 'issueType';
				}
			} else if(field == 'label') {
				field = 'labels';
			} else if(field == 'open') {
				field = "isOpen";
			} else if(field == 'closed') {
				field = "isOpen";
				value = (value=="true" ? "false" : "true");
			}

			if(value == "true") {
				value = true;
			} else if(value == "false") {
				value = false;
			}
			filter[field] = value;
			match = re.exec(filterString);
		}
		if(remainingText && remainingText.length > 0) {
			//console.log("REMAINING TEXT: " + remainingText);
			filter["$or"] = [{title: {$regex:remainingText}}];
		}
		console.log("Current filter is: " + JSON.stringify(filter));
		return filter;
	}
});
