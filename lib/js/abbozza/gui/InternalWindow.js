/**
 * @license
 * abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/**
 * @fileoverview This class provides an internal, editable window displaying a
 * HTML subdocument.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * TODO:
 * - Scrolling of textarea doesn't work; misbehaviour is inherited from 
 *   Blockly.Bubble
 */


'use strict';

goog.provide('InternalWindow');

goog.require('Blockly.Bubble');
goog.require('Blockly.Icon');
goog.require('goog.userAgent');


/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @extends {Blockly.Icon}
 * @constructor
 */
InternalWindow = function(workspace,block,title,classname,x,y,width,height,editable,opt_closeHandler) {
  this.textDragging = false;
  this.block = block;
  this.wintitle = title;
  this.classname = classname;
  this.editable = editable;
  this.closeHandler = opt_closeHandler;
  this.svgGroup_ = Blockly.createSvgElement('g',{},null);
  this.svgPath_ = Blockly.createSvgElement('path', { 'class':'blocklypath'}, this.svgGroup_);
  
  InternalWindow.superClass_.constructor.call(this, 
  		workspace,
  		this.createSvg_(), 
  		// block.svgPath_,
  		this.svgPath_,x,y,width,height);
  var size = this.getBubbleSize();
  // this.setVisible(true);
  if (this.block != null) {
    var xy = this.block.getRelativeToSurfaceXY();
    this.setAnchorLocation(xy.x,xy.y + 20);
  } else {
    this.setAnchorLocation(x,y);      
  }
  this.registerResizeEvent(this, this.resize_);
  this.setBubbleSize(width, height);
  // this.layoutBubble_();
  this.positionBubble_();
  // Blockly.bindEvent_(this.textarea_, 'mouseup', this, this.textareaFocus_);
  Blockly.bindEvent_(this.head_,'mousedown', this, this.bubbleMouseDown_);
  Blockly.bindEvent_(this.closer_,'mouseup', this, this.close);       
  // if ( opt_closeHandler ) {
  // 	  Blockly.bindEvent_(this.closer_,'mouseup', this, opt_closeHandler);
  // } else {
  // 	  Blockly.bindEvent_(this.closer_,'mouseup', this, this.dispose);       
  // }
  if (this.editable) {
    Blockly.bindEvent_(this.editor_,'mouseup', this, this.showEditor);
  }
 // Blockly.bindEvent_(this.textarea_, 'mousemove', this, this.textDrag_); 
 Blockly.bindEvent_(this.textarea_,'mousedown', this, this.textareaFocus_)
 // Blockly.bindEvent_(this.textarea_,'mouseup', this, this.textMouseUp_)
 // Blockly.unbindEvent_(this.textarea_, 'mousemove');  
};
goog.inherits(InternalWindow, Blockly.Bubble);


InternalWindow.prototype.textareaFocus_ = function(e) {
  this.promote_();
  // Ideally this would be hooked to the focus event for the comment.
  // However doing so in Firefox swallows the cursor for unknown reasons.
  // So this is hooked to mouseup instead.  No big deal.
  // Since the act of moving this node within the DOM causes a loss of focus,
  // we need to reapply the focus.
  this.textarea_.focus();
  e.stopPropagation();
  // this.textarea_.scrollTop += 10;
};

/*
InternalWindow.prototype.textDrag_ = function(event) {
    if (event.buttons == 1) {
        // console.log(event);
        var delta = event.y - this.textDraggingY;
        // this.textarea_.scrollTop += delta/10;
        // console.log("scrollTop " + this.textarea_.scrollTop);
        // this.textDraggingY = event.y;
        console.log(this.textarea_.scrollTop);
        this.textarea_.scrollTop = this.draggingScrollTop + event.y - this.textDraggingY;
        console.log(this.textarea_.scrollTop);
        console.log(event.y - this.textDraggingY);
        console.log("###");
        event.stopPropagation();
    }
}

InternalWindow.prototype.textMouseUp_ = function(event) {
    // console.log("kcilc");
    if (this.textDragging == true ) {
        this.textDragging = false;
        console.log("dragend");
        console.log(this.textarea_.scrollTop);
        this.textarea_.scrollTop -= event.y - this.textDraggingY;
        console.log(this.textarea_.scrollTop);
        console.log(event.y - this.textDraggingY);
        event.stopPropagation();
        // console.log(this.textarea_);
    }
}
*/

// InternalWindow.prototype.renderArrow_ = function() {};


