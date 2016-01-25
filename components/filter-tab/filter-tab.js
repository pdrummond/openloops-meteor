if(Meteor.isClient) {
  Template.filterTab.helpers({
    projects: function() {
//      return Ols.Project.find({'members.username': Meteor.user().username});
      return Ols.Project.find();
    },

    currentProjectTitle: function() {
      var project = Ols.Project.getCurrent(Session.get('currentProjectId'));
      return project && project.title?project.title:'';
    }
  });

  Template.filterTab.events({
    'keyup .milestone-tag-filter': function(e, t) {
      var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
      var inputVal = $(t.find('.milestone-tag-filter')).val().trim();
      if(charCode == 27) {
        Session.set('currentMilestoneTag', null);
        $('.milestone-tag-filter').val('');
      } else if(charCode == 13 && (inputVal == null || inputVal.length == 0)) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        if (charCode == 13) {
          e.preventDefault();
          e.stopPropagation();
          if(inputVal.length > 0) {
            Session.set('currentMilestoneTag', inputVal);
          }
        }
      }
    },
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
