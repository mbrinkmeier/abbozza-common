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
Abbozza.DeviceRGBLed = {
    devtype: DEV_TYPE_RGB_LED,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        // this.appendValueInput("PIN")
        // this.appendDummyInput()
        //        .appendField(_("dev.DEVICE"));
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/devices/output32.png",16,16))
            .appendField(_("dev.RGBLED"))
            .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(_("dev.REDPIN"))
            .appendField(new PinDropdown(PinDropdown.PWM), "REDPIN");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(_("dev.GREENPIN"))
            .appendField(new PinDropdown(PinDropdown.PWM), "GREENPIN");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(_("dev.BLUEPIN"))
            .appendField(new PinDropdown(PinDropdown.PWM), "BLUEPIN");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldDropdown([[_("dev.COMMON_CATHODE"),"COMMON_CATHODE"],[_("dev.COMMON_ANODE"),"COMMON_ANODE"]]), "COMMON");
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
        var redpin = generator.fieldToCode(this,"REDPIN");
        var greenpin = generator.fieldToCode(this,"GREENPIN");
        var bluepin = generator.fieldToCode(this,"BLUEPIN");
        generator.addSetupCode("pinMode(" + redpin + ",OUTPUT);\npinMode(" + greenpin + ",OUTPUT);\npinMode(" + bluepin + ",OUTPUT);");
        // return "pinMode(" + redpin + ",OUTPUT);\npinMode(" + greenpin + ",OUTPUT);\npinMode(" + bluepin + ",OUTPUT);";
        return "";
    },
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }

};


Abbozza.DeviceRGBLedSetColor = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput()
            .appendField(__("dev.SETRGBLED",0))
            .appendField(new DeviceDropdown(this, DEV_TYPE_RGB_LED, Abbozza.blockDevices), "NAME")
            .appendField(__("dev.SETRGBLED",1));        
        this.appendValueInput("RED")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(_("dev.RED"))
            .setCheck("NUMBER");
        this.appendValueInput("GREEN")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(_("dev.GREEN"))
            .setCheck("NUMBER");
        this.appendValueInput("BLUE")
            .setAlign(Blockly.ALIGN_RIGHT)       
            .appendField(_("dev.BLUE"))
            .setCheck("NUMBER");
        this.setInputsInline(false);
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
        var common = generator.fieldToCode(device,"COMMON");
        
        var red = generator.valueToCode(this, "RED");
        var green = generator.valueToCode(this, "GREEN");
        var blue = generator.valueToCode(this, "BLUE");
        
        // Invert the value if the led uses a common anode
        if ( common == "COMMON_ANODE") {
            red = 255 - red;
            green = 255 - green;
            blue = 255-blue;
        }
        var redpin = generator.fieldToCode(device,"REDPIN");
        var greenpin = generator.fieldToCode(device,"GREENPIN");
        var bluepin = generator.fieldToCode(device,"BLUEPIN");

        var code = "";
        code = "analogWrite(" + redpin + "," + red +");\n";
        code = code + "analogWrite(" + greenpin + "," + green +");\n";
        code = code + "analogWrite(" + bluepin + "," + blue +");";
        
        return code;
    },

};

Abbozza.DeviceRGBLedSetColor2 = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.BOOLEAN"));
        this.appendDummyInput()
            .appendField(__("dev.SETRGBLED",0))
            .appendField(new DeviceDropdown(this, DEV_TYPE_RGB_LED, Abbozza.blockDevices), "NAME")
            .appendField(__("dev.SETRGBLED",1))
            .appendField(new Blockly.FieldColour("#000000"), "COLOR");        
        this.setInputsInline(false);
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
        var common = generator.fieldToCode(device,"COMMON");
        var color = generator.fieldToCode(this,"COLOR");
        var redpin = generator.fieldToCode(device,"REDPIN");
        var greenpin = generator.fieldToCode(device,"GREENPIN");
        var bluepin = generator.fieldToCode(device,"BLUEPIN");
        
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        var red = parseInt(result[1],16);
        var green = parseInt(result[2],16);
        var blue = parseInt(result[3],16);

        // Invert the value if the led uses a common anode
        if ( common == "COMMON_ANODE") {
            red = 255 - red;
            green = 255 - green;
            blue = 255-blue;
        }

        var code = "";
        code = "analogWrite(" + redpin + "," + red +");\n";
        code = code + "analogWrite(" + greenpin + "," + green +");\n";
        code = code + "analogWrite(" + bluepin + "," + blue +");";
        
        return code;
    },

};
Blockly.Blocks['dev_rgb_led'] = Abbozza.DeviceRGBLed;
Blockly.Blocks['dev_rgb_led_set_color'] = Abbozza.DeviceRGBLedSetColor;
Blockly.Blocks['dev_rgb_led_set_color2'] = Abbozza.DeviceRGBLedSetColor2;

