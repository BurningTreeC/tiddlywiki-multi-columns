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

exports.prototype.scrollIntoView = function(element,callback,options) {
	var duration = $tw.utils.hop(options,"animationDuration") ? parseInt(options.animationDuration) : $tw.utils.getAnimationDuration(),
		srcWindow = element ? element.ownerDocument.defaultView : window;
	var scrollPosition = {
		x: this.outerDomNode.scrollLeft,
		y: this.outerDomNode.scrollTop
	};
	// Get the client bounds of the element and adjust by the scroll position
	var scrollableBounds = this.outerDomNode.getBoundingClientRect(),
		clientTargetBounds = element.getBoundingClientRect(),
		bounds = {
			left: clientTargetBounds.left + scrollPosition.x - scrollableBounds.left,
			top: clientTargetBounds.top + scrollPosition.y - scrollableBounds.top,
			width: clientTargetBounds.width,
			height: clientTargetBounds.height
		};
	// We'll consider the horizontal and vertical scroll directions separately via this function
	var getEndPos = function(targetPos,targetSize,currentPos,currentSize) {
		// If the target is already visible then stay where we are
		if(targetPos >= currentPos && (targetPos + targetSize) <= (currentPos + currentSize)) {
			return currentPos;
		// If the target is above/left of the current view, then scroll to its top/left
		} else if(targetPos <= currentPos) {
			return targetPos;
		// If the target is smaller than the window and the scroll position is too far up, then scroll till the target is at the bottom of the window
		} else if(targetSize < currentSize && currentPos < (targetPos + targetSize - currentSize)) {
			return targetPos + targetSize - currentSize;
		// If the target is big, then just scroll to the top
		} else if(currentPos < targetPos) {
			return targetPos;
		// Otherwise, stay where we are
		} else {
			return currentPos;
		}
	},
	endX = getEndPos(bounds.left,bounds.width,scrollPosition.x,this.outerDomNode.offsetWidth),
	endY = getEndPos(bounds.top,bounds.height,scrollPosition.y,this.outerDomNode.offsetHeight);
	this.outerDomNode.scrollTo({top: endY, left: endX, behavior: "smooth"});
};

})();