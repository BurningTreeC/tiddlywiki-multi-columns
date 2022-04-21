/*\
title: $:/plugins/BTC/tiddlywiki-multi-columns/modules/widget-subclasses/scrollable.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "scrollable";

// Specify a different name to make the subclass available as a new widget instead of overwriting the baseclass:
// exports.name = "my-enhanced-checkbox";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.handleScrollEvent = function(event) {
	if(event.paramObject && event.paramObject.passThrough === "yes") {
		return true;
	}
	// Call the base class handleScrollEvent function
	Object.getPrototypeOf(Object.getPrototypeOf(this)).handleScrollEvent.call(this,event);
};

})();