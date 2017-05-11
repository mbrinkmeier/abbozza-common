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
 * @fileoverview Blocks for the handling of infrared distance sensors
 * 
 * Implemented types:
 * - Sharp GP2Y0A21
 * - Generic
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Abbozza.DeviceIRDist = {
    devtype: DEV_TYPE_IRDIST,
    myType: "GP2Y0A21",
    myA: 67870,
    myB: -3,
    myC: -40,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        // this.appendValueInput("PIN")
        this.appendDummyInput()
                .appendField(_("dev.DEVICE"));
        this.appendDummyInput()
                .appendField(_("dev.IRDIST"))
                .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME")
                .appendField(_("dev.AT"))
                .appendField(new PinDropdown(PinDropdown.ANALOG), "PIN");
        // .appendField(new Blockly.FieldDropdown( function() { return Abbozza.board.getPWMPinMenu(); }  ), "PIN");
        // .setCheck("NUMBER");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(true, "DEVICE");
        this.setNextStatement(true, "DEVICE");
        this.setTooltip('');
        this.setMutator(new Blockly.Mutator([]));
        Abbozza.addDisposeHandler(this);
    },
    getName: function () {
        return this.getFieldValue("NAME");
    },
    generateCode: function (generator) {
        var name = generator.fieldToCode(this,"NAME");
        var pin = generator.fieldToCode(this, "PIN");
        return "pinMode(" + pin + ",INPUT);";
    },
    compose: function (topBlock) {
        this.myType = topBlock.getFieldValue("TYPE");
        this.myA = topBlock.getFieldValue("A");
        this.myB = topBlock.getFieldValue("B");
        this.myC = topBlock.getFieldValue("C");
    },
    decompose: function (workspace) {
        var topBlock = workspace.newBlock("dev_ir_read_formula");
        topBlock.setValues(this.myType, this.myA, this.myB, this.myC);
        topBlock.initSvg();
        return topBlock;
    },
    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('type', this.myType);
        container.setAttribute('a', this.myA);
        container.setAttribute('b', this.myB);
        container.setAttribute('c', this.myC);
        return container;        
    },
    domToMutation: function(xmlElement) {
       this.myA = xmlElement.getAttribute('a');
       this.myB = xmlElement.getAttribute('b');
       this.myC = xmlElement.getAttribute('c');
       this.myType = xmlElement.getAttribute('type');
    },
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }
};

Blockly.Blocks['dev_ir_dist'] = Abbozza.DeviceIRDist;


Abbozza.DeviceIRRead = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.NUMBER"));
        this.appendDummyInput("PIN")
                .appendField(_("dev.VALUEOF"))
                .appendField(_("dev.IRDIST"))
                .appendField(new DeviceDropdown(this, DEV_TYPE_IRDIST), "NAME");
        this.setInputsInline(false);
        this.setOutput(true, "NUMBER");
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this, "NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
            return;
        }

        var pin = generator.fieldToCode(device, "PIN");
        return "analogRead(" + pin + ")";
    }

}
Blockly.Blocks['dev_ir_read'] = Abbozza.DeviceIRRead;


Abbozza.DeviceIRReadDist = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.NUMBER"));
        this.appendDummyInput("PIN")
                .appendField(__("dev.DISTANCE", 0))
                .appendField(new DeviceDropdown(this, DEV_TYPE_IRDIST), "NAME")
                .appendField(__("dev.DISTANCE", 1))
                .appendField(new Blockly.FieldDropdown([["mm", "MM"], ["cm", "CM"]]), "UNIT");
        this.setInputsInline(false);
        this.setOutput(true, "NUMBER");
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var device = Abbozza.blockDevices.getDevice(generator.fieldToCode(this, "NAME"));

        if (device == null) {
            ErrorMgr.addError(this, "UNKNOWN_DEVICE");
        }

        var name = "_dev_" + device.getName();
        var pin = generator.fieldToCode(device, "PIN");
        var value = "analogRead(" + pin + ")";
        var unit = generator.fieldToCode(this, "UNIT");
        var code = "(" + device.myA + ") / (" + value + "-(" + device.myB + ")) +(" + device.myC + ")";
        if (unit == "CM") {
            code = "(" + code + ")/10";
        }
        return code;
    }

}
Blockly.Blocks['dev_ir_read_dist'] = Abbozza.DeviceIRReadDist;


Abbozza.DeviceIRReadFormula = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("color.DEVICE"));
        var thisBlock = this;
        this.appendDummyInput()
                .appendField(__("dev.TYPE", 0))
                .appendField(new Blockly.FieldDropdown([["Sharp GP2Y0A21", "GP2Y0A21"], ["custom", "CUSTOM"]], function (type) {
                    console.log(type);
                    switch (type) {
                        case "GP2Y0A21":
                            thisBlock.setValuesByType("GP2Y0A21");
                            break;
                    }
                }), "TYPE");
        this.appendDummyInput()
                .appendField(__("dev.FORMULA", 0))
                .appendField(new Blockly.FieldTextInput("0"), "A")
                .appendField(__("dev.FORMULA", 1))
                .appendField(new Blockly.FieldTextInput("0"), "B")
                .appendField(__("dev.FORMULA", 2))
                .appendField(new Blockly.FieldTextInput("0"), "C");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    },
    setValues: function (type, a, b, c) {
        this.getField("TYPE").setValue(type);
        this.getField("A").setText(new String(a));
        this.getField("B").setText(new String(b));
        this.getField("C").setText(new String(c));
    },
    setValuesByType: function (type) {
        this.getField("TYPE").setValue(type);
        switch (type) {
            case "GP2Y0A21":
                console.log("Hier");
                this.setValues("GP2Y0A21", 67870, -3, -40);
                break;
            default:
                this.setValues("custom", 1, 0, 0);
        }
    }

}
Blockly.Blocks['dev_ir_read_formula'] = Abbozza.DeviceIRReadFormula;
