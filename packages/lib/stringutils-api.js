Ols.StringUtils = {
	/**
		Given a string and a maxLength returns the full string if its size is
		less than maxLength, otherwise, the string up to maxLength size with
		'...' appended.

		Example: Ols.StringUtils.truncate('This is a string', 2) --> 'Th...'

	*/
	truncate: function(str, maxLength) {
		if(str.length > maxLength) {
			return str.substring(0, maxLength) + "...";
		} else {
			return str;
		}
	}
}
