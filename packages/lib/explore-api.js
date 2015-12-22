Ols.Explore = {

	initExploreMode: function(template) {
		template.autorun(function() {
			var exploreMode = Ols.Explore.getExploreMode();
			if(exploreMode == true) {
				$("#explore-link").addClass("active");
				$(".main").css({'opacity':'0'});
				$(".right-sidebar").css({'opacity':'0'});
				$(".left-sidebar").css({'opacity':'0'});
				$(".explore-page").css({opacity:'1', 'z-index':'9999'});
			} else {
				$("#explore-link").removeClass("active");
				$(".explore-page").css({opacity:'0', 'z-index':'0'});
				$(".main").css({'opacity':'1'});
				$(".right-sidebar").css({'opacity':'1'});
				$(".left-sidebar").css({'opacity':'1'});
			}
		});
	},

	getExploreMode: function() {
		return this._private.exploreMode.get();
	},

	setExploreMode: function(exploreMode) {
		this._private.exploreMode.set(exploreMode);
	},

	toggleExploreMode: function() {
		var exploreMode = this._private.exploreMode.get();
		this._private.exploreMode.set(!exploreMode);
	},

	_private: {
		exploreMode: new ReactiveVar(false),
	}
}
