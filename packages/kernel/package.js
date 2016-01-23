Package.describe({
	name: 'ols:kernel',
	version: '0.0.1'
});

Package.onUse(function(api) {
	api.versionsFrom('1.2.1');
	api.use(['templating', 'ecmascript', 'tracker', 'session', 'ols:lib']);
	api.addFiles([
		'kernel.js',
		'components/dev-admin/dev-admin.html',
		'components/dev-admin/dev-admin.js',
	], ['client', 'server']);
	api.addFiles([
		'client/items.js',
		'client/streams.js',
		'client/notifications.js'
	], 'client');
	api.addFiles([
    'server/activity.js',
		'server/messages.js',
		'server/items.js',
		'server/filters.js',
		'server/users.js',
		'server/projects.js'
	], 'server');
});
