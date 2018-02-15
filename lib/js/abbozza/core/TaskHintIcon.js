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
 * @fileoverview Object representing a code comment.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('TaskHintIcon');

goog.require('Abbozza.Bubble');
goog.require('Blockly.Bubble');
goog.require('Blockly.Icon');
goog.require('goog.userAgent');


/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @extends {Blockly.Icon}
 * @constructor
 */
TaskHintIcon = function(block, content, width, height, shiftX, shiftY ) {
  this.width_ = width;
  this.height_ = height;
  this.shiftX_ = shiftX;
  this.shiftY_ = shiftY;
  this.hints_ = [];
  TaskHintIcon.superClass_.constructor.call(this, block);
  this.createIcon();
  this.setText(content);
  this.block_.warning = this;
  this.setVisible(true);  
};
goog.inherits(TaskHintIcon, Blockly.Icon);

/**
 * Icon in base64 format.
 * @private
 */
TaskHintIcon.prototype.png_ = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABmJLR0QAAAAAAP/UQVTyAAAACXBIWXMAAA3IAAANyAF98iWoAAAAB3RJTUUH4AkaDTYRA1BGfAAAAddJREFUOMudk01LW1EQht+TNIKXkIAQg2Jbwa2xFN0USkFcCm6KixBCm59Q6EZwr+sWFASllO76L0Jc1mqty0ApFCXlCvfjXKs39ekiBJrcm9J2YDjMx/vOnDlzjFIEeBJFWg9DLeZyKsWxvufz+uA4em+MaQ7nmyHwoufpjevq/sGBnKMjZTsdaXJSWlrSz0ZD0cSEvhSLemaM+Zio3u2yHgTYWo1bY0BKaiYD9Tq3YUjY7fJ0uP3HnoetVAZB1Sq0273zd//CAngeFnjUJ8gFAd9WV5OV222A3jkcW1uDIOArcEdAvdkkSGv/TyQSHB4SALWM66qxu6u8/kN2dpS/vNTzzNiYHrRayYRCIekzZtButaRcTg8zjqNCp5ME+H7a/gzaFxeS46ioKMIvldLvXK32ZlKtQjabjJfLYC2eXJfPy8vpJH2iqan02MoKuC6fdH3N5t4eP0YRpO1JX/f3uYpjNgSUo4hwdvbfnnhuDqwlBEqSpCji5ekp4fj433XiOHB2RhhFvBiYtOfx7viYcHp69HwkmJmBkxNCz+Nt2vc31rJpLXZri5v5+UFwpQLb29xYi726YgMwI7cQuBcEvPZ9zuOY2HUJ45jY9zkPAl4Bd4cxvwCnxAvhja4QrQAAAABJRU5ErkJggg==';
//TaskHintIcon.prototype.png_ = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAANyAAADcgBffIlqAAAAAd0SU1FB98DGgAnBf0Xj5sAAAIBSURBVDjLjZO9SxxRFMXPrFkWl2UFYSOIRtF210YtAiH/gGATRNZFgo19IBaB9Ipgk3SiEoKQgI19JIVgGaOIgpWJEAV1kZk3b1ad0V+KRYIzk5ALh1ecc88978tRSgHPg0Bjvq/BbFalMNR5oaBv+bzWHMfZjOudWPOg6+pDva6elRXlt7fVcnYmPX4sDQ3pdmpKQXu7frS16aXjON8T06OIMWOwtRp3jgNSEpkMTE5y5/v4UcSLePxnroutVNKb4xgYANfFAk/vDbLG8Gtk5P8M7jE6CsZwDDwSMLm5iYmLlpbg4ABOTmBjA4aHk0ZbWxigposLvlarScH5OSwvw9oaABwdJTW1GtTrfJHnUe/uTgqKxeZaKEAUgTEQP/CeHvA8LhRFhLlc+r6zWVhfbyaZn0/yuRxEEaGCAK9USjdZWGgarK5CS0uS7+gAa3EzjYaOy2WlludJi4vSzIx0e5vky2Xp6ko/M4WCPleruk4zsVa6vJSur9OHTEzoqljUJwEdQYDf25uMe3jY3E5fX5Lr7wdr8YGSJCkIeL23h9/a+lA4Pg7T039u6h75POzv4wcBrx5Ec11Wd3bwOzv//VK7umB3F991+Zj2/R1reWstdnaWm3L5YXOlAnNz3FiLbTR4Azj6WwFPjOG953EahoT1On4YEnoep8bwDuiO9/wG1sM4kG8A4fUAAAAASUVORK5CYII=';

/**
 * Comment text (if bubble is not visible).
 * @private
 */
TaskHintIcon.prototype.text_ = '';

/**
 * Width of bubble.
 * @private
 */
TaskHintIcon.prototype.width_ = 160;

/**
 * Height of bubble.
 * @private
 */
TaskHintIcon.prototype.height_ = 80;

TaskHintIcon.prototype.shiftX_ = 0;
TaskHintIcon.prototype.shiftY_ = 0;

TaskHintIcon.prototype.isIcon = true;

/**
 * Add or remove editability of the comment.
 * @override
 */
TaskHintIcon.prototype.updateEditable = function() {
  if (this.isVisible()) {
    // Toggling visibility will force a rerendering.
    this.setVisible(false);
    this.setVisible(true);
  }
  // Allow the icon to update.
  Blockly.Icon.prototype.updateEditable.call(this);
};

