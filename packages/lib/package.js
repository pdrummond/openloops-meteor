Package.describe({
  name: 'ols:lib',
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'yuukan:streamy', 'mquandalle:stylus']);
  api.addFiles(['namespace.js', 'stringutils-api.js', 'project-api.js', 'item-api.js']);  
  api.export(['Ols', 'Streamy']);
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('ols:lib');
});
