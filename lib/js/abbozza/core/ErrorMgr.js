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
 * @fileoverview A handler for generator errors
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 * 
 * NOT SYSTEM SPECIFIC
 */

/**
 * This singleton object mamanges errors on blocks.
 */
var ErrorMgr = {
	
	errors : []
	
};


// Set Icon for warnings
Blockly.Warning.prototype.png_ = "img/error.png";
	

ErrorMgr.addError = function(block, text) {
	// var error = new ErrorIcon(block,text);
	// error.setText(text);
	// this.errors.push([block,error]);
	block.setWarningText(text);
	block.warning.setVisible(true);
	this.errors.push([block,text]);
};


ErrorMgr.clearErrors = function() {
	for (var i = this.errors.length-1; i>= 0; i-- ) {	
		// this.errors[i][1].setVisible(false);
		// this.errors[i][1].dispose();
		this.errors[i][0].setWarningText(null);
		this.errors.pop();
	}
};


ErrorMgr.clearBlock = function(block) {
	for (var i = 0; i < this.errors.length; i++ ) {	
		if ( this.errors[i][0] == block ) {
			// this.errors[i][1].setVisible(false);
			// this.errors[i][1].dispose();
			this.errors[i] = this.errors[this.errors.length-1];
			i--;
			this.errors.pop();
		}
		block.setWarningText(null);
	}
};


ErrorMgr.hasErrors = function() {
	return (this.errors.length > 0);
};


ErrorMgr.hasBlockErrors = function(block) {
	for (var i = 0; i < this.errors.length; i++ ) {	
		if ( this.errors[i][0] == block ) {
			return true;
		}
	}
	return false;
};
