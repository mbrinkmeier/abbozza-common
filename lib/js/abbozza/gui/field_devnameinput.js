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
 * @fileoverview A field for the choice of a device name.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
'use strict';

goog.provide('FieldDevNameInput');

goog.require('Blockly.Field');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


FieldDevNameInput = function(text, deviceblock,device) {
	FieldDevNameInput.superClass_.constructor.call(this, "<name>");
	this.editing = false;
	this.deviceblock = deviceblock;
	this.oldText = "<name>";
	this.device = device;
};
goog.inherits(FieldDevNameInput, Blockly.FieldTextInput);


FieldDevNameInput.prototype.showEditor_ = function(opt_quietInput) {
	this.oldText = this.getText();
	this.editing = true;
	Blockly.FieldTextInput.prototype.showEditor_.call(this,opt_quietInput);
};


FieldDevNameInput.prototype.widgetDispose_ = function() {
 var thisField = this;

 return function() {
 	// mark editing as stopped
    thisField.editing = false;
    // fetch old and new text
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    var text = htmlInput.value;
    var oldText = thisField.oldText;
    var block = thisField.sourceBlock_;
    
    ErrorMgr.clearBlock(block);
   	if (!thisField.checkValue(text)) { 
		ErrorMgr.addError(block,_("err.DEVICE"));
	} else {
		thisField.setText(text);
    }	    
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


FieldDevNameInput.prototype.checkValue = function(text) {
	if ( this.deviceblock ) {
		var devices = this.deviceblock.getDevices();
		var  i = 0;
		while (i<devices.length) {
			if ( (devices[i] != this.device) && (devices[i].getName() == text)) {
				return false;
			}
			i++;
		}
	}	
	return true;
};
