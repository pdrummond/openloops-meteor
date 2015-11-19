Package.describe({
  name: 'ols:message-history-view',
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'react', 'ols:lib']);
  api.addFiles(['message-history-view.jsx', 'chat-message-view.jsx']);
  api.export('MessageHistoryView');
});
