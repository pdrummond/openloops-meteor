Package.describe({
	name: 'ols:message-history',
	version: '0.0.1',
	// Brief, one-line summary of the package.
	summary: '',
	// URL to the Git repository containing the source code for this package.
	git: '',
	// By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md'
});

Package.onUse(function(api) {
	api.versionsFrom('1.2.1');
	api.use(['templating', 'ecmascript', 'reactive-var', 'ols:lib']);
	api.addFiles([
		'message-history.html',
		'message-history.js',
		'HistoryManager.js'
	]);
	api.export(['ServerMessages']);
});

Package.onTest(function(api) {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('ols:message-history');
	api.addFiles('message-history-tests.js');
});
