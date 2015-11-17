if(Meteor.isClient) {
	BlazeLayout.setRoot('#app');

	noauthGroup = FlowRouter.group({});

	noauthGroup.route("/login", {
		name: "login",
		action: function() {
			BlazeLayout.render("app", {currentPage: "loginPage"});
		}
	});

	noauthGroup.route("/signup", {
		name: "signup",
		action: function() {
			BlazeLayout.render("app", {currentPage: "signupPage"});
		}
	});

	noauthGroup.route('/', {
		name: "welcome",
		action: function(params, queryParams) {
			Session.set('currentProjectId', null);
			Session.set('currentBoardId', null);
			Session.set('currentItemId', null);
			BlazeLayout.render("app", {currentPage: "welcomePage"});
		}
	});

	noauthGroup.route('/notAllowed', {
		name: "notAllowed",
		action: function(params, queryParams) {
			BlazeLayout.render("app", {currentPage: "notAllowed"});
		}
	});

	loggedInGroup = FlowRouter.group({
		triggersEnter: [ function() {
			if(Meteor.loggingIn() == false && !Meteor.userId()) {
				route = FlowRouter.current();
				if(route.route.name != 'login') {
					Session.set('redirectAfterLogin', route.path);
				}
				FlowRouter.go('login');
			}
		}]
	});

	adminGroup = loggedInGroup.group({
		triggersEnter: [ function() {
			var user = Meteor.user();
			if(user) {
				var email = user.emails[0].address;
				var teamMember = TeamMembers.findOne({email: email});
				if(teamMember.role != Ols.ROLE_ADMIN) {
					FlowRouter.go('notAllowed');
				}
			}
		}]
	});

	Accounts.onLogin(function() {
		var redirect = Session.get('redirectAfterLogin');
		if(redirect) {
			if(redirect != '/login') {
				FlowRouter.go(redirect);
			}
		} else if(Meteor.userId()){
			var route = FlowRouter.current();
			if(route.path == "/login") {
				FlowRouter.go("welcome");
			}
		}
	});

	loggedInGroup.route('/project/:projectId/board/:boardId', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', null);
			BlazeLayout.render("app", {currentPage: "feedPage"});
			Session.set('numIncomingMessages', 0);
			OpenLoops.removeSidebarNewMessages();
		}
	});

	loggedInGroup.route('/project/:projectId/board/:boardId/item/:itemId', {
		triggersEnter: [function(ctx, redirect) {
			/*
				The active tab uses persistent sessions so if it's persisted
				then use it, otherwise default to messages.
			*/
			var tabName = 'messages';
			var activeItemTab = Session.get('activeItemTab')
			if(activeItemTab) {
				tabName = activeItemTab;
			}
			var url = '/project/' + ctx.params.projectId + '/board/' + ctx.params.boardId + '/item/' + ctx.params.itemId + "/" + tabName;
    		redirect(url);
  		}],
	});

	loggedInGroup.route('/project/:projectId/board/:boardId/item/:itemId/:tabName', {
		action: function(params, queryParams) {
			console.log(">>>> ROUTE");
			var tabName = params.tabName;
			if(tabName == null || tabName.length == 0) {
				tabName = 'messages';
			}
			Session.setPersistent('activeItemTab', tabName);
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', params.itemId);
			BlazeLayout.render("app", {currentPage: "feedPage"});
			Session.set('numIncomingMessages', 0);
			Ols.HistoryManager.loadInitialMessages();
			OpenLoops.removeSidebarNewMessages(params.itemId);
		}
	});

	loggedInGroup.route('/project/:projectId/board/:boardId/create-item', {
		action: function(params, queryParams) {
			Session.set('createItemType', queryParams.type);
			Session.set('currentItemId', null);
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			BlazeLayout.render("app", {currentPage: "editItemPage"});
		}
	});

	loggedInGroup.route('/project/:projectId/board/:boardId/edit-item/:itemId', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', params.itemId);
			BlazeLayout.render("app", {currentPage: "editItemPage"});
		}
	});

	loggedInGroup.route('/projects', {
		action: function(params, queryParams) {
			BlazeLayout.render("app", {currentPage: "projectList"});
		}
	});

	adminGroup.route('/projects/create', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', null);
			BlazeLayout.render("app", {currentPage: "editProjectForm"});
		}
	});

	adminGroup.route('/project/:projectId/edit-project', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "editProjectForm"});
		}
	});

	adminGroup.route('/project/:projectId/delete-project', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "deleteProjectForm"});
		}
	});

	loggedInGroup.route('/project/:projectId/boards', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "boardList"});
		}
	});

	adminGroup.route('/project/:projectId/boards/create', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "createBoardForm"});
		}
	});

	adminGroup.route('/team-members', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "teamMembersList"});
		}
	});

	adminGroup.route('/team-members/create', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentTeamMemberId', null);
			BlazeLayout.render("app", {currentPage: "editTeamMemberForm"});
		}
	});

	adminGroup.route('/team-member/:teamMemberId/edit', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentTeamMemberId', params.teamMemberId);
			BlazeLayout.render("app", {currentPage: "editTeamMemberForm"});
		}
	});

	adminGroup.route('/project/:projectId/board/:boardId/create-label', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			BlazeLayout.render("app", {currentPage: "editLabelPage"});
		}
	});

	adminGroup.route('/project/:projectId/board/:boardId/label/:labelId/edit', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentLabelId', params.labelId);
			BlazeLayout.render("app", {currentPage: "editLabelPage"});
		}
	});

	adminGroup.route('/dev-admin', {
		action: function(params, queryParams) {
			BlazeLayout.render("app", {currentPage: "devAdminPage"});
		}
	});

	FlowRouter.notFound = {
		action: function() {
			BlazeLayout.render("app", {currentPage: "notFoundPage"});
		}
	}
}
