Ols.Filter = {

	generateFilterSentenceFromLabel: function(label) {
		return 'Showing all <i class="fa fa-tag" style="margin-left:5px;color:' +
			label.color + '"></i> <strong style="margin-right:5px;color:' + label.color + '">' + label.title + '</strong> items' +
			' <i id="clear-active-filter-icon" class="fa fa-times" title="Clear filter"></i>';
	},

	generateFilterSentenceFromFilter: function(filter) {
		return 'Showing <i class="fa fa-filter" style="margin-left:5px"></i> <strong style="margin-right:5px;">' + filter.title + '</strong>' +
			' <i id="clear-active-filter-icon" class="fa fa-times" title="Clear filter"></i>';
	}

}
