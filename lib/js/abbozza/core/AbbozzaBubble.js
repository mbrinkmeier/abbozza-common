/* global goog */

/**
 * @license
 * abbozza!
 *
 * Copyright 2015-2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
 * @fileoverview AbbozzaBubble
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 * 
 * This class provides an adapted Blockly.Bubble. The main difference is the
 * description of the bubbles geometry. Its position is given by an offset
 * relative to its anchor.
 */
'use strict';

goog.provide('AbbozzaBubble');

goog.require('Blockly.Bubble');
goog.require('Blockly.Workspace');
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.userAgent');


/**
 * The constructor for an Abbozza.Bubble
 * 
 * @param {type} workspace The workspace of the bubble.
 * @param {type} content The content of the bubble
 * @param {type} shape
 * @param {type} classname
 * @param {type} anchorXY
 * @param {type} bubbleWidth
 * @param {type} bubbleHeight
 * @param {type} shiftX
 * @param {type} shiftY
 * @returns {AbbozzaBubble}
 */
AbbozzaBubble = function(workspace, content, shape, classname, anchorXY,
                         bubbleWidth, bubbleHeight, shiftX, shiftY) {
  this.shiftX_ = shiftX;
  this.shiftY_ = shiftY;
  this.classname_ = classname;
  this.showArrow_ = true;
  this.foreignObject_ = null;
  this.body_ = null;
  this.listeners_ = [];

      this.svgGroup_ = Blockly.createSvgElement('g',{},null);      
      this.svgPath_ = Blockly.createSvgElement('path', { 'class':'blocklypath'}, this.svgGroup_);
      
      AbbozzaBubble.superClass_.constructor.call(this, workspace, this.createSvg_(), this.svgPath_, anchorXY , bubbleWidth, bubbleHeight);
      // AbbozzaBubble.superClass_.constructor.call(this, workspace, null, shape, anchorXY, bubbleWidth, bubbleHeight);
  if (content != null) {
      this.textarea_.innerHTML = content;
      this.resize_();
  }
  this.registerResizeEvent(this.resize_);
};
goog.inherits(AbbozzaBubble, Blockly.Bubble);


/**
 * Adds an resize event listener.
 * 
 * @param {type} listener
 * @returns {undefined}
 */
AbbozzaBubble.prototype.addSizeListener = function(listener) {
  for ( var i = 0; i < this.listeners_.length; i++ ) {
      if ( this.listeners_[i] == listener ) return;
  }
  this.listeners_.push(listener);
};


/**
 * Adds an remove event listener
 * 
 * @param {type} listener
 * @returns {undefined}
 */
AbbozzaBubble.prototype.removeSizeListener = function(listener) {
  for ( var i = 0; i < this.listeners_.length; i++ ) {
      if ( this.listeners_[i] == listener ) {
          this.listeners_[i] = this.listeners_[this.listeners_.length-1];
          this.listeners_.pop();
      }
  }
};


/**
 * Fires a resize event.
 * 
 * @returns {undefined}
 */
AbbozzaBubble.prototype.fireSizeEvent = function() {
  for ( var i = 0; i < this.listeners_.length; i++ ) {
      if ( (this.listeners_[i]) && (this.listeners_[i].bubbleResized != "undefined") ) {
          this.listeners_[i].bubbleResized(this);
      }
  }    
};


/**
 * Sets the class name of the bubble.
 * 
 * @param {type} classname
 * @returns {undefined}
 */
AbbozzaBubble.prototype.setClassname = function(classname) {
    this.classname_ = classname;
};

/**
 * Sets the shift relative to the anchor.
 * 
 * @param {type} shiftX The shift in x-direction.
 * @param {type} shiftY The shift in y-direction.
 * @returns {undefined}
 */
AbbozzaBubble.prototype.setShift = function ( shiftX, shiftY ) {
    this.shiftX_ = shiftX;
    this.shiftY_ = shiftY;
    this.layoutBubble_();
};