/**
 * Show or hide the comment bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
TaskHintIcon.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  if ((!this.block_.isEditable() && !this.textarea_) || goog.userAgent.IE) {
    Blockly.Warning.prototype.setVisible.call(this, visible);
    return;
  }
  // Save the bubble stats before the visibility switch.
  if (visible) {
    this.computeIconLocation();
    var xy = this.getIconLocation();
    // Create the bubble.
    this.bubble_ = new AbbozzaBubble(
        /** @type {!Blockly.Workspace} */ (this.block_.workspace),
        null, this.block_.svgPath_, "",
        xy,
        this.width_, this.height_,
        this.shiftX_,this.shiftY_);        
    this.bubble_.registerResizeEvent(this.bubble_.resize_);
    this.bubble_.addSizeListener(this);
    this.updateColour();
    this.block_.render();
    // Restore the bubble stats after the visibility switch.
    this.bubble_.setText(this.text_);
    this.bubble_.setBubbleSize(this.width_,this.height_);
    this.bubble_.setShift(this.shiftX_,this.shiftY_);
  } else {
    // Get the current size and position
    this.shiftX_ = this.bubble_.relativeLeft_;
    this.shiftY_ = this.bubble_.relativeTop_;
    var size = this.bubble_.getBubbleSize();
    this.width_ = size.width;
    this.height_ = size.height;
    // Dispose of the bubble.
    this.bubble_.removeSizeListener(this);
    this.bubble_.dispose();
    this.bubble_ = null;
  }
};

/**
 * Bring the comment to the top of the stack when clicked on.
 * @param {!Event} e Mouse up event.
 * @private
 */
TaskHintIcon.prototype.textareaFocus_ = function(e) {
  this.bubble_.promote_();
  this.textarea_.focus();
};

/**
 * Get the dimensions of this comment's bubble.
 * @return {!Object} Object with width and height properties.
 */
TaskHintIcon.prototype.getBubbleSize = function() {
  if (this.isVisible()) {
    return this.bubble_.getBubbleSize();
  } else {
    return {width: this.width_, height: this.height_};
  }
};

/**
 * Size this comment's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
// TaskHintIcon.prototype.setBubbleSize = function(width, height) {
//   if (this.textarea_) {
//    this.bubble_.setBubbleSize(width, height);
//} else {
//  this.width_ = width;
//    this.height_ = height;
//  }
//};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 */
TaskHintIcon.prototype.getText = function() {
  return this.bubble_  ? this.bubble_.textarea_.innerHTML : this.text_;
};

/**
 * Set this comment's text.
 * @param {string} text Comment text.
 */
TaskHintIcon.prototype.setText = function(text) {
  if (this.buuble__) {
    this.bubble_.textarea_.innerHTML = text;
  } else {
    this.text_ = text;
  }
};

/**
 * Dispose of this comment.
 */
TaskHintIcon.prototype.dispose = function() {
  this.block_.comment = null;
  Blockly.Icon.prototype.dispose.call(this);
};


TaskHintIcon.prototype.setBubbleShift = function(shiftX, shiftY) {
  var vis = this.isVisible();
  this.setVisible(false);
  if (this.textarea_) {
    this.bubble_.setShift(shiftX,shiftY);
  } else {
   this.shiftX_ = shiftX;
   this.shiftY_ = shiftY;
  }
  this.setVisible(vis);
}

TaskHintIcon.prototype.setGeometry = function(shiftX, shiftY, width, height) {
  var vis = this.isVisible();
  this.setVisible(false);
  this.shiftX_ = shiftX;
  this.shiftY_ = shiftY;
  this.height_ = height;
  this.width_ = width;
  this.setVisible(vis);
}


TaskHintIcon.prototype.drawIcon_ = function(group) {
  Blockly.createSvgElement('rect',
      {'class': 'blocklyIconShape',
       'rx': '4', 'ry': '4',
       'height': '16', 'width': '16'},
       group);
  Blockly.createSvgElement('path',
     {'class': 'blocklyIconSymbol',
       'stroke' : 'white',
       'd': 'M 7 3 L 9 3 L 9 8 L 7 8 Z M 7 11 L 9 11 L 9 13 L 7 13 Z',
       'fill' : 'white'},
      group);
}


TaskHintIcon.prototype.addHint = function(hint) {
    for ( var i = 0 ; i < this.hints_.length ; i++) {
        if ( this.hints_[i] == hint ) return;
    }
    
    // hint was not found, add it
    this.hints_.push(hint);
}

TaskHintIcon.prototype.removeHint = function(hint) {
    for ( var i = 0 ; i < this.hints_.length ; i++) {
        if ( this.hints_[i] == hint ) {
            this.hints_[i] = this.hints_[this.hints_.length-1];
            this.hints_.pop();
            return;
        }
    }
}


TaskHintIcon.prototype.bubbleResized = function(bubble) {
  for (var i = 0; i < this.hints_.length; i++) {
      if ( this.hints_[i] && ( this.hints_[i].iconResized != "undefined") ) {
         this.shiftX_ = this.bubble_.relativeLeft_;
         this.shiftY_ = this.bubble_.relativeTop_;
         var size = this.bubble_.getBubbleSize();
         this.width_ = size.width;
         this.height_ = size.height;          
         this.hints_[i].iconResized(this);
      }
  }
}
