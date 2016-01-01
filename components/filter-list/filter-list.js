if(Meteor.isClient) {

	Template.filterList.events({
		'click #issues-link': function() {
			Session.set('filterQuery', 'type:issue open:true');
			Session.set('leftSidebarActiveTab', 'items-tab');
			Session.set('filterSentence', Ols.Filter.generateFilterSentenceFromFilter({title:'Open Issues'}));
		},

		'click #bugs-link': function() {
			Session.set('filterQuery', 'type:bug');
			Session.set('leftSidebarActiveTab', 'items-tab');
			Session.set('filterSentence', Ols.Filter.generateFilterSentenceFromFilter({title:'All Bugs'}));
		},

		'click #discussions-link': function() {
			Session.set('filterQuery', 'type:discussion');
			Session.set('leftSidebarActiveTab', 'items-tab');
			Session.set('filterSentence', Ols.Filter.generateFilterSentenceFromFilter({title:'All Discussions'}));
		},

		'click #now-issues-link': function() {
			Session.set('filterQuery', 'label:now type:issue');
			Session.set('leftSidebarActiveTab', 'items-tab');
			Session.set('filterSentence', Ols.Filter.generateFilterSentenceFromFilter({title:'Now Issues'}));
		},

		'click #assigned-to-me-link': function() {
			Session.set('filterQuery', 'assignee:' + Meteor.user().username + " open:true");
			Session.set('leftSidebarActiveTab', 'items-tab');
			Session.set('filterSentence', Ols.Filter.generateFilterSentenceFromFilter({title:'Assigned to me'}));
		},

		'click #closed-link': function() {
			Session.set('filterQuery', 'closed:true');
			Session.set('leftSidebarActiveTab', 'items-tab');
			Session.set('filterSentence', Ols.Filter.generateFilterSentenceFromFilter({title:'Closed Items'}));
		}
	});
}
