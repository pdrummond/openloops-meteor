if(Meteor.isClient) {

	Template.articleList.onCreated(function() {
		this.subscribe('articles', {}, function(err, result) {
			if(err) {
				alert("Articles Subscription error: " + err);
			}
		});
	});

	Template.articleList.helpers({
		articles: function() {
			return Items.find({type:'article'});
		}
	});
}
