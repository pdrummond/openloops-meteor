if(Meteor.isClient) {
  Template.filterTab.helpers({
    projects: function() {
      return Projects.find();
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
