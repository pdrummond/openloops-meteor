Package.describe({
  name: 'ols:lib',
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['templating', 'ecmascript', 'react', 'reactive-var', 'markoshust:material-ui', 'yuukan:streamy', 'mquandalle:stylus']);
  api.addFiles([
	  'namespace.js',
	  'timeutils-api.js',
	  'stringutils-api.js',
	  'context-api.js',
	  'project-api.js',
	  'message-api.js',
	  'item-api.js',
	  'message-history-api.js'
  ]);
  api.export(['Ols', 'Streamy']);
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('ols:lib');
});
