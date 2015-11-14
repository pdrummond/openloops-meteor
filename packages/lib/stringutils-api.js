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
	},

	/**
		For a given string, returns false if the string is null or if its length
		is 0 after being trimmed.
	*/
	notEmpty: function(str) {
		return !this.isEmpty(str);
	},

	/**
		For a given string, returns true if the string is null or if its length
		is 0 after being trimmed.
	*/
	isEmpty: function(str) {
		var empty = (str == null);
		if(!empty) {
			empty = str.trim().length == 0;
		}
		return empty;
	}
}
