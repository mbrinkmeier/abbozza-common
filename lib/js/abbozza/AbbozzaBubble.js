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
 * @fileoverview ... 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
'use strict';

goog.provide('AbbozzaBubble');

goog.require('Blockly.Bubble');
goog.require('Blockly.Workspace');
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.userAgent');


AbbozzaBubble = function(workspace, content, shape, classname, anchorXY,
                         bubbleWidth, bubbleHeight, shiftX, shiftY) {
  this.shiftX_ = shiftX;
  this.shiftY_ = shiftY;
  this.classname_ = classname;
  this.showArrow_ = true;
  this.foreignObject_ = null;
  this.body_ = null;

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



AbbozzaBubble.prototype.setClassname = function(classname) {
    this.classname_ = classname;
};

AbbozzaBubble.prototype.setShift = function ( shiftX, shiftY ) {
    this.shiftX_ = shiftX;
    this.shiftY_ = shiftY;
    this.layoutBubble_();
}

AbbozzaBubble.prototype.layoutBubble_ = function() {
    // AbbozzaBubble.superClass_.layoutBubble_.call(this);    
    this.relativeLeft_ = this.shiftX_;
    this.relativeTop_ = this.shiftY_;
    var size = this.getBubbleSize();
    this.textarea_.setAttribute("title",size.width + "x" + size.height + " " + this.relativeLeft_ + "," + this.relativeTop_);    
}

/*
AbbozzaBubble.prototype.positionBubble_ = function() {
  var left = this.anchorXY_.x;
  if (this.workspace_.RTL) {
    left -= this.relativeLeft_ + this.width_;
  } else {
    left += this.relativeLeft_;
  }
  var top = this.relativeTop_ + this.anchorXY_.y;
  this.bubbleGroup_.setAttribute('transform',
      'translate(' + left + ',' + top + ')');
};
*/

/**
 * Create the editor for the comment's bubble.
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
  

AbbozzaBubble.prototype.setText = function(text) {
    this.textarea_.innerHTML = text;
}

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
}

AbbozzaBubble.prototype.hideArrow = function() {
    this.showArrow_ = false;
}

AbbozzaBubble.prototype.showArrow = function() {
    this.showArrow_ = true;
}

AbbozzaBubble.prototype.renderArrow_ = function() {
    if ( this.showArrow_ ) {
        AbbozzaBubble.superClass_.renderArrow_.call(this);
    } else {
        this.bubbleArrow_.setAttribute('d','');
    }
}

AbbozzaBubble.prototype.bubbleMouseMove_ = function(e) {
  AbbozzaBubble.superClass_.bubbleMouseMove_.call(this,e);
  var size = this.getBubbleSize();
  this.textarea_.setAttribute("title",size.width + "x" + size.height + " " + this.relativeLeft_ + "," + this.relativeTop_);    
}