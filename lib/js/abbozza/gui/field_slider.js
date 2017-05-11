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
 * @fileoverview A simple slider field.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
'use strict';

goog.provide('Blockly.FieldSlider');

goog.require('Blockly.Field');
goog.require('goog.dom');
goog.require('goog.ui.Slider');
goog.require('goog.ui.Component');


Blockly.FieldSlider.activeSlider_ = null;
Blockly.FieldSlider.startMouseX_ = 0;
Blockly.FieldSlider.startMarkerX_ = 0;

/**
 * Class for a non-editable field.
 * @param {string} text The initial content of the field.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldSlider = function(value,min,max,step, opt_textfield , opt_changeHandler) {
  Blockly.FieldSlider.superClass_.constructor.call(this, "");
  // this.setChangeHandler(opt_changeHandler);
  this.sourceBlock_ = null;
  this.min_ = min;
  this.max_ = max;
  this.step_ = step;
  this.width_ = Math.ceil((max-min)/step);
  this.value_ = value;
  this.textfield_ = opt_textfield;
  this.texthandler_ = null;
  
  if ( this.textfield_ != null ) {
    this.texthandler_ = this.textfield_.changeHandler_;
    var thisSlider = this;
    
    this.textfield_.changeHandler_ = function(text) {
        thisSlider.setValue_(text)
        if (thisSlider.texthandler_) {
            return thisSlider.texthandler_(text)
        } else {
            return text;
        }
    }
  }
};
goog.inherits(Blockly.FieldSlider, Blockly.Field);

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.FieldSlider.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Field has already been initialized once.
    return;
  }
  this.sourceBlock_ = block;
  // Build the DOM.
 
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }    
    /*
    this.minTextElement_ = Blockly.createSvgElement('text',
             {'class' : 'blocklyText'}, this.fieldGroup_);             
    this.minTextElement_.appendChild(document.createTextNode(this.minText_));
    */

    // console.log(this.sourceBlock_.colourHue_);
    var fill = Blockly.makeColour(this.sourceBlock_.colourHue_);
    
    var sliderBoxPath = 'm 0 -12 l ' + this.width_ + ' 0 l 0 12 l -' + this.width_ +' 0 z'; 
    this.sliderBox_ = Blockly.createSvgElement('path',{'class' : 'blocklyPath', 'stroke-width' : 0 , 'fill' : fill , 'd' : sliderBoxPath}, this.fieldGroup_);
    var sliderLinePath = 'm 0 -5 l ' + this.width_ + ' 0 l 0 -1';
    this.sliderLine_ =  Blockly.createSvgElement('path',{'class' : 'blocklyPath' , 'stroke-width' : 1, 'stroke' : '#000000', 'd' : sliderLinePath}, this.fieldGroup_);
    var sliderLine2Path = 'm 0 -6 l 0 -1 l ' + this.width_ + ' 0';
    this.sliderLine2_ =  Blockly.createSvgElement('path',{'class' : 'blocklyPath' , 'stroke-width' : 1, 'stroke' : '#ffffff', 'd' : sliderLine2Path}, this.fieldGroup_);
    this.sliderMarker_ =  Blockly.createSvgElement('path',{'class' : 'blocklyPath' , 'stroke-width' : 2, 'fill' : fill,  'stroke' : '#ffffff', 'd' : 'm 0 0 l -5 -5 l 0 -7 l 10 0 l 0 7 z '}, this.fieldGroup_);
    this.sliderMarker1_ =  Blockly.createSvgElement('path',{'class' : 'blocklyPath' , 'stroke-width' : 2, 'fill' : fill,  'stroke' : '#000000', 'd' : 'm 0 0 l 5 -5 l 0 -7'}, this.fieldGroup_);
    this.setValue(42);

 
  // this.updateEditable();
  block.getSvgRoot().appendChild(this.fieldGroup_);
  Blockly.bindEvent_(this.sliderMarker_, 'mousedown', this, this.onMarkerMouseDown_);
  Blockly.bindEvent_(this.sliderBox_, 'mousedown', this, this.onBoxMouseDown_);
  Blockly.bindEvent_(this.sliderBox_, 'mouseup', null, Blockly.FieldSlider.onMarkerMouseUp_);
  Blockly.bindEvent_(document, 'mousemove', null, Blockly.FieldSlider.onMarkerMouseMove_);
  Blockly.bindEvent_(document, 'mouseover', null, Blockly.FieldSlider.onMouseOver_);
  // Force a render.
  // this.updateTextNode_();
};

Blockly.FieldSlider.prototype.getValue_ = function(e) {
    var x = e.clientX - this.sliderBox_.getBoundingClientRect().left;
    x = Math.round(x);
    x = this.min_ + x * this.step_;
    if ( x < this.min_ ) { x = this.min_ };
    if ( x > this.max_) { x = this.max_ };
    return x;
};

Blockly.FieldSlider.prototype.onBoxMouseDown_ = function(e) {
    var x = this.getValue_(e);
    if ( (x - this.value_ < 10) && ( this.value_ - x < 10 ) ) {
        Blockly.FieldSlider.activeSlider_ = this; 
        this.sliderMarker_.setAttribute('fill','#ffffff');
    }
    this.setValue(this.getValue_(e));
};


