Meteor.startup(function() {
	var permissionLevel = notify.permissionLevel();
	console.log("Desktop Notifications: " + permissionLevel);
	if(permissionLevel == notify.PERMISSION_DEFAULT) {
		notify.requestPermission();
	}
	notify.config({pageVisibility: false, autoClose: 5000});
});
