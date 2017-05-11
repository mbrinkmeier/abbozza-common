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
 * @fileoverview A dropdown menu containing all registered devices
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
'use strict';

goog.provide('DeviceDropdown');


goog.require('Blockly.Field');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');


DeviceDropdown = function(block, devtype) {
	DeviceDropdown.superClass_.constructor.call(this, this.getMenu , null);
	this.EDITABLE = true;
	// console.log(block);
	this.block = block;
	this.devtype = devtype;
};
goog.inherits(DeviceDropdown, Blockly.FieldDropdown);


DeviceDropdown.prototype.getMenu = function() {
	if ( Abbozza.blockDevices == null) return [["<name>", "<name>"]];
        var menu = Abbozza.blockDevices.getDevicesByType(this.devtype);
	return menu;
}
