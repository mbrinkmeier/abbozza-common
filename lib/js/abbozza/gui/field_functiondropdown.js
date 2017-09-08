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
 * @fileoverview A dropdown menu with the currently defined operations as entries
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

'use strict';

goog.provide('FunctionDropdown');

goog.require('Blockly.Field');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


FunctionDropdown = function (block, changeHandler,opt_isr) {
    FunctionDropdown.superClass_.constructor.call(this, this.getMenu, changeHandler);
    this.EDITABLE = true;
    this.block = block;
    if ( !opt_isr ) {
        this.isr = false;
    } else {
        this.isr = opt_isr;
    }
};
goog.inherits(FunctionDropdown, Blockly.FieldDropdown);


FunctionDropdown.prototype.getMenu = function () {
    if (this.block != null) {
        var rootBlock = this.block.getRootBlock();
        if (rootBlock.symbols) {
            if (this.isr) {
                return rootBlock.symbols.getISRMenu();
            } else {
                return rootBlock.symbols.getFuncMenu();
            }
        } else {
            if (this.isr) {
                return rootBlock.workspace.symbols.getISRMenu();
            } else {
                return rootBlock.workspace.symbols.getFuncMenu();
            }
        }
    }
    return [["<name>", "<name>"]];
}