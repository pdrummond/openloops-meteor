Package.describe({
  name: 'ols:message-box-view',
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'react', 'markoshust:material-ui', 'ols:lib']);
  api.addFiles(['message-box-view.jsx']);
  api.export('MessageBoxView');
});