Blockly.FieldSlider.prototype.onMarkerMouseDown_ = function(e) {
  /*
  if (e.type == 'touchstart') {
    if (e.changedTouches.length != 1) {
      return;
    }
    Slider.touchToMouse_(e)
  }
  */
  Blockly.FieldSlider.activeSlider_ = this;
  Blockly.FieldSlider.startMouseX_ = this.getValue_(e);
  Blockly.FieldSlider.startMarkerX_ = 0;
  var transform = this.sliderMarker_.getAttribute('transform');
  if (transform) {
    var r = transform.match(/translate\(\s*([-\d.]+)/);
    if (r) {
      Blockly.FieldSlider.startMarkerX_ = Number(r[1]);
    }
  }
  this.sliderMarker_.setAttribute('fill','#ffffff');
  // Stop browser from attempting to drag the knob or
  // from scrolling/zooming the page.
  e.preventDefault();
};

Blockly.FieldSlider.onMarkerMouseUp_ = function(e) {
  var thisSlider = Blockly.FieldSlider.activeSlider_;
  if (!thisSlider) return;
  thisSlider.sliderMarker_.setAttribute('fill',Blockly.makeColour(thisSlider.sourceBlock_.colourHue_));
  Blockly.FieldSlider.activeSlider_ = null;
};

Blockly.FieldSlider.onMarkerMouseMove_ = function(e) {
  var thisSlider = Blockly.FieldSlider.activeSlider_;
  if (!thisSlider) {
    return;
  }
  /*
  if (e.type == 'touchmove') {
    if (e.changedTouches.length != 1) {
      return;
    }
    Slider.touchToMouse_(e)
  }
    */
  thisSlider.setValue(thisSlider.getValue_(e));
};


Blockly.FieldSlider.onMouseOver_ = function(e) {
  if (!Blockly.FieldSlider.activeSlider_) {
    return;
  }
  var node = e.target;
  // Find the root SVG object.
  do {
    if (node == Blockly.FieldSlider.activeSlider_.sourceBlock_.getSvgRoot()) {
      return;
    }
  } while (node = node.parentNode);
  Blockly.FieldSlider.onMarkerMouseUp_(e);
};


Blockly.FieldSlider.prototype.dispose = function() {
  if (this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_);
    this.mouseDownWrapper_ = null;
  }
  this.sourceBlock_ = null;
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  // this.textElement_ = null;
  this.borderRect_ = null;
  this.changeHandler_ = null;
};


Blockly.FieldSlider.prototype.setValue = function(value) {
    this.setValue_(value);
    if (this.textfield_ != null) {
        this.textfield_.setText(String(value));
    }
};

Blockly.FieldSlider.prototype.setValue_ = function(value) {
    this.value_ = value;
    var pos = Math.round((this.value_ - this.min_)/this.step_);
    this.sliderMarker_.setAttribute('transform','translate('+ pos +')');
    this.sliderMarker1_.setAttribute('transform','translate('+ pos +')');
};


Blockly.FieldSlider.prototype.render_ = function() {
    
  if (this.visible_ ) {
      var width = this.width_+5;
        if (this.sliderDiv_) {
          this.sliderDiv_.setAttribute('width',
              width + Blockly.BlockSvg.SEP_SPACE_X);
        }
    } else {
        var width = 0;
    }
    this.size_.width = width;
};


/*
Blockly.FieldSlider.prototype.showEditor_ = function() {
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL,
  Blockly.FieldSlider.widgetDispose_);

  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var xy = this.getAbsoluteXY_();
  var borderBBox = this.borderRect_.getBBox();
  var div = Blockly.WidgetDiv.DIV;
  div.style.width ="200px";
  div.style.height ="20px";
  div.style.border="1pt black solid";
  var picker = new goog.ui.Slider();
  picker.setMinimum(this.min_);
  picker.setMaximum(this.max_);
  picker.setStep(1);
  picker.setValue(this.value_)
  picker.decorate(div);
  var pickerSize = goog.style.getSize(div);

  // Flip the picker vertically if off the bottom.
  if (xy.y + pickerSize.height + borderBBox.height >=
      windowSize.height + scrollOffset.y) {
    xy.y -= pickerSize.height - 1;
  } else {
    xy.y += borderBBox.height - 1;
  }
  if (this.sourceBlock_.RTL) {
    xy.x += borderBBox.width;
    xy.x -= pickerSize.width;
    // Don't go offscreen left.
    if (xy.x < scrollOffset.x) {
      xy.x = scrollOffset.x;
    }
  } else {
    // Don't go offscreen right.
    if (xy.x > windowSize.width + scrollOffset.x - pickerSize.width) {
      xy.x = windowSize.width + scrollOffset.x - pickerSize.width;
    }
  }
  Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset,
                             this.sourceBlock_.RTL);
  
  // Configure event handler.
  picker.addEventListener(goog.ui.Component.EventType.CHANGE, function() {
    this.value_ = picker.getValue();
    console.log("picker : " + this.value_);
  });

 };
*/