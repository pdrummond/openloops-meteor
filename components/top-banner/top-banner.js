if(Meteor.isClient) {

	Template.topBanner.events({

		'click #explore-link': function() {
			var exploreMode = Session.get('exploreMode');
			Session.set('exploreMode', !exploreMode);
			if(exploreMode == true) {
				$("#explore-link").removeClass("active");
				$(".explore-page").css({opacity:'0', 'z-index':'0'});
				$(".main").css({'opacity':'1'});
				$(".right-sidebar").css({'opacity':'1'});
				$(".left-sidebar").css({'opacity':'1'});
			} else {
				$("#explore-link").addClass("active");
				$(".main").css({'opacity':'0'});
				$(".right-sidebar").css({'opacity':'0'});
				$(".left-sidebar").css({'opacity':'0'});
				$(".explore-page").css({opacity:'1', 'z-index':'999999999'});
			}
		},

		'click .project-breadcrumb': function() {
			FlowRouter.go("/project/" + Session.get('currentProjectId'));
		},

		'click #boards-dropdown-button': function() {
			$("#board-chooser-menu").slideToggle();
		},

		'click #create-link': function() {
			Ols.Router.showCreateItemPage();
		}
	});

	Template.topBanner.helpers({

		headerProjectTitle: function() {
			var project = Projects.findOne(Session.get('currentProjectId'));
			return project?project.title:'';
		},

		headerBoardTitle: function() {
			var board = Boards.findOne(Session.get('currentBoardId'));
			return board?board.title:'';
		}
	});

}
