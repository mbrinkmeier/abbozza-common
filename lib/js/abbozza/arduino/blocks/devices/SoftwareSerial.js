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
 * @fileoverview Blocks for the handling of servo motors
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Abbozza.DeviceSerial = {
    devtype: DEV_TYPE_SERIAL,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        // this.appendValueInput("PIN")
        this.appendDummyInput()
                .appendField(_("dev.DEVICE"));
        this.appendDummyInput()
                .appendField(__("dev.SERIAL",0))
                .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SERIAL",1))
                .appendField(new PinDropdown(PinDropdown.DIGITAL), "RX");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("dev.SERIAL",2))
                .appendField(new PinDropdown(PinDropdown.DIGITAL), "TX");
        // .appendField(new Blockly.FieldDropdown( function() { return Abbozza.board.getPWMPinMenu(); }  ), "PIN");
        // .setCheck("NUMBER");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(true, "DEVICE");
        this.setNextStatement(true, "DEVICE");
        this.setTooltip('');
        Abbozza.addDisposeHandler(this);
    },
    
    getName: function () {
        return this.getFieldValue("NAME");
    },
    
    generateCode: function (generator) {
        generator.addLibrary("SoftwareSerial.h");
        var rx = generator.fieldToCode(this, "RX");
        var tx = generator.fieldToCode(this, "TX");
        generator.addPreSetup("SoftwareSerial _dev_" + this.getName() + "(" + rx + "," + tx + ");");
        generator.addSetupCode("_dev_"+this.getName()+".begin(4800);");
        return "";
    },
    
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }


};

Blockly.Blocks['dev_serial'] = Abbozza.DeviceSerial;


Abbozza.DeviceSerialWrite = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.DEVICE"));
                
        this.appendValueInput("VALUE")
                .appendField(__("dev.WRITEBYTE",0))        
                .setCheck("NUMBER");
        this.appendDummyInput("VALUE")
                .appendField(__("dev.WRITEBYTE",1))
                .appendField(new DeviceDropdown(this, DEV_TYPE_SERIAL), "NAME");
        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    /*  setName : function(name) {
     this.name = name;
     },*/


    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this, "NAME"));
        var value = generator.valueToCode(this, "VALUE");

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var name = "_dev_" + device.getName();
        // generator.valueToCode(device,"PIN");
        return name + ".write(byte(" + value + "));";
    }

};

Blockly.Blocks['dev_serial_write'] = Abbozza.DeviceSerialWrite;


Abbozza.DeviceSerialRead = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.DEVICE"));
        this.appendDummyInput("PIN")
                .appendField(_("dev.READFROMLINE"))
                .appendField(new DeviceDropdown(this, DEV_TYPE_SERIAL), "NAME");
        this.setInputsInline(false);
        this.setOutput(true, "NUMBER");
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    },
    /*  setName : function(name) {
     this.name = name;
     },*/


    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this, "NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
        }

        var name = "_dev_" + device.getName();
        return name + ".read()";
    }

};

Blockly.Blocks['dev_serial_read'] = Abbozza.DeviceSerialRead;


Abbozza.DeviceSerialAvailable = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.DEVICE"));
        this.appendDummyInput("PIN")
                .appendField(__("dev.LINEAVAILABLE",0))
                .appendField(new DeviceDropdown(this, DEV_TYPE_SERIAL), "NAME")
                .appendField(__("dev.LINEAVAILABLE",1));
        this.setInputsInline(false);
        this.setOutput(true, "BOOLEAN");
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    },
    /*  setName : function(name) {
     this.name = name;
     },*/


    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this, "NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
        }

        var name = "_dev_" + device.getName();
        return name + ".available()";
    }

};

Blockly.Blocks['dev_serial_available'] = Abbozza.DeviceSerialAvailable;



Abbozza.DeviceSerialListening  = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.DEVICE"));
        this.appendDummyInput("PIN")
                .appendField(__("dev.LINELISTENING",0))
                .appendField(new DeviceDropdown(this, DEV_TYPE_SERIAL), "NAME")
                .appendField(__("dev.LINELISTENING",1));
        this.setInputsInline(false);
        this.setOutput(true, "BOOLEAN");
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    },
    /*  setName : function(name) {
     this.name = name;
     },*/


    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this, "NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
        }

        var name = "_dev_" + device.getName();
        return name + ".isListening()";
    }

};

Blockly.Blocks['dev_serial_listening'] = Abbozza.DeviceSerialListening;


Abbozza.DeviceSerialListen = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.DEVICE"));
        this.appendDummyInput("PIN")
                .appendField(_("dev.LINELISTEN"))
                .appendField(new DeviceDropdown(this, DEV_TYPE_SERIAL), "NAME");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    },
    /*  setName : function(name) {
     this.name = name;
     },*/


    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this, "NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
        }

        var name = "_dev_" + device.getName();
        return name + ".listen()";
    }

};

Blockly.Blocks['dev_serial_listen'] = Abbozza.DeviceSerialListen;
