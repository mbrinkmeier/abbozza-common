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
 * @fileoverview A dropdownmenu field fpr the choice of a variable name.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

'use strict';

goog.provide('VariableDropdown');
goog.provide('VariableTypedDropdown');

goog.require('Blockly.Field');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


VariableDropdown = function(block, changeHandler) {
	VariableDropdown.superClass_.constructor.call(this, this.getMenu, changeHandler);
	this.EDITABLE = true;
	// console.log(block);
	this.block = block;
        this.setValue("<name>");
        this.setText("<name>");
};
goog.inherits(VariableDropdown, Blockly.FieldDropdown);


VariableDropdown.prototype.getMenu = function() {
	if (this.block != null) {
		var rootBlock = this.block.getRootBlock();
		if ( rootBlock.symbols ) {
			if (rootBlock.symbols)
                            return rootBlock.symbols.getVarMenu("");
                        else
                            return null;
		} else {
			if (rootBlock.workspace && rootBlock.workspace.symbols)
                            return rootBlock.workspace.symbols.getVarMenu("");
                        else
                            return null;
		}
	} 
        return [["<name>","<name>"]];
}

/*
VariableDropdown.prototype.setValue = function(newValue) {
    console.log("setValue:");
    console.log(newValue);
    
  if ((newValue === null) || (newValue === this.value_)) {
    return;  // No change if null.
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.Change(
          this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  this.value_ = newValue;
  // Look up and display the human-readable text.
  var options = this.getOptions_();
  if (options) {
    for (var i = 0; i < options.length; i++) {
     // Options are tuples of human-readable text and language-neutral values.
    if (options[i][1] == newValue) {
          this.setText(options[i][0]);
        return;
        }
    }
  }
  // Value not found.  Add it, maybe it will become valid once set
  // (like variable names).
  this.setText(newValue);

    // VariableDropdown.superClass_.setValue.call(this,newValue);
    // // if (block) this.block.getSymbol();
}
*/

VariableTypedDropdown = function(block, type, changeHandler) {
	VariableTypedDropdown.superClass_.constructor.call(this, this.getMenu , changeHandler);
	this.EDITABLE = true;
	// console.log(block);
	this.block = block;
	this.type = type;
};
goog.inherits(VariableTypedDropdown, Blockly.FieldDropdown);

VariableTypedDropdown.prototype.getMenu = function() {
	if (this.block != null) {
		// console.log("block");
		// console.log(this.block);
		var rootBlock = this.block.getRootBlock();
		if ( rootBlock.symbols ) {
			return rootBlock.symbols.getVarTypedMenu(this.type,"");
		} else {
			return rootBlock.workspace.symbols.getVarTypedMenu(this.type,"");
		}
	} return [["<name>","<name>"]];
}