InternalWindow.prototype.createSvg_ = function() {
  this.foreignObject_ = Blockly.createSvgElement('foreignObject',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'BODY');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  // body.className = 'blocklyMinimalBody';
  body.className = this.classname;

  /*  
  this.head_ = document.createElementNS(Blockly.HTML_NS, 'div');
  this.head_.className = this.classname + "Head";
  this.head_.appendChild(document.createTextNode(this.wintitle));
  body.appendChild(this.head_);
   
  this.closer_ = document.createElementNS(Blockly.HTML_NS,"img");
  this.closer_.className = this.classname +  "Button";
  this.closer_.src = "../img/iwin_close.png";
  this.closer_.setAttribute("title",_("gui.save"));
  this.head_.appendChild(this.closer_);

  if (this.editable) {
     this.editor_  = document.createElementNS(Blockly.HTML_NS,"img");
     this.editor_.className = this.classname +  "Button";
     this.editor_.src = "../img/iwin_edit.png";
     this.editor_.setAttribute("title",_("gui.edit"));
     this.head_.appendChild(this.editor_);
 } else {
     this.editor_ = null;
 }
  */
 
  this.textarea_ = document.createElementNS(Blockly.HTML_NS,'div');
  this.textarea_.className = this.classname + "Content";
  // this.textarea_.setAttribute('dir', Blockly.RTL ? 'RTL' : 'LTR');
  this.textarea_.setAttribute('readonly', 'true');
  // this.inner_ = this.textarea_;
  // this.inner_ = document.createElementNS(Blockly.HTML_NS,'div');
  // this.inner_.className = "iwinInner";
  // this.textarea_.appendChild(this.inner_);
  body.appendChild(this.textarea_);  
  
  this.foreignObject_.appendChild(body);
  return this.foreignObject_;
};


InternalWindow.prototype.setLocation = function(x,y) {
	this.relativeLeft_ = x;
	this.relativeTop_ = y;
};


InternalWindow.prototype.resize_ = function() {
  var size = this.getBubbleSize();
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  this.foreignObject_.setAttribute('width', size.width - doubleBorderWidth);
  this.foreignObject_.setAttribute('height', size.height - doubleBorderWidth);
  this.textarea_.style.width = (size.width - doubleBorderWidth - 10) + 'px';
  this.textarea_.style.height = (size.height - doubleBorderWidth - 10) + 'px';
};

InternalWindow.prototype.setText = function(text) {
    this.textarea_.innerHTML = text;
};

InternalWindow.prototype.appendText = function(text) {
	this.text_.textContent = this.text_.textContent + text;
        this.textarea_.scrollTop = this.textarea_.scrollHeight;
}

InternalWindow.prototype.close = function() {
    if ( this.closeHandler ) {
        this.closeHandler.call(this);
    }
    this.dispose();
}

InternalWindow.prototype.renderArrow_ = function() {
    if (this.block == null) {
        return [];
    } else {
        var xy = this.block.getRelativeToSurfaceXY();
        this.setAnchorLocation(xy.x,xy.y + 20);
        return Blockly.Bubble.prototype.renderArrow_.call(this);
    }
}


InternalWindow.prototype.showEditor = function() {
    this.overlay_ = document.createElementNS(Blockly.HTML_NS, 'DIV');
    this.overlay_.className = "iwinEditorOverlay";
    this.overlay_.id = "iwinEditorOverlay";
    
    this.overlayTitle_ = document.createElementNS(Blockly.HTML_NS, 'textarea');
    this.overlayTitle_.className = "iwinEditorTitle";
    this.overlayTitle_.value = this.wintitle;
    this.overlayTitle_.readOnly = false;
    this.overlay_.appendChild(this.overlayTitle_);
    
    this.overlayContent_ = document.createElementNS(Blockly.HTML_NS, 'textarea');
    this.overlayContent_.className = "iwinEditorContent";
    this.overlayContent_.value = this.textarea_.innerHTML;
    this.overlay_.appendChild(this.overlayContent_);

    this.overlayButtons_ = document.createElementNS(Blockly.HTML_NS, 'div');
    this.overlayButtons_.className = "iwinEditorButtons";
    this.overlay_.appendChild(this.overlayButtons_);
    
    this.overlayCancel_ = document.createElementNS(Blockly.HTML_NS, 'span');
    this.overlayCancel_.className = "iwinEditorButton";
    this.overlayCancel_.textContent = _("gui.cancel");
    this.overlayButtons_.appendChild(this.overlayCancel_);
    Blockly.bindEvent_(this.overlayCancel_, 'mouseup', this, this.cancelEditor);

    this.overlayOK_ = document.createElementNS(Blockly.HTML_NS, 'span');
    this.overlayOK_.className = "iwinEditorButton";
    this.overlayOK_.textContent = _("gui.save");
    this.overlayButtons_.appendChild(this.overlayOK_);
    Blockly.bindEvent_(this.overlayOK_, 'mouseup', this, this.closeEditor);

    document.getElementsByTagName("BODY")[0].appendChild(this.overlay_);
}

InternalWindow.prototype.closeEditor = function() {
    document.getElementsByTagName("BODY")[0].removeChild(this.overlay_);
    this.wintitle = this.overlayTitle_.value;
    this.head_.replaceChild(document.createTextNode(this.wintitle),this.head_.firstChild);
    this.textarea_.innerHTML = this.overlayContent_.value;
    this.block.text_ = this.overlayContent_.value;
    this.block.textWidth_ = this.foreignObject_.getAttribute("width");
    this.block.textHeight_ = this.foreignObject_.getAttribute("height");
    this.resize_();
}

InternalWindow.prototype.cancelEditor = function() {
    document.getElementsByTagName("BODY")[0].removeChild(this.overlay_);
}


