Package.describe({
  name: 'ols:item-list-view',
  version: '0.0.1',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'react', 'markoshust:material-ui', 'ols:lib']);
  api.addFiles(['item-list-view.jsx', 'item-view.jsx']);
  api.export('ItemListView');
});
