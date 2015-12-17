
// Override Meteor._debug to filter for custom msgs - as used
// by yuukan:streamy (https://goo.gl/4HQiKg)
Meteor._debug = (function (super_meteor_debug) {
	return function (error, info) {
		if (!(info && _.has(info, 'msg')))
		super_meteor_debug(error, info);
	}
})(Meteor._debug);

if(Meteor.isClient) {
	Tracker.autorun(function () {
		var status = Meteor.status().status;
		console.log("** STATUS CHANGE: " + status);
		Session.set('connectionStatus', status);
	});
}
