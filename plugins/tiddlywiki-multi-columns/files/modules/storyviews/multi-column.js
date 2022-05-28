/*\
title: $:/plugins/BTC/tiddlywiki-multi-columns/modules/storyviews/multi-column.js
type: application/javascript
module-type: storyview

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
	// Scroll the node into view
	this.listWidget.dispatchEvent({type: "tm-scroll", target: targetElement});
};

MultiColumnStoryView.prototype.insert = function(widget) {
	var duration = $tw.utils.getAnimationDuration();
	if(duration && (widget.wiki.getTiddlerText("$:/state/DisableInsertAnimation") !== "yes")) {
		var targetElement = widget.findFirstDomNode();
		// Abandon if the list entry isn't a DOM element (it might be a text node)
		if(!targetElement || targetElement.nodeType === Node.TEXT_NODE) {
			return;
		}
		// Get the current height of the tiddler
		var computedStyle = window.getComputedStyle(targetElement),
			currMarginBottom = parseInt(computedStyle.marginBottom,10),
			currMarginTop = parseInt(computedStyle.marginTop,10),
			currHeight = targetElement.offsetHeight + currMarginTop,
			focusedElement;
		if(targetElement.attributes["data-tiddler-title"]) {
			focusedElement = targetElement.ownerDocument.activeElement;
			widget.wiki.setText("$:/state/inserting/to-story/" + targetElement.attributes["data-tiddler-title"].value,"height",undefined,currHeight);
		}
		$tw.utils.addClass(targetElement,"tc-inserting");
		setTimeout(function() {
			$tw.utils.removeClass(targetElement,"tc-inserting");
			widget.wiki.deleteTiddler("$:/state/inserting/to-story/" + targetElement.attributes["data-tiddler-title"].value);
			widget.wiki.deleteTiddler("$:/state/inserting/from-right/" + targetElement.attributes["data-tiddler-title"].value);
			widget.wiki.deleteTiddler("$:/state/inserting/from-left/" + targetElement.attributes["data-tiddler-title"].value);
			if(focusedElement.focus && focusedElement.select) {
				focusedElement.focus({preventScroll: "true"}) && focusedElement.select();
			}
		},duration);
	}
	if(duration && (widget.wiki.getTiddlerText("$:/state/DisableInsertAnimation") === "yes")) {
		setTimeout(function() {
			widget.wiki.deleteTiddler("$:/state/DisableInsertAnimation");
			widget.wiki.deleteTiddler("$:/state/DisableRemoveAnimation");
		},duration);
	} else if(widget.wiki.getTiddlerText("$:/state/DisableInsertAnimation") === "yes") {
		widget.wiki.deleteTiddler("$:/state/DisableInsertAnimation");
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
		// Get the current height of the tiddler
		var currWidth = targetElement.offsetWidth,
			computedStyle = window.getComputedStyle(targetElement),
			currMarginBottom = parseInt(computedStyle.marginBottom,10),
			currMarginTop = parseInt(computedStyle.marginTop,10),
			currHeight = targetElement.offsetHeight + currMarginTop;
		if(targetElement.attributes["data-tiddler-title"]) {
			widget.wiki.setText("$:/state/removing/from-story/" + targetElement.attributes["data-tiddler-title"].value,"height",undefined,currHeight);
		}
		setTimeout(function() {
			removeElement();
			widget.wiki.deleteTiddler("$:/state/removing/from-story/" + targetElement.attributes["data-tiddler-title"].value);
			widget.wiki.deleteTiddler("$:/state/removing/to-right/" + targetElement.attributes["data-tiddler-title"].value);
			widget.wiki.deleteTiddler("$:/state/removing/to-left/" + targetElement.attributes["data-tiddler-title"].value);
		},duration);
		// Animate the closure
		$tw.utils.addClass(targetElement,"tc-removing");
	} else {
		widget.removeChildDomNodes();
	}
};

exports["multi-column"] = MultiColumnStoryView;

})();