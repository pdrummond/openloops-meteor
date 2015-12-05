Ols.StringUtils = {
	/**
		Given a string and a maxLength returns the full string if its size is
		less than maxLength, otherwise, the string up to maxLength size with
		'...' appended.

		The ellipsis is included by default - to ommit pass {ellipsis: false} in
		the opts

		Example: Ols.StringUtils.truncate('This is a string', 2) --> 'Th...'

	*/
	truncate: function(str, maxLength, opts) {
		opts = opts || {ellipsis:true};
		if(str.length > maxLength) {
			str = str.substring(0, maxLength);
			if(opts.ellipsis) {
				 str += "...";
			}
		}
		return str;
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
