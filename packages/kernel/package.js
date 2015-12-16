Package.describe({
	name: 'ols:kernel',
	version: '0.0.1'
});

Package.onUse(function(api) {
	api.versionsFrom('1.2.1');
	api.use(['templating', 'ecmascript', 'ols:lib']);
	api.addFiles('kernel.js', ['client', 'server']);
	api.addFiles([
		'server/messages.js',
		'server/items.js',
		'server/filters.js',
		'server/users.js'
	], 'server');
});
