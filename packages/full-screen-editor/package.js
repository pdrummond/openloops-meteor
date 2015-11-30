Package.describe({
  name: 'ols:full-screen-editor',
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['templating', 'ecmascript', 'mquandalle:stylus', 'ashokgelal:codemirror', 'ols:lib']);
  api.addFiles(['full-screen-editor.html', 'full-screen-editor.styl', 'full-screen-editor.js', 'full-screen-editor-api.js'], 'client');
});
