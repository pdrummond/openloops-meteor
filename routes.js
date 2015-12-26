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
		name: 'boardMessages',
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', null);
			BlazeLayout.render("app", {currentPage: "feedPage"});
			Session.set('numIncomingMessages', 0);
			OpenLoops.removeSidebarNewMessages();

			/*Meteor.call('_getOldestBoardMessage', params.projectId, params.boardId, function(err, result) {
				console.log(">> _getOldestBoardMessage");
				console.log("msg: " + JSON.stringify(result, null, 4));
				console.log("msg date: " + Ols.TimeUtils.formatTime(result.createdAt));
				console.log("<< _getOldestBoardMessage");
			});*/
		}
	});



	FlowRouter.route('/project/:projectId/item/:itemId/:tabName', {
		name:'projectItemMessages',
		action: function(params, queryParams) {
			var tabName = params.tabName;
			if(tabName == null || tabName.length == 0) {
				tabName = 'messages';
			}
			Session.setPersistent('activeItemTab', tabName);
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', null);
			Session.set('currentItemId', params.itemId);
			BlazeLayout.render("app", {currentPage: "feedPage"});
			Session.set('numIncomingMessages', 0);
			OpenLoops.removeSidebarNewMessages(params.itemId);
		}
	});

	FlowRouter.route('/project/:projectId/board/:boardId/item/:itemId/:tabName', {
		name:'boardItemMessages',
		action: function(params, queryParams) {
			var tabName = params.tabName;
			if(tabName == null || tabName.length == 0) {
				tabName = 'messages';
			}
			Session.setPersistent('activeItemTab', tabName);
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', params.itemId);
			Session.set('activeItemTab', tabName);
			BlazeLayout.render("app", {currentPage: "feedPage"});
			Session.set('numIncomingMessages', 0);
			OpenLoops.removeSidebarNewMessages(params.itemId);
		}
	});

	FlowRouter.route('/project/:projectId/create-item', {
		name:'createProjectItem',
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', null);
			Session.set('currentItemId', null);
			Session.set('createItemType', queryParams.type);
			BlazeLayout.render("app", {currentPage: "editItemPage"});
		}
	});

	FlowRouter.route('/project/:projectId/board/:boardId/create-item', {
		name:'createBoardItem',
		action: function(params, queryParams) {
			Session.set('createItemType', queryParams.type);
			Session.set('currentItemId', null);
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', params.boardId);
			//BlazeLayout.render("app", {currentPage: "editItemPage"});
			BlazeLayout.render("app", {currentPage: "newItemPage"});
		}
	});

	FlowRouter.route('/project/:projectId/edit-item/:itemId', {
		name:'editProjectItem',
		action: function(params, queryParams) {
			Session.set('currentProjectId', params.projectId);
			Session.set('currentBoardId', null);
			Session.set('currentItemId', params.itemId);
			BlazeLayout.render("app", {currentPage: "editItemPage"});
		}
	});

	FlowRouter.route('/project/:projectId/board/:boardId/edit-item/:itemId', {
		name:'editBoardItem',
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

	FlowRouter.route('/project/:projectId/manage-boards', {
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
