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
Abbozza.Message = {
    symbols: null,
    stdCmdActive : true,
    debug: false,
    commands: [],
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.USB"));
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/msg.png",16,16))     
                .appendField(_("parse.EXECUTE_MSG"));
        this.appendDummyInput()
                .appendField(_("parse.STD_CMD"))
                .appendField(new Blockly.FieldCheckbox(true),"STANDARD");
        this.appendStatementInput("COMMANDS")
                .setCheck("CMD_DECL");
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
    }    
};


/**
 * Text-variable declaration block w/o array connection
 * 
 * This block declares a variable of type TEXT.
 */

Abbozza.MessageCmdDecl = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.USB"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/msg.png",16,16))     
                .appendField(__("parse.CMD",0))
                .appendField(new Blockly.FieldTextInput("<command>",
                        function(text) { return text.toUpperCase(); } ), "COMMAND")
                .appendField(__("parse.CMD",1));        
        this.appendStatementInput("STATEMENTS")
                .setCheck("STATEMENT");
        this.setPreviousStatement(true, "CMD_DECL");
        this.setNextStatement(true, "CMD_DECL");
        this.setTooltip('');
    }
};



Abbozza.MessageNumber = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.USB"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/msg.png",16,16))     
                .appendField(_("parse.NUMBER"));
        this.setOutput(true, "NUMBER");
        this.setTooltip('');
    },
    generateCode : function(generator) {
        var code = "";
        generator.parserRequired = true;
        code = "__parser.parse_" + keyword("NUMBER") + "()";
        return code;
    }
};


Abbozza.MessageDecimal = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.USB"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/msg.png",16,16))     
                .appendField(_("parse.DECIMAL"));
        this.setOutput(true, "DECIMAL");
        this.setTooltip('');
    },
    generateCode : function(generator) {
        var code = "";
        generator.parserRequired = true;
        code = "__parser.parse_" + keyword("DECIMAL") + "()";
        return code;
    }
};


Abbozza.MessageString = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.USB"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/msg.png",16,16))     
                .appendField(_("parse.STRING"));
        this.setOutput(true, "STRING");
        this.setTooltip('');
    },
    generateCode : function(generator) {
        var code = "";
        generator.parserRequired = true;
        code = "__parser.parse_string()";
        return code;
    }
};


Abbozza.MessageWord = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.USB"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/msg.png",16,16))     
                .appendField(_("parse.WORD"));
        this.setOutput(true, "STRING");
        this.setTooltip('');
    },
    generateCode : function(generator) {
        var code = "";
        generator.parserRequired = true;
        code = "__parser.parse_word()";
        return code;
    }
};

Abbozza.MessageResponse = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.USB"));
        this.appendValueInput("MSG")
                .appendField(new Blockly.FieldImage("img/devices/msg.png",16,16))     
                .setCheck("STRING")
                .appendField(_("parse.SEND_RESPONSE"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
    },
    
    generateCode: function (generator) {
        var code = "";

        generator.parserRequired = true;
        
        var msg = generator.valueToCode(this,"MSG"); 

        code = "__parser.sendResponse(" + msg + ");";

        return code;
    }, 
    
}

Blockly.Blocks['message_parse'] = Abbozza.Message;
Blockly.Blocks['message_cmd_decl'] = Abbozza.MessageCmdDecl;
Blockly.Blocks['message_number'] = Abbozza.MessageNumber;
Blockly.Blocks['message_decimal'] = Abbozza.MessageDecimal;
Blockly.Blocks['message_word'] = Abbozza.MessageWord;
Blockly.Blocks['message_string'] = Abbozza.MessageString;
Blockly.Blocks['message_response'] = Abbozza.MessageResponse;
