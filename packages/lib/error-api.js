Ols.Error =  {
	showError: function(title, err) {
		if(err) {
			console.error("ERR: " + title + ":" + JSON.stringify(err, null, 4));
			toastr.error(err.reason, title);
		} else {
			console.error("ERR: " + title);
			toastr.error("No details", title);
		}

	}
}
