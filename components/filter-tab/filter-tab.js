if(Meteor.isClient) {

  Template.filterTab.onCreated(function() {
    this.statusFilter = new ReactiveVar("all");
  });

  Template.filterTab.helpers({

    milestoneTagLabel: function() {
      return Session.get('filterTabCurrentMilestone') || 'All';
    },

    milestones: function() {
      return Milestones.find({projectId: Session.get('currentProjectId')});
    },

    currentStatusFilter: function() {
      var t = Template.instance();
      var label = '';
      switch(t.statusFilter.get()) {
        case 'new': label = 'New'; break;
        case 'in-progress': label = 'In Progress'; break;
        case 'in-test': label = 'In Test'; break;
        case 'blocked': label = 'Blocked'; break;
        case 'completed': label = 'Completed'; break;
        case 'rejected': label = 'Rejected'; break;
        case 'duplicate': label = 'Duplicate'; break;
        case 'out-of-scope': label = 'Out of Scope'; break;
        default: label = 'All'; break;
      }
      return label;
    }
  });

  Template.filterTab.events({

    'click #set-all-milestones': function() {
      Session.set('filterTabCurrentMilestone', null);
      Session.set('filterQuery', null);
    },

    'click #set-all-statuses': function() {
      t.statusFilter.set('all');
      Session.set('filterQuery', null);
    },

    'click #set-status-new': function(e, t) {
      t.statusFilter.set('new');
      Session.set('filterQuery', 'status:new');
    },

    'click #set-status-in-progress': function(e, t) {
      t.statusFilter.set('in-progress');
      Session.set('filterQuery', 'status:in-progress');
    },

    'click #set-status-in-test': function(e, t) {
      t.statusFilter.set('in-test');
      Session.set('filterQuery', 'status:in-test');
    },

    'click #set-status-blocked': function(e, t) {
      t.statusFilter.set('blocked');
      Session.set('filterQuery', 'status:blocked');
    },

    'click #set-status-completed': function(e, t) {
      t.statusFilter.set('completed');
      Session.set('filterQuery', 'status:completed');
    },

    'click #set-status-rejected': function(e, t) {
      t.statusFilter.set('rejected');
      Session.set('filterQuery', 'status:rejected');
    },

    'click #set-status-duplicate': function(e, t) {
      t.statusFilter.set('duplicate');
      Session.set('filterQuery', 'status:duplicate');
    },

    'click #set-status-out-of-scope': function(e, t) {
      t.statusFilter.set('out-of-scope');
      Session.set('filterQuery', 'status:out-of-scope');
    },


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


  Template.filterTabMilestoneMenuItem.events({
    'click': function() {
      Session.set('filterTabCurrentMilestone', this.title);
      Session.set('filterQuery', 'milestoneTag:' + this.title);
    }
  })
}
