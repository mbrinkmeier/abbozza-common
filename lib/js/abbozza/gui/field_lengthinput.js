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
 * @fileoverview A field for the input of an array length. It checks the value if
 * its value is between 0 and max-1.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

'use strict';

goog.provide('FieldLengthInput');

goog.require('Blockly.Field');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


FieldLengthInput = function(text, max ) {
	FieldNameInput.superClass_.constructor.call(this, text);
	this.editing = false;
	if ( max ) {
		this.max = max;
	} else {
		max = -1;
	}
};
goog.inherits(FieldLengthInput, Blockly.FieldTextInput);


FieldLengthInput.prototype.showEditor_ = function(opt_quietInput) {
	this.editing = true;
	Blockly.FieldTextInput.prototype.showEditor_.call(this,opt_quietInput);
};


FieldLengthInput.prototype.widgetDispose_ = function() {
 var thisField = this;
  return function() {
    thisField.editing = false;
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    // Save the edit (if it validates).
    var text = htmlInput.value;
    text = thisField.checkValue(text);
    /*
    if (thisField.sourceBlock_ && thisField.changeHandler_) {
      text = thisField.changeHandler_(text);
      if (text === null) {
        // Invalid edit.
        text = htmlInput.defaultValue;
      }
    }*/
    thisField.setText(text);
    thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
    Blockly.unbindEvent_(htmlInput.onKeyDownWrapper_);
    Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
    Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
    Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
    Blockly.FieldTextInput.htmlInput_ = null;
    // Delete the width property.
    Blockly.WidgetDiv.DIV.style.width = 'auto';
  }
};


FieldLengthInput.prototype.checkValue = function(text) {
	return Validator.lengthValidator(text, this.max);
};
