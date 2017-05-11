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
 * @fileoverview Blocks for the handling of the LCD (unused so far)
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
Abbozza.DeviceLCD = {
    devtype: DEV_TYPE_LCD,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        // this.appendValueInput("PIN")
        this.appendDummyInput()
                .appendField(_("dev.DEVICE"));
        this.appendDummyInput()
                .appendField(__("dev.LCD", 0))
                .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME");
        this.appendDummyInput()
                .appendField(__("dev.LCD", 1))
                .appendField(new Blockly.FieldTextInput("0", Validator.numericalValidator), "COLS")
                .appendField(__("dev.LCD", 1))
                .appendField(new Blockly.FieldTextInput("0", Validator.numericalValidator), "ROWS");
        this.setInputsInline(true);
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
        generator.addLibrary("abbozza.h");
        // generator.addLibrary("// Falls tatsächlich ein LLCD benutzt werden soll,");
        // generator.addLibrary("// kommentiere die vorherige Zeile aus und die nächste ein.");
        // generator.addLibrary("// #include <LiquidCrystal.h>");
        var cols = generator.fieldToCode(this, "COLS");
        var rows = generator.fieldToCode(this, "ROWS");


        var pre = "LiquidCrystal _dev_" + this.getName() + "= new LiquidCrystal();\n";
        pre = pre + "// Falls ein echtes LCD genutzt wird, muss eine der folgenden Zeilen\n";
        pre = pre + "// mit den korrekten pins genutzt werden.\n";
        pre = pre + "// LiquidCrystal _dev_" + this.getName() + "=new LiquidCrystal(rs,rw,enable,d4,d5,d6,d7)\n;"
        pre = pre + "// LiquidCrystal _dev_" + this.getName() + "=new LiquidCrystal(rs,rw,enable,d0,d1,s´d2,d3,d4,d5,d6,d7)\n;"

        generator.addPreSetup(pre);

        return "_dev_" + name + ".begin(" + cols + "," + rows + ");";
    },
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }

};



Blockly.Blocks['dev_lcd'] = Abbozza.DeviceLCD;
// Blockly.Blocks['dev_button_state'] = Abbozza.DeviceButtonState;
