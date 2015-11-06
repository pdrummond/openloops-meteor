if(Meteor.isClient) {

	noauthGroup = FlowRouter.group({});

	noauthGroup.route("/login", {
		name: "login",
		action: function() {
			Session.set('currentPage', 'loginPage');
		}
	});

	noauthGroup.route("/signup", {
		name: "signup",
		action: function() {
			Session.set('currentPage', 'signupPage');
		}
	});

	noauthGroup.route('/', {
		name: "welcome",
		action: function(params, queryParams) {
			Session.set('currentBoardId', null);
			Session.set('currentItemId', null);
			Session.set('currentPage', 'welcomePage');
		}
	});

	noauthGroup.route('/notAllowed', {
		name: "notAllowed",
		action: function(params, queryParams) {
			Session.set('currentPage', 'notAllowed');
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

	loggedInGroup.route('/board/:boardId', {
		action: function(params, queryParams) {
			Session.set('currentPage', 'feedPage');
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', null);
			Session.set('numIncomingMessages', 0);

			Ols.HistoryManager.loadInitialMessages();
		}
	});

	loggedInGroup.route('/board/:boardId/item/:itemId', {
		triggersEnter: [function(ctx, redirect) {
			var url = '/board/' + ctx.params.boardId + '/item/' + ctx.params.itemId + '/messages';
    		redirect(url);
  		}],
	});

	loggedInGroup.route('/board/:boardId/item/:itemId/:tabName', {
		action: function(params, queryParams) {
			console.log(">>>> ROUTE");
			var tabName = params.tabName;
			if(tabName == null || tabName.length == 0) {
				tabName = 'messages';
			}
			Session.set('activeItemTab', tabName);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', params.itemId);
			Session.set('currentPage', 'feedPage');
			Session.set('numIncomingMessages', 0);
			OpenLoops.removeSidebarNewMessages(params.itemId);
			Ols.HistoryManager.loadInitialMessages();			
		}
	});

	loggedInGroup.route('/board/:boardId/create-item', {
		action: function(params, queryParams) {
			Session.set('currentItemId', null);
			Session.set('currentBoardId', params.boardId);
			Session.set('currentPage', 'editItemPage');
		}
	});

	loggedInGroup.route('/board/:boardId/edit-item/:itemId', {
		action: function(params, queryParams) {
			Session.set('currentBoardId', params.boardId);
			Session.set('currentItemId', params.itemId);
			Session.set('currentPage', 'editItemPage');
		}
	});

	loggedInGroup.route('/board/:boardId/create-filter', {
		action: function(params, queryParams) {
			Session.set('currentBoardId', params.boardId);
			Session.set('currentPage', 'createFilterPage');
		}
	});

	loggedInGroup.route('/boards', {
		action: function(params, queryParams) {
			Session.set('currentPage', 'boardList');
		}
	});

	adminGroup.route('/boards/create', {
		action: function(params, queryParams) {
			Session.set('currentPage', 'createBoardForm');
		}
	});

	adminGroup.route('/team-members', {
		action: function(params, queryParams) {
			Session.set('currentPage', 'teamMembersList');
		}
	});

	adminGroup.route('/team-members/create', {
		action: function(params, queryParams) {
			Session.set('currentTeamMemberId', null);
			Session.set('currentPage', 'editTeamMemberForm');
		}
	});

	adminGroup.route('/team-member/:teamMemberId/edit', {
		action: function(params, queryParams) {
			Session.set('currentTeamMemberId', params.teamMemberId);
			Session.set('currentPage', 'editTeamMemberForm');
		}
	});

	adminGroup.route('/board/:boardId/create-label', {
		action: function(params, queryParams) {
			Session.set('currentBoardId', params.boardId);
			Session.set('currentPage', 'editLabelPage');
		}
	});

	adminGroup.route('/board/:boardId/label/:labelId/edit', {
		action: function(params, queryParams) {
			Session.set('currentBoardId', params.boardId);
			Session.set('currentLabelId', params.labelId);
			Session.set('currentPage', 'editLabelPage');
		}
	});

	FlowRouter.notFound = {
		action: function() {
			Session.set('currentPage', 'notFoundPage');
		}
	}
}
