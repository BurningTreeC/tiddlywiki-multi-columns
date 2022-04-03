/*\
title: $:/plugins/BTC/tiddlywiki-multi-columns/modules/storyviews/multi-column.js
type: application/javascript
module-type: storyview

Views the story as a linear sequence

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var easing = "cubic-bezier(0.645, 0.045, 0.355, 1)"; // From http://easings.net/#easeInOutCubic

var MultiColumnStoryView = function(listWidget) {
	this.listWidget = listWidget;
};

MultiColumnStoryView.prototype.navigateTo = function(historyInfo) {
	var duration = $tw.utils.getAnimationDuration()
	var listElementIndex = this.listWidget.findListItem(0,historyInfo.title);
	if(listElementIndex === undefined) {
		return;
	}
	var listItemWidget = this.listWidget.children[listElementIndex],
		targetElement = listItemWidget.findFirstDomNode();
	// Abandon if the list entry isn't a DOM element (it might be a text node)
	if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
		return;
	}
	if(duration) {
		console.log("NAVIGATING");
		// Scroll the node into view
		this.listWidget.dispatchEvent({type: "tm-scroll", target: targetElement, scrollContainer: targetElement.closest(".tc-scroll-container")});
	} else {
		targetElement.scrollIntoView();
	}
};

MultiColumnStoryView.prototype.insert = function(widget) {
	var duration = $tw.utils.getAnimationDuration();
};

MultiColumnStoryView.prototype.remove = function(widget) {
	var duration = $tw.utils.getAnimationDuration();
	widget.removeChildDomNodes();
};

exports["multi-column"] = MultiColumnStoryView;

})();