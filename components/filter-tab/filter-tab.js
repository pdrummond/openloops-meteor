if(Meteor.isClient) {
  Template.filterTab.helpers({
    projects: function() {
      return Ols.Project.find({'members.username': Meteor.user().username});
    }
  });

  Template.filterTab.events({
    'change #project-chooser': function() {
      var selectedValues = [];
      $("#project-chooser :selected").each(function(){
        selectedValues.push($(this).val());
      });
      if(selectedValues.length > 0) {
        var query = 'projectId: ' + selectedValues.join('-');
        Session.set('filterQuery', query);
        console.log("FILTER TAB QUERY> >>>>> > :" + query);
      }
      return false;
    }
  });
}
