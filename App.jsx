
const { AppBar, IconButton, IconMenu, Paper, TextField} = mui;
const { MenuItem } = mui.Menus;
const { NavigationMoreVert } = mui.SvgIcons;
const Styles = mui.Styles;
const Colors = Styles.Colors;

App = React.createClass({
	mixins: [ReactMeteorData],

	childContextTypes : {
		muiTheme: React.PropTypes.object
	},

	getMeteorData() {
		var projectsHandle = Meteor.subscribe('projects');
		var boardsHandle = Meteor.subscribe("boards");

		return {
			isLoading: !projectsHandle.ready() || !boardsHandle.ready(),
		};
	},

	getChildContext() {
		return {
			muiTheme: Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme)
		};
	},

	getMenuItems() {
		return [
			{ route: "home", text: "Home" },
			{ route: "feature", text: "Feature" },
			{ route: "contact", text: "Contact" }
		];
	},

	render() {
		return (
			<div className="react-app" style={{height:'100%'}}>
				<AppBar
					title="OpenLoops"
					style={{backgroundColor: Colors.deepOrange300}}
					iconElementRight={
						<IconMenu
							iconButtonElement={
								<IconButton>
									<NavigationMoreVert />
								</IconButton>
							} >
							<MenuItem primaryText="Help" index={1} />
							<MenuItem primaryText="Sign out" index={2} />
						</IconMenu>
					} />
					<Paper
						className="leftSidebar"
						style={{top:'65px', width: '400px', position: 'fixed', overflow: 'auto', height: '100%'}}
						menuItems={this.getMenuItems()} >
						<ItemListView/>
					</Paper>
					<div style={{height:'100%', paddingLeft: '400px'}}>
						<main style={{height:'100%'}}>{this.props.content}</main>
						<footer>
							<MessageBoxView />
						</footer>
					</div>

				</div>

			);

		}
	});
