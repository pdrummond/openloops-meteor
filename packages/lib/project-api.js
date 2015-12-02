Ols.Project = {
	/**
		Returns the project for the current session
	*/
	getCurrent: function() {
		return Projects.findOne(Session.get('currentProjectId'));
	},

	getProject: function(projectId) {
		return Projects.findOne(projectId);
	},

	isUserProjectMember: function(projectId, username) {
		var project = this.getProject(projectId);
		var result = _.findWhere(project.members, {username: username}) != null;
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
