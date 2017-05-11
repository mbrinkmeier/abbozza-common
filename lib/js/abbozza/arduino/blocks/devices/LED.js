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
 * @fileoverview Blocks for the handling of LEDs
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
Abbozza.DeviceLed = {
    devtype: DEV_TYPE_LED,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        // this.appendValueInput("PIN")
        this.appendDummyInput()
                .appendField(_("dev.DEVICE"));
        this.appendDummyInput()
                .appendField(_("dev.LED"))
                .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME")
                .appendField(_("dev.AT"))
                .appendField(new PinDropdown(PinDropdown.DIGITAL), "PIN");
        //.appendField(new Blockly.FieldDropdown( function() { return Abbozza.board.getPinMenu(); }  ), "PIN");
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
        // var pin = generator.valueToCode(this,"PIN");
        var name = generator.fieldToCode(this,"NAME");
        var pin = generator.fieldToCode(this,"PIN");
        return "pinMode(" + pin + ",OUTPUT);";
    },
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }

};


Abbozza.DeviceLedOn = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput()
                .appendField(_("dev.LED"))
                .appendField(new DeviceDropdown(this, DEV_TYPE_LED, Abbozza.blockDevices), "NAME")
                // .appendField(new FunctionDropdown(this,null), "NAME")
                .appendField(new Blockly.FieldDropdown([[_("dev.ON"), "HIGH"], [_("dev.OFF"), "LOW"]]), "STATE");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    setName: function (name) {
        this.name = name;
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this,"NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var state = this.getFieldValue("STATE");
        var pin = generator.fieldToCode(device,"PIN");
        // var pin = generator.valueToCode(device,"PIN");
        return "digitalWrite(" + pin + "," + state + ");";
    }
};

Abbozza.DeviceDimmableLed = {
    devtype: DEV_TYPE_LED_DIM,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        // this.appendValueInput("PIN")
        this.appendDummyInput()
                .appendField(_("dev.DEVICE"));
        this.appendDummyInput()
                .appendField(_("dev.DIMLED"))
                .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME")
                .appendField(_("dev.AT"))
                .appendField(new PinDropdown(PinDropdown.PWM), "PIN");
        //.appendField(new Blockly.FieldDropdown( function() { return Abbozza.board.getPinMenu(); }  ), "PIN");
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
        // var pin = generator.valueToCode(this,"PIN");
        var name = generator.fieldToCode(this,"NAME");
        var pin = generator.fieldToCode(this,"PIN");
        return "pinMode(" + pin + ",OUTPUT);";
    },
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }
};

Abbozza.DeviceDimmableLedOn = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendValueInput("VALUE")
                .appendField(__("dev.SETDIMLED",0))
                .appendField(new DeviceDropdown(this, DEV_TYPE_LED_DIM, Abbozza.blockDevices), "NAME")
                // .appendField(new FunctionDropdown(this,null), "NAME")
                .appendField(__("dev.SETDIMLED",1))
                .setCheck("NUMBER");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    setName: function (name) {
        this.name = name;
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this,"NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var value = generator.valueToCode(this,"VALUE");
        var pin = generator.fieldToCode(device,"PIN");
        // var pin = generator.valueToCode(device,"PIN");
        return "analogWrite(" + pin + "," + value + ");";
    }
};

Blockly.Blocks['dev_led'] = Abbozza.DeviceLed;
Blockly.Blocks['dev_led_on'] = Abbozza.DeviceLedOn;
Blockly.Blocks['dev_led_dim'] = Abbozza.DeviceDimmableLed;
Blockly.Blocks['dev_led_dim_on'] = Abbozza.DeviceDimmableLedOn;

