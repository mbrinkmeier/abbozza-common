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
                .appendField(_("parse.EXECUTE_MSG"));
        this.appendDummyInput()
                .appendField(_("parse.STD_CMD"))
                .appendField(new Blockly.FieldCheckbox(true),"STANDARD");
        this.appendStatementInput("COMMANDS")
                .setCheck("CMD_DECL");
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
        // this.setMutator(new Blockly.Mutator(['parse_cmd_decl']));
    },
    
    generateCode: function (generator) {
        var code = "";
        
        generator.parserRequired = true;
        
        code = "__parser.check();\n";
        var checkStdMsg = this.getFieldValue("STANDARD");
        if ( checkStdMsg == "TRUE") {
            code = code + "__parser.execute();"
        }
        
        var commands = generator.statementToCode(this,"COMMANDS","");

        code = code + "\n" + commands;
        /*
        for (var i = 0; i < this.commands.length; i=i+1) {
            code = code + "\n";
            code = code + "if ( __parser.getCmd() == \"" + this.commands[i] + "\") {\n";
            var statements = generator.statementToCode(this,this.commands[i],"   ");
            code = code + statements + "\n";
            code = code + "}";
        }
        */
        
        return code;
    }
    
    /*
    compose: function (topBlock) {
        this.stdCmdActive = topBlock.getField("STANDARD").getValue();
        
        // Build command list
        this.commands = [];
        var connection = topBlock.getInput("COMMANDS").connection;
        var cmdBlock = connection.targetBlock();
        while ( cmdBlock != null ) {
            var cmd = cmdBlock.getFieldValue("COMMAND");
            cmd = cmd.toUpperCase();
            this.commands.push(cmd);
            var stat = null;
            if ( this.getInput(cmd) ) {
                this.moveInputBefore(cmd+"_LABEL",null);
                this.moveInputBefore(cmd,null);
            } else {
                this.appendDummyInput(cmd+"_LABEL")
                    .appendField(__("parse.COMMAND",0) + " " + cmd + " " + __("parse.COMMAND",1))
                    .setAlign(Blockly.ALIGN_RIGHT);
                this.appendStatementInput(cmd)
                    .setCheck("STATEMENT");
            }
            connection = cmdBlock.nextConnection;
            cmdBlock = connection.targetBlock();
        }
        
        // Now check all inputs, if they still are required
        var inputs = this.inputList;
        for (var i = 2; i < inputs.length; i = i+2) {                
            var name = inputs[i].name;
            if (!this.commands.includes(name)) {
                this.removeInput(name);
                this.removeInput(name+"_LABEL");
            }
        }
           
        return;
    },
    
    decompose: function (workspace) {
        var topBlock = workspace.newBlock('parse_cmd_control');
        topBlock.initSvg();
        
        topBlock.getField("STANDARD").setValue(this.stdCmdActive);
        
        var connection = topBlock.getInput("COMMANDS").connection;
                
        // Iterate through the commands
        for ( var i = 0; i < this.commands.length; i=i+1 ) {
            var cmd = this.commands[i];
            var cmdBlock = workspace.newBlock('parse_cmd_decl');
            cmdBlock.initSvg();
            cmdBlock.getField("COMMAND").setText(cmd);
            connection.connect(cmdBlock.previousConnection);
            connection = cmdBlock.nextConnection;
        }

        return topBlock;
    },
    
    mutationToDom: function () {
        var mutation = document.createElement('mutation');
        for ( var i = 0; i < this.commands.length; i = i+1 ) {
            var child = document.createElement('command');        
            child.setAttribute('cmd',this.commands[i]);
            mutation.appendChild(child);
        }
        return mutation;
    },
    
    domToMutation: function (xmlElement) {
        var child;
        for ( var j =0 ; j < this.commands.length ; j=j+1) {
           this.removeInput(this.commands[j]+"_LABEL");
           this.removeInput(this.commands[j]);
        }
        this.commands = [];
        for (var i = 0; i < xmlElement.childNodes.length; i++) {
            child = xmlElement.childNodes[i];
            if (child.tagName == 'command') {
                var cmd = child.getAttribute("cmd").toUpperCase();
                this.commands.push(cmd);
                this.appendDummyInput(cmd+"_LABEL")
                   .appendField(__("parse.COMMAND",0) + " " + cmd + " " + __("parse.COMMAND",1))
                   .setAlign(Blockly.ALIGN_RIGHT);
                this.appendStatementInput(cmd)
                   .setCheck("STATEMENT");
            }
        }
    } */
};

/**
 * Block for the definition of commands in a parser
 */

Abbozza.MessageCmdControl = {
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getColor("cat.USB"));
        this.appendDummyInput()
                .appendField(_("parse.STD_CMD"))
                .appendField(new Blockly.FieldCheckbox(true),"STANDARD");
        this.appendDummyInput()
                .appendField(_("parse.COMMANDS"));
        this.appendStatementInput("COMMANDS").setCheck("CMD_DECL");
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
                .appendField(__("parse.CMD",0))
                .appendField(new Blockly.FieldTextInput("<command>",
                        function(text) { return text.toUpperCase(); } ), "COMMAND")
                .appendField(__("parse.CMD",1));        
        this.appendStatementInput("STATEMENTS")
                .setCheck("STATEMENT");
        this.setPreviousStatement(true, "CMD_DECL");
        this.setNextStatement(true, "CMD_DECL");
        this.setTooltip('');
    },
    
    generateCode: function(generator) {
        var code = "";

        var command = generator.fieldToCode(this,"COMMAND");
        var statements = generator.statementToCode(this,"STATEMENTS","   ");

        code = code + "if ( __parser.getCmd().equals(\"" + command + "\")) {\n";
        code = code + statements + "\n";
        code = code + "}";
        
        return code;
    }
};



Abbozza.MessageNumber = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.USB"));
        thisBlock = this;
        this.appendDummyInput()
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
Blockly.Blocks['message_cmd_control'] = Abbozza.MessageCmdControl;
Blockly.Blocks['message_cmd_decl'] = Abbozza.MessageCmdDecl;
Blockly.Blocks['message_number'] = Abbozza.MessageNumber;
Blockly.Blocks['message_decimal'] = Abbozza.MessageDecimal;
Blockly.Blocks['message_word'] = Abbozza.MessageWord;
Blockly.Blocks['message_string'] = Abbozza.MessageString;
Blockly.Blocks['message_response'] = Abbozza.MessageResponse;
