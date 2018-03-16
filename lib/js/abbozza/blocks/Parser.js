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
 * @fileoverview 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Abbozza.ParserSetLine = {
    symbols: null,
    stdCmdActive : true,
    debug: false,
    commands: [],
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.TEXT"));
        this.appendValueInput("LINE")
           .appendField(new Blockly.FieldImage("img/devices/parser.png",16,16))     
           .appendField(_("parser.SET_LINE"))
           .setCheck("STRING");
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
    }
};


Abbozza.ParseNumber = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TEXT"));
        thisBlock = this;
        this.appendDummyInput()
           .appendField(new Blockly.FieldImage("img/devices/parser.png",16,16))     
           .appendField(_("parser.NUMBER"));
        this.setOutput(true, "NUMBER");
        this.setTooltip('');
    }
};


Abbozza.ParseDecimal = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TEXT"));
        thisBlock = this;
        this.appendDummyInput()
           .appendField(new Blockly.FieldImage("img/devices/parser.png",16,16))     
           .appendField(_("parser.DECIMAL"));
        this.setOutput(true, "DECIMAL");
        this.setTooltip('');
    }
};


Abbozza.ParseString = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TEXT"));
        thisBlock = this;
        this.appendDummyInput()
           .appendField(new Blockly.FieldImage("img/devices/parser.png",16,16))     
           .appendField(_("parser.STRING"));
        this.setOutput(true, "STRING");
        this.setTooltip('');
    }
};


Abbozza.ParseWord = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TEXT"));
        thisBlock = this;
        this.appendDummyInput()
           .appendField(new Blockly.FieldImage("img/devices/parser.png",16,16))     
           .appendField(_("parser.WORD"));
        this.setOutput(true, "STRING");
        this.setTooltip('');
    }
};

Abbozza.ParseEOL = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.TEXT"));
        thisBlock = this;
        this.appendDummyInput()
           .appendField(new Blockly.FieldImage("img/devices/parser.png",16,16))     
           .appendField(_("parser.EOL"));
        this.setOutput(true, "BOOLEAN");
        this.setTooltip('');
    }
};

Blockly.Blocks['parse_set_line'] = Abbozza.ParserSetLine;
Blockly.Blocks['parse_number'] = Abbozza.ParseNumber;
Blockly.Blocks['parse_decimal'] = Abbozza.ParseDecimal;
Blockly.Blocks['parse_word'] = Abbozza.ParseWord;
Blockly.Blocks['parse_string'] = Abbozza.ParseString;
Blockly.Blocks['parse_eol'] = Abbozza.ParseEOL;

