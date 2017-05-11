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
 * @fileoverview An input Field for the symbol names.
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

'use strict';

goog.provide('FieldNameInput');

goog.require('Blockly.Field');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


FieldNameInput = function(text, symbols, opt_symbolType) {
	FieldNameInput.superClass_.constructor.call(this, text, this.checkValue);
	this.editing = false;
	this.symbols = symbols;
	this.oldText = text;
	if ( opt_symbolType )
		this.symbolType = opt_symbolType;
	else
		this.symbolType = SymbolDB.VAR_SYMBOL;
};
goog.inherits(FieldNameInput, Blockly.FieldTextInput);


FieldNameInput.prototype.showEditor_ = function(opt_quietInput) {
	this.oldText = this.getText();
	this.editing = true;
	Blockly.FieldTextInput.prototype.showEditor_.call(this,opt_quietInput);
};

/* FieldNameInput.prototype.dispose = function() {
    console.log("disposed");
    console.log(this.getText());
    Blockly.FieldTextInput.prototype.dispose.call(this);    
    console.log(this.getText());
} */

FieldNameInput.prototype.widgetDispose_ = function() {
 var thisField = this;
 return function() {
 	// mark editing as stopped
    thisField.editing = false;
    // fetch old and new text
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    var text = htmlInput.value;
    var oldText = thisField.oldText;
    var block = thisField.sourceBlock_;
    
    if ( oldText != text ) {
    	if ( thisField.symbols ) {
	    	thisField.symbols.delete(oldText);
                text = thisField.checkValue(text);
	    	thisField.setText(text);
	    	
	    	switch ( thisField.symbolType ) {
	    		case thisField.symbols.VAR_SYMBOL:
	    			// do nothing
	    			break;
	    		case thisField.symbols.PAR_SYMBOL:
	    			// do nothing
	    			break;
	    		case thisField.symbols.FUN_SYMBOL:
	    			// add the 
	    			var type = block.getFieldValue("TYPE");
	    			// Abbozza.log("Adding function " + type + " " + text + "()");
	    			thisField.symbols.addFunction(text,type);
	    			break;
	    	}
	    }
    } else {
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


FieldNameInput.prototype.checkValue = function(text) {
    // Do nothing
    return text;
    
    /*
    this.editing=false;
    text = Validator.nameValidator(text);
    if ( this.symbols ) {
        text = this.symbols.getLegalName(text);
    } else {
        text = Abbozza.globalSymbols.getLegalName(text);
    }
    // this.setText(text);
    return text;
    */
};
