Ols.Project = {

	find: function(selector, options) {
	return Projects.find(selector, options);
	},

	findOne: function(selector, options) {
		return Projects.findOne(selector, options);
	},

	insert: function(item, callback) {
		return Projects.insert(item, callback);
	},

	update: function(selector, modifier, options, callback) {
		return Projects.update(selector, modifier, options, callback);
	},

	remove: function(selector, callback) {
		return Projects.remove(selector, callback);
	},

	/**
		Returns the project for the current session
	*/
	getCurrent: function() {
		return Projects.findOne(Session.get('currentProjectId'));
	},

	get: function(projectId) {
		return Projects.findOne(projectId);
	},

	//FIXME: Remove this version - use get()
	getProject: function(projectId) {
		return Projects.findOne(projectId);
	},

	isUserProjectMember: function(projectId, username) {
		var project = this.getProject(projectId);
		var result = _.findWhere(project.members, {username: username}) != null;
		return result;
	},

	isUserProjectAdmin: function(projectId, username) {
		var project = this.getProject(projectId);
		var result = _.findWhere(project.members, {username: username, role: Ols.ROLE_ADMIN}) != null;
		return result;
	},

	/**
		Takes either a project or a projectId and returns its key or '??' if no
		project can be found.  If project doesn't have a key then the first 3
		letters of the project title are used instead.

		Example: Ols.Project.getProjectKey({projectId: '123'});
	*/
	getProjectKey: function(args) {
		var projectKey = '??';
		var project = args.project?args.project:Projects.findOne(args.projectId);
		if(project != null) {
			projectKey = project.key?project.key:project.title.substring(0, 3);
		}
		return projectKey;
	}
}
