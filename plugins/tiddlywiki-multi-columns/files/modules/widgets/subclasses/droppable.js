/*\
title: $:/plugins/BTC/tiddlywiki-multi-columns/modules/widget-subclasses/droppable.js
type: application/javascript
module-type: widget-subclass

Widget base class

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

exports.baseClass = "droppable";

// Specify a different name to make the subclass available as a new widget instead of overwriting the baseclass:
// exports.name = "my-enhanced-checkbox";

exports.constructor = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

exports.prototype = {};

exports.prototype.render = function(parent,nextSibling) {
	var self = this,
		tag = this.parseTreeNode.isBlock ? "div" : "span",
		domNode;
	// Remember parent
	this.parentDomNode = parent;
	// Compute attributes and execute state
	this.computeAttributes();
	this.execute();
	if(this.droppableTag && $tw.config.htmlUnsafeElements.indexOf(this.droppableTag) === -1) {
		tag = this.droppableTag;
	}
	// Create element and assign classes
	domNode = this.document.createElement(tag);
	this.domNode = domNode;
	this.assignDomNodeClasses();
	// Add event handlers
	if(this.droppableEnable) {
		$tw.utils.addEventListeners(domNode,[
			{name: "dragenter", handlerObject: this, handlerMethod: "handleDragEnterEvent"},
			{name: "dragover", handlerObject: this, handlerMethod: "handleDragOverEvent"},
			{name: "dragleave", handlerObject: this, handlerMethod: "handleDragLeaveEvent"},
			{name: "drop", handlerObject: this, handlerMethod: "handleDropEvent"},
			{name: "dragend", handlerObject: this, handlerMethod: "handleDragEndEvent"}
		]);
	} else {
		$tw.utils.addClass(this.domNode,this.disabledClass);
	}
	// Insert element
	parent.insertBefore(domNode,nextSibling);
	this.renderChildren(domNode,null);
	this.domNodes.push(domNode);
	// Stack of outstanding enter/leave events
	this.currentlyEntered = [];
};

exports.prototype.handleEvent = function(event) {
	if(event.type === "dragenter") {
		if(event.target && event.target !== this.domNode && !$tw.utils.domContains(this.domNode,event.target)) {
			this.resetState(null,event);
		}
	} else if(event.type === "dragleave") {
		// Check if drag left the window
		if(event.relatedTarget === null || (event.relatedTarget && event.relatedTarget.nodeName === "HTML")) {
			this.resetState(null,event);
		}
	}
};

exports.prototype.resetState = function(options,event) {
	options = options || {};
	if(this.domNodes[0]) {
		$tw.utils.removeClass(this.domNodes[0],"tc-dragover");
	}
	this.currentlyEntered = [];
	this.document.body.removeEventListener("dragenter",this,true);
	this.document.body.removeEventListener("dragleave",this,true);
	if(options.performDragLeaveActions && this.dragLeaveActions) {
		var modifierKey = $tw.keyboardManager.getEventModifierKeyDescriptor(event);
		this.invokeActionString(this.dragLeaveActions,this,event,{modifier: modifierKey});
	}
	if(options.performDragEndActions && this.dragEndActions) {
		var modifierKey = $tw.keyboardManager.getEventModifierKeyDescriptor(event);
		this.invokeActionString(this.dragEndActions,this,event,{modifier: modifierKey});
	}
};

exports.prototype.enterDrag = function(event) {
	if(this.currentlyEntered.indexOf(event.target) === -1) {
		this.currentlyEntered.push(event.target);
	}
	// If we're entering for the first time we need to apply highlighting
	$tw.utils.addClass(this.domNodes[0],"tc-dragover");
	this.document.body.addEventListener("dragenter",this,true);
	this.document.body.addEventListener("dragleave",this,true);
	if(this.dragEnterActions) {
		var modifierKey = $tw.keyboardManager.getEventModifierKeyDescriptor(event);
		this.invokeActionString(this.dragEnterActions,this,event,{modifier: modifierKey});
	}
};

exports.prototype.leaveDrag = function(event) {
	var pos = this.currentlyEntered.indexOf(event.target);
	if(pos !== -1) {
		this.currentlyEntered.splice(pos,1);
	}
	// Remove highlighting if we're leaving externally. The hacky second condition is to resolve a problem with Firefox whereby there is an erroneous dragenter event if the node being dragged is within the dropzone
	if(this.currentlyEntered.length === 0) {
		this.resetState({performDragLeaveActions: true},event);
	}
};

exports.prototype.handleDragEnterEvent  = function(event) {
	this.enterDrag(event);
	// Tell the browser that we're ready to handle the drop
	event.preventDefault();
	// Tell the browser not to ripple the drag up to any parent drop handlers
	event.stopPropagation();
	return false;
};

exports.prototype.handleDragOverEvent  = function(event) {
	// Check for being over a TEXTAREA or INPUT
	if(["TEXTAREA","INPUT"].indexOf(event.target.tagName) !== -1) {
		return false;
	}
	// Tell the browser that we're still interested in the drop
	event.preventDefault();
	// Set the drop effect
	event.dataTransfer.dropEffect = this.droppableEffect;
	return false;
};

exports.prototype.handleDragLeaveEvent  = function(event) {
	this.leaveDrag(event);
	return false;
};

exports.prototype.handleDragEndEvent = function(event) {
	this.resetState({performDragEndActions: true});
};

exports.prototype.handleDropEvent  = function(event) {
	var self = this;
	this.leaveDrag(event);
	// Check for being over a TEXTAREA or INPUT
	if(["TEXTAREA","INPUT"].indexOf(event.target.tagName) !== -1) {
		return false;
	}
	var dataTransfer = event.dataTransfer;
	// Remove highlighting
	this.resetState(null,event);
	// Try to import the various data types we understand
	$tw.utils.importDataTransfer(dataTransfer,null,function(fieldsArray) {
		fieldsArray.forEach(function(fields) {
			self.performActions(fields.title || fields.text,event);
		});
	});
	// Tell the browser that we handled the drop
	event.preventDefault();
	// Stop the drop ripple up to any parent handlers
	event.stopPropagation();
	return false;
};

exports.prototype.performActions = function(title,event) {
	if(this.droppableActions) {
		var modifierKey = $tw.keyboardManager.getEventModifierKeyDescriptor(event);
		this.invokeActionString(this.droppableActions,this,event,{actionTiddler: title, modifier: modifierKey});
	}
};

/*
Compute the internal state of the widget
*/
exports.prototype.execute = function() {
	this.droppableActions = this.getAttribute("actions");
	this.droppableEffect = this.getAttribute("effect","copy");
	this.droppableTag = this.getAttribute("tag");
	this.droppableEnable = (this.getAttribute("enable") || "yes") === "yes";
	this.disabledClass = this.getAttribute("disabledClass","");
	this.dragEnterActions = this.getAttribute("dragenteractions");
	this.dragLeaveActions = this.getAttribute("dragleaveactions");
	this.dragEndActions = this.getAttribute("dragendactions");
	// Make child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
exports.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.tag || changedAttributes.enable || changedAttributes.disabledClass || changedAttributes.actions || changedAttributes.effect || changedAttributes.dragenteractions || changedAttributes.dragleaveactions || changedAttributes.dragendactions) {
		this.refreshSelf();
		return true;
	} else if(changedAttributes["class"]) {
		this.assignDomNodeClasses();
	}
	return this.refreshChildren(changedTiddlers);
};

})();