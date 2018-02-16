/**
 * 
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
* @fileoverview Blocks for functions
* @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
*/

/**
 * Check the serial connection for commands of the form
 * [[ <id> <cmd> <options> ]]
 * and handles them.
 */
Abbozza.I2CWrite = {
    symbols: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
        this.appendValueInput("ADDR")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/i2c.png",16,16))     
                .appendField(_("i2c.WRITE"));
        this.appendStatementInput("BYTES")
                .setCheck("I2C_BYTE");
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
    }    
};


Abbozza.I2CWriteByte = {
    symbols: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
        this.appendValueInput("VALUE")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/i2c.png",16,16))     
                .appendField(_("i2c.WRITE_BYTE"));
        this.setPreviousStatement(true,"I2C_BYTE");
        this.setNextStatement(true,"I2C_BYTE");
        this.setTooltip('');
    }    
};


Abbozza.I2CWriteShort = {
    symbols: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
        this.appendValueInput("VALUE")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/i2c.png",16,16))     
                .appendField(_("i2c.WRITE_SHORT"));
        this.setPreviousStatement(true,"I2C_BYTE");
        this.setNextStatement(true,"I2C_BYTE");
        this.setTooltip('');
    }    
};

Abbozza.I2CWriteInt = {
    symbols: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
        this.appendValueInput("VALUE")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/i2c.png",16,16))     
                .appendField(_("i2c.WRITE_INT"));
        this.setPreviousStatement(true,"I2C_BYTE");
        this.setNextStatement(true,"I2C_BYTE");
        this.setTooltip('');
    }    
};

Abbozza.I2CWriteText = {
    symbols: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
        this.appendValueInput("VALUE")
                .setCheck("STRING")
                .appendField(new Blockly.FieldImage("img/devices/i2c.png",16,16))     
                .appendField(_("i2c.WRITE_TEXT"));
        this.setPreviousStatement(true,"I2C_BYTE");
        this.setNextStatement(true,"I2C_BYTE");
        this.setTooltip('');
    }    
};

Abbozza.I2CRead = {
    symbols: null,
    init: function () {
        thisBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
        this.appendValueInput("ADDR")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/i2c.png",16,16))     
                .appendField(__("i2c.READ",0));
        this.appendValueInput("LENGTH")
                .setCheck("NUMBER")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(__("i2c.READ",1));
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setOutput(true,"STRING");
        this.setTooltip('');
    }    
};


Blockly.Blocks['i2c_write'] = Abbozza.I2CWrite;
Blockly.Blocks['i2c_write_byte'] = Abbozza.I2CWriteByte;
Blockly.Blocks['i2c_write_short'] = Abbozza.I2CWriteShort;
Blockly.Blocks['i2c_write_int'] = Abbozza.I2CWriteInt;
Blockly.Blocks['i2c_write_text'] = Abbozza.I2CWriteText;
Blockly.Blocks['i2c_read'] = Abbozza.I2CRead;
