Package.describe({
  name: 'ols:github',
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'templating', 'simple:json-routes', 'ols:lib']);
  api.addFiles('github.js', ['server', 'client']);
  api.addFiles('github.html', ['client']);
  api.addAssets(['public/images/GitHub-Mark-32px.png', 'public/images/GitHub-Mark-64px.png'], 'client');
});
