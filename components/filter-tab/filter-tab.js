if(Meteor.isClient) {
  Template.filterTab.helpers({
    projects: function() {
      return Ols.Project.find({'members.username': Meteor.user().username});
    },

    currentProjectTitle: function() {
      var project = Ols.Project.getCurrent(Session.get('currentProjectId'));
      return project && project.title?project.title:'';
    }
  });

  Template.projectMenuItem.events({

    'click': function() {
      Ols.Router.showWorkspacePage(this._id);
    }

    // 'change #project-chooser': function() {
    //   var selectedValues = [];
    //   $("#project-chooser :selected").each(function(){
    //     selectedValues.push($(this).val());
    //   });
    //   if(selectedValues.length > 0) {
    //     var query = 'projectId: ' + selectedValues.join('-');
    //     Session.set('filterQuery', query);
    //     console.log("FILTER TAB QUERY> >>>>> > :" + query);
    //   }
    //   return false;
    // }
  });
}