/**
 * Draws the bubble.
 * 
 * @returns {undefined}
 */
AbbozzaBubble.prototype.layoutBubble_ = function() {
    // AbbozzaBubble.superClass_.layoutBubble_.call(this);    
    this.relativeLeft_ = this.shiftX_;
    this.relativeTop_ = this.shiftY_;
    var size = this.getBubbleSize();
    this.textarea_.setAttribute("title",size.width + "x" + size.height + " " + this.relativeLeft_ + "," + this.relativeTop_);    
};


/**
 * Create the editor for the comment's bubble.
 * 
 * @return {!Element} The top-level node of the editor.
 * @private
 */
AbbozzaBubble.prototype.createSvg_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject x="8" y="8" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.createSvgElement('foreignObject',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);
  this.body_ = document.createElementNS(Blockly.HTML_NS, 'body');
  this.body_.setAttribute('xmlns', Blockly.HTML_NS);
  this.body_.className = 'taskHintBody';

  this.textarea_ = document.createElementNS(Blockly.HTML_NS, 'div');
  this.textarea_.className = 'taskHintContent';
  // this.textarea_.setAttribute('dir', this.block_.RTL ? 'RTL' : 'LTR');
  this.body_.appendChild(this.textarea_);
  this.foreignObject_.appendChild(this.body_);
  // Blockly.bindEvent_(this.textarea_, 'mouseup', this, this.textareaFocus_);
  // Don't zoom with mousewheel.
  Blockly.bindEvent_(this.textarea_, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  return this.foreignObject_;
};
  
  
/**
 * Set the text displayed in the bubble.
 * 
 * @param {type} text
 * @returns {undefined}
 */
AbbozzaBubble.prototype.setText = function(text) {
    this.textarea_.innerHTML = text;
};

/**
 * Resizes teh bubble.
 * 
 * @returns {undefined}
 */
AbbozzaBubble.prototype.resize_ = function() {
  var size = this.getBubbleSize();
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  this.foreignObject_.setAttribute('width', size.width - doubleBorderWidth);
  this.foreignObject_.setAttribute('height', size.height - doubleBorderWidth);
  this.body_.style.width = (size.width-doubleBorderWidth) + 'px';
  this.body_.style.height = (size.height-doubleBorderWidth) + 'px';
  // this.textarea_.style.width = (size.width - doubleBorderWidth - 10) + 'px';
  // this.textarea_.style.height = (size.height - doubleBorderWidth - 10) + 'px';
  var size = this.getBubbleSize();
  this.textarea_.setAttribute("title",size.width + "x" + size.height + " " + this.relativeLeft_ + "," + this.relativeTop_);
  this.fireSizeEvent();
};

/**
 * Hides the arrow.
 * 
 * @returns {undefined}
 */
AbbozzaBubble.prototype.hideArrow = function() {
    this.showArrow_ = false;
};

/**
 * Shows the arrow.
 * 
 * @returns {undefined}
 */
AbbozzaBubble.prototype.showArrow = function() {
    this.showArrow_ = true;
};

/**
 * Renders the arroe.
 * 
 * @returns {undefined}
 */
AbbozzaBubble.prototype.renderArrow_ = function() {
    if ( this.showArrow_ ) {
        AbbozzaBubble.superClass_.renderArrow_.call(this);
    } else {
        this.bubbleArrow_.setAttribute('d','');
    }
};

/**
 * Called if the mouse moved in the bubble.
 * 
 * @param {type} e
 * @returns {undefined}
 */
AbbozzaBubble.prototype.bubbleMouseMove_ = function(e) {
  AbbozzaBubble.superClass_.bubbleMouseMove_.call(this,e);
  var size = this.getBubbleSize();
  this.textarea_.setAttribute("title",size.width + "x" + size.height + " " + this.relativeLeft_ + "," + this.relativeTop_);
  this.fireSizeEvent();
};