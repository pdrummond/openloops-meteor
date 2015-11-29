Ols.TimeUtils = {
	timeAgo: function(ts) {
		return moment(ts).fromNow();
	},

	formatTime: function(ts) {
		return moment(ts).format('MMMM Do YYYY, h:mm:ss a');
	}
}
