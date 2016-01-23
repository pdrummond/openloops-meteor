Projects = new Meteor.Collection("projects");
Items = new Meteor.Collection('items');
Settings = new Meteor.Collection('settings');
Counters = new Mongo.Collection('counters');
Filters = new Meteor.Collection('filters');
Activity = new Meteor.Collection('activity');

if(Meteor.isServer) {
	ServerMessages = new Meteor.Collection('server-messages');
}

if(Meteor.isClient) {
	ClientMessages = new Meteor.Collection('client-messages');
}
