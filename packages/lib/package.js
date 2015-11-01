Package.describe({
  name: 'ols:lib',
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('momentjs:moment');
  api.addFiles(['namespace.js', 'DateFormat.js']);
  api.export('Ols');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('ols:lib');
});