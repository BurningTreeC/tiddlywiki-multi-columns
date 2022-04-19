/*\
title: $:/plugins/BTC/tiddlywiki-multi-columns/modules/startup/rootwidget-extend.js
type: application/javascript
module-type: startup

Add a "tm-focus-selector-deferred" message to the root widget

\*/
(function() {

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "rootwidget-extend";
exports.platforms = ["browser"];
exports.after = ["rootwidget"];
exports.before = ["story"];
exports.synchronous = true;

exports.startup = function() {
	// Install the tm-focus-selector-deferred message
	$tw.rootWidget.addEventListener("tm-focus-selector-deferred",function(event) {
		var selector = event.param || "",
			element,
			doc = event.event && event.event.target ? event.event.target.ownerDocument : document,
			delay = event.paramObject.delay;

		var focusSelector = function(selector) {
			try {
				element = doc.querySelector(selector);
			} catch(e) {
				console.log("Error in selector: ",selector)
			}
			if(element && element.focus) {
				element.focus(event.paramObject);
			}
		};
		if(delay) {
			setTimeout(function() {
				focusSelector(selector);
			},delay);
		} else {
			focusSelector(selector);
		}
	});
};

})();
