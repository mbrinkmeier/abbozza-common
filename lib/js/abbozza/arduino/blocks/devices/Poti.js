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
 * @fileoverview Blocks for the handling of potentiometers
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Abbozza.DevicePoti = {
	
  devtype : DEV_TYPE_POTI,
  
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.DEVICES"));
    // this.appendValueInput("PIN")
    this.appendDummyInput()
                .appendField(_("dev.DEVICE"));
    this.appendDummyInput()
    	.appendField(_("dev.POTI"))
    	.appendField(new FieldDevNameInput("<default>",Abbozza.blockDevices,this), "NAME")
    	.appendField(_("dev.AT"))
        .appendField(new PinDropdown(PinDropdown.ANALOG), "PIN");
    	// .appendField(new Blockly.FieldDropdown( function() { return Abbozza.board.getAnalogPinMenu(); }  ), "PIN");
    	// .setCheck("NUMBER");
    this.setInputsInline(false);
    this.setOutput(false);
	 this.setPreviousStatement(true, "DEVICE");
	 this.setNextStatement(true, "DEVICE");
    this.setTooltip('');
    Abbozza.addDisposeHandler(this);
  },
 
  getName : function() {
  	return this.getFieldValue("NAME");
  },
  
  
  generateCode: function(generator) {
  	// var pin = generator.valueToCode(this,"PIN");
        var name = generator.fieldToCode(this,"NAME");
        var pin = generator.fieldToCode(this,"PIN");
        return "pinMode(" + pin + ",INPUT);";
  },
  onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }
  
};


Abbozza.DevicePotiState = {
	
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("color.NUMBER"));
    this.appendDummyInput("PIN")
    	.appendField(_("dev.VALUEOF"))
    	.appendField(_("dev.POTI"))
    	.appendField(new DeviceDropdown(this,DEV_TYPE_POTI), "NAME");
    this.setInputsInline(false);
    this.setOutput(true,"NUMBER");
	 this.setPreviousStatement(false);
	 this.setNextStatement(false);
    this.setTooltip('');
  },
 
  setName : function(name) {
  	this.name = name;
  },
  
  generateCode: function(generator) {
  	var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this,"NAME"));
  	
 	if ( device == null ) {
            ErrorMgr.addError(this,_("err.UNKNOWN_DEVICE"));
            return;
  	}

	var pin = generator.fieldToCode(device,"PIN");
  	// var pin = generator.valueToCode(device,"PIN");
  	return "analogRead("+pin +")";
  }
  
};

Blockly.Blocks['dev_poti'] = Abbozza.DevicePoti;
Blockly.Blocks['dev_poti_state'] = Abbozza.DevicePotiState;
