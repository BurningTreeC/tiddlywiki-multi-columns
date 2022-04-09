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
		// Scroll the node into view
		this.listWidget.dispatchEvent({type: "tm-scroll", target: targetElement});
	} else {
		targetElement.scrollIntoView();
	}
};

MultiColumnStoryView.prototype.insert = function(widget) {
	var duration = $tw.utils.getAnimationDuration();
	if(duration && (widget.wiki.getTiddlerText("$:/state/DisableInsertAnimation") !== "yes")) {
		var targetElement = widget.findFirstDomNode();
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
			return;
		}
		setTimeout(function() {
			$tw.utils.removeClass(targetElement,"tc-inserting");
		},duration);
		$tw.utils.addClass(targetElement,"tc-inserting");
	}
	if(widget.wiki.getTiddlerText("$:/state/DisableInsertAnimation") === "yes") {
		widget.wiki.deleteTiddler("$:/state/DisableInsertAnimation");
	}
	if(widget.wiki.getTiddlerText("$:/state/DisableRemoveAnimation") === "yes") {
		widget.wiki.deleteTiddler("$:/state/DisableRemoveAnimation");
	}
};

MultiColumnStoryView.prototype.remove = function(widget) {
	var duration = $tw.utils.getAnimationDuration();
	if(duration && (widget.wiki.getTiddlerText("$:/state/DisableRemoveAnimation") !== "yes")) {
		var targetElement = widget.findFirstDomNode(),
			removeElement = function() {
				widget.removeChildDomNodes();
			};
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
			removeElement();
			return;
		}
		setTimeout(removeElement,duration);
		// Animate the closure
		$tw.utils.addClass(targetElement,"tc-removing");
	} else {
		widget.removeChildDomNodes();
	}
	if(widget.wiki.getTiddlerText("$:/state/DisableRemoveAnimation") === "yes") {
		widget.wiki.deleteTiddler("$:/state/DisableRemoveAnimation");
	}
};

exports["multi-column"] = MultiColumnStoryView;

})();