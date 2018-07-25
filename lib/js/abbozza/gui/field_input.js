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
 * @fileoverview An adapted text Input field, that validates the input
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

'use strict';

goog.provide('MyFieldTextInput');

goog.require('Blockly.Field');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


MyFieldTextInput = function(text, opt_newValueHandler , opt_changeHandler) {
	  MyFieldTextInput.superClass_.constructor.call(this, text, opt_changeHandler);
	  this.newValueHandler_ = opt_newValueHandler;
	  this.editing = false;
};
goog.inherits(MyFieldTextInput, Blockly.FieldTextInput);

MyFieldTextInput.prototype.onHtmlInputChange_ = function(e) {
	  var htmlInput = Blockly.FieldTextInput.htmlInput_;
	  var escKey = 27;
	  if (e.keyCode != escKey) {
		  this.editing = true;
	    // Update source block.
	    var text = htmlInput.value;
	    if (text != htmlInput.oldValue_) {
	      htmlInput.oldValue_ = text;
	      this.setText(text);
	      this.validate_();
	    } else if (goog.userAgent.WEBKIT) {
	      // Cursor key.  Render the source block to show the caret moving.
	      // Chrome only (version 26, OS X).
	      this.sourceBlock_.render();
	    }
	  }
	};

MyFieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
	  var htmlInput = Blockly.FieldTextInput.htmlInput_;
	  var enterKey = 13, escKey = 27;
	  if (e.keyCode == enterKey) {
		if (this.newValueHandler_) {
			var text = this.newValueHandler_(htmlInput.value);
			htmlInput.value = text;
		}
	    Blockly.WidgetDiv.hide();
	    this.editing = false;
	  } else if (e.keyCode == escKey) {
	    this.setText(htmlInput.defaultValue);
	    Blockly.WidgetDiv.hide();
	    this.editing = false;
	  }
	};
