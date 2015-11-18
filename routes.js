if(Meteor.isClient) {
	BlazeLayout.setRoot('#app');

	FlowRouter.route("/login", {
		name: "login",
		action: function() {
			BlazeLayout.render("app", {currentPage: "loginPage"});
		}
	});

	FlowRouter.route("/signup", {
		name: "signup",
		action: function() {
			BlazeLayout.render("app", {currentPage: "signupPage"});
		}
	});

	FlowRouter.route('/', {
		name: "welcome",
		action: function(params, queryParams) {
			Session.set('currentProjectId', null);
			Session.set('currentBoardId', null);
			Session.set('currentItemId', null);
			BlazeLayout.render("app", {currentPage: "welcomePage"});
		}
	});

	FlowRouter.route('/notAllowed', {
		name: "notAllowed",
		action: function(params, queryParams) {
			BlazeLayout.render("app", {currentPage: "notAllowed"});
		}
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

	FlowRouter.route('/project/:projectId/board/:boardId', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', null);
			BlazeLayout.render("app", {currentPage: "feedPage"});
			Session.set('numIncomingMessages', 0);
			OpenLoops.removeSidebarNewMessages();
		}
	});

	FlowRouter.route('/project/:projectId/board/:boardId/item/:itemId', {
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

	FlowRouter.route('/project/:projectId/board/:boardId/item/:itemId/:tabName', {
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

	FlowRouter.route('/project/:projectId/board/:boardId/create-item', {
		action: function(params, queryParams) {
			Session.set('createItemType', queryParams.type);
			Session.set('currentItemId', null);
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			BlazeLayout.render("app", {currentPage: "editItemPage"});
		}
	});

	FlowRouter.route('/project/:projectId/board/:boardId/edit-item/:itemId', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', params.itemId);
			BlazeLayout.render("app", {currentPage: "editItemPage"});
		}
	});

	FlowRouter.route('/projects', {
		action: function(params, queryParams) {
			BlazeLayout.render("app", {currentPage: "projectList"});
		}
	});

	FlowRouter.route('/projects/create', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', null);
			BlazeLayout.render("app", {currentPage: "editProjectForm"});
		}
	});

	FlowRouter.route('/project/:projectId/edit-project', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "editProjectForm"});
		}
	});

	FlowRouter.route('/project/:projectId/delete-project', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "deleteProjectForm"});
		}
	});

	FlowRouter.route('/project/:projectId/boards', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "boardList"});
		}
	});

	FlowRouter.route('/project/:projectId/boards/create', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "createBoardForm"});
		}
	});

	FlowRouter.route('/team-members', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			BlazeLayout.render("app", {currentPage: "teamMembersList"});
		}
	});

	FlowRouter.route('/team-members/create', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentTeamMemberId', null);
			BlazeLayout.render("app", {currentPage: "editTeamMemberForm"});
		}
	});

	FlowRouter.route('/team-member/:teamMemberId/edit', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentTeamMemberId', params.teamMemberId);
			BlazeLayout.render("app", {currentPage: "editTeamMemberForm"});
		}
	});

	FlowRouter.route('/project/:projectId/board/:boardId/create-label', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			BlazeLayout.render("app", {currentPage: "editLabelPage"});
		}
	});

	FlowRouter.route('/project/:projectId/board/:boardId/label/:labelId/edit', {
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentLabelId', params.labelId);
			BlazeLayout.render("app", {currentPage: "editLabelPage"});
		}
	});

	FlowRouter.route('/dev-admin', {
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
