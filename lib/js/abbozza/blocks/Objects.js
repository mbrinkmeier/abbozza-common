/* 
 * Copyright 2018 mbrin.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This file provides various blocks for the definition of objects and classes.
 * 
 * This includes the standard classes Stack, Queue and List
 */



/*************************
 * STACKS
 *************************/

/**
 * Stack declaration block
 * 
 * This block declares a variable of type #STACK.
 */
Abbozza.VariableStack = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(_("obj.STACK"))
                .appendField( new Blockly.FieldDropdown(
                                    [[_("NUMBER"),"NUMBER"],
                                     [_("DECIMAL"),"DECIMAL"],
                                     [_("STRING"),"STRING"],
                                     [_("BOOLEAN"),"BOOLEAN"]
                                    ]
                                ), "TYPE")
                .appendField( new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");  
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

Abbozza.StackNew = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var block = this;
        this.appendDummyInput()
                .appendField(_("obj.new") + " " + _("obj.stack"))
                .appendField( new Blockly.FieldDropdown(
                                    [[_("NUMBER"),"NUMBER"],
                                     [_("DECIMAL"),"DECIMAL"],
                                     [_("STRING"),"STRING"],
                                     [_("BOOLEAN"),"BOOLEAN"]
                                    ]
                                , function(name) { 
                                    block.setOutput(true,"#STACK_"+ name); 
                                }), "TYPE");
        this.setOutput(true, "#STACK_" + this.getFieldValue("TYPE"));
        this.setInputsInline(true);
        this.setTooltip('');
    }
};


Abbozza.StackIsEmpty = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var thisBlock = this;
        var rootBlock = this.getRootBlock();
        this.appendDummyInput()
                .appendField( 
                    new VariableTypedDropdown( thisBlock, "#STACK_", null, true ), "NAME")
                .appendField(_("obj.stack_is_empty"));
        this.setOutput(true, "BOOLEAN");
        this.setInputsInline(false);
        this.setTooltip('');
    }
};


Abbozza.StackPush = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var thisBlock = this;
        this.appendValueInput("VALUE")
                .appendField( 
                    new VariableTypedDropdown(
                        thisBlock, 
                        "#STACK_", 
                        function(name) {
                            var symbols = Abbozza.getSymbols(thisBlock);
                            var symbol = symbols.getSymbol(name);
                            var type = symbol[1].substring(7);
                            thisBlock.getInput("VALUE").setCheck(type);
                        },
                        true
                    ),
                    "NAME")
                .appendField(_("obj.stack_push"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setOutput(false);
        this.setInputsInline(false);
        this.setTooltip('');
    },
    onload : function() {
        var name = this.getFieldValue("NAME");
        var symbols = Abbozza.getSymbols(this);
        var symbol = symbols.getSymbol(name);
        var type = symbol[1].substring(7);
        this.getInput("VALUE").setCheck(type);        
    }
};


Abbozza.StackPop = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var thisBlock = this;
        this.appendDummyInput()
                .appendField( 
                    new VariableTypedDropdown(
                        thisBlock, 
                        "#STACK_", 
                        function(name) {
                            var symbols = Abbozza.getSymbols(thisBlock);
                            var symbol = symbols.getSymbol(name);
                            var type = symbol[1].substring(7);
                            thisBlock.setOutput(true,type);
                        },
                        true
                    ),
                    "NAME")
                .appendField(_("obj.stack_pop"));
        this.setOutput(true, "");
        this.setInputsInline(false);
        this.setTooltip('');
    },
    onload : function() {
        var name = this.getFieldValue("NAME");
        var symbols = Abbozza.getSymbols(this);
        var symbol = symbols.getSymbol(name);
        var type = symbol[1].substring(7);
        this.setOutput(true,type);        
    }
};


Abbozza.StackTop = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var thisBlock = this;
        this.appendDummyInput()
                .appendField( 
                    new VariableTypedDropdown(
                        thisBlock, 
                        "#STACK_", 
                        function(name) {
                            var symbols = Abbozza.getSymbols(thisBlock);
                            var symbol = symbols.getSymbol(name);
                            var type = symbol[1].substring(7);
                            thisBlock.setOutput(true,type);
                        },
                        true
                    ),
                    "NAME")
                .appendField(_("obj.stack_top"));
        this.setOutput(true, "");
        this.setInputsInline(false);
        this.setTooltip('');
    },
    onload : function() {
        var name = this.getFieldValue("NAME");
        var symbols = Abbozza.getSymbols(this);
        var symbol = symbols.getSymbol(name);
        var type = symbol[1].substring(7);
        this.setOutput(true,type);        
    }
};

Blockly.Blocks['var_stack'] = Abbozza.VariableStack;
Blockly.Blocks['stack_new'] = Abbozza.StackNew;
Blockly.Blocks['stack_is_empty'] = Abbozza.StackIsEmpty;
Blockly.Blocks['stack_push'] = Abbozza.StackPush;
Blockly.Blocks['stack_pop'] = Abbozza.StackPop;
Blockly.Blocks['stack_top'] = Abbozza.StackTop;

/*************************
 * QUEUES
 *************************/

/**
 * Queue declaration block
 * 
 * This block declares a variable of type #QUEUE.
 */
Abbozza.VariableQueue = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(_("obj.QUEUE"))
                .appendField( new Blockly.FieldDropdown(
                                    [[_("NUMBER"),"NUMBER"],
                                     [_("DECIMAL"),"DECIMAL"],
                                     [_("STRING"),"STRING"],
                                     [_("BOOLEAN"),"BOOLEAN"]
                                    ]
                                ), "TYPE")
                .appendField( new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");  
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

Abbozza.QueueNew = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var block = this;
        this.appendDummyInput()
                .appendField(_("obj.new") + " " + _("obj.queue"))
                .appendField( new Blockly.FieldDropdown(
                                    [[_("NUMBER"),"NUMBER"],
                                     [_("DECIMAL"),"DECIMAL"],
                                     [_("STRING"),"STRING"],
                                     [_("BOOLEAN"),"BOOLEAN"]
                                    ]
                                , function(name) { 
                                    block.setOutput(true,"#QUEUE_"+ name); 
                                }), "TYPE");
        this.setOutput(true, "#QUEUE_" + this.getFieldValue("TYPE"));
        this.setInputsInline(true);
        this.setTooltip('');
    }
};

Abbozza.QueueIsEmpty = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var thisBlock = this;
        var rootBlock = this.getRootBlock();
        this.appendDummyInput()
                .appendField( 
                    new VariableTypedDropdown( thisBlock, "#QUEUE_", null, true ), "NAME")
                .appendField(_("obj.queue_is_empty"));
        this.setOutput(true, "BOOLEAN");
        this.setInputsInline(false);
        this.setTooltip('');
    }
};


Abbozza.QueueEnqueue = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var thisBlock = this;
        this.appendValueInput("VALUE")
                .appendField( 
                    new VariableTypedDropdown(
                        thisBlock, 
                        "#QUEUE_", 
                        function(name) {
                            var symbols = Abbozza.getSymbols(thisBlock);
                            var symbol = symbols.getSymbol(name);
                            var type = symbol[1].substring(7);
                            thisBlock.getInput("VALUE").setCheck(type);
                        },
                        true
                    ),
                    "NAME")
                .appendField(_("obj.queue_enqueue"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setOutput(false);
        this.setInputsInline(false);
        this.setTooltip('');
    },
    onload : function() {
        var name = this.getFieldValue("NAME");
        var symbols = Abbozza.getSymbols(this);
        var symbol = symbols.getSymbol(name);
        var type = symbol[1].substring(7);
        this.getInput("VALUE").setCheck(type);        
    }
};


Abbozza.QueueDequeue = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var thisBlock = this;
        this.appendDummyInput()
                .appendField( 
                    new VariableTypedDropdown(
                        thisBlock, 
                        "#QUEUE_", 
                        function(name) {
                            var symbols = Abbozza.getSymbols(thisBlock);
                            var symbol = symbols.getSymbol(name);
                            var type = symbol[1].substring(7);
                            thisBlock.setOutput(true,type);
                        },
                        true
                    ),
                    "NAME")
                .appendField(_("obj.queue_dequeue"));
        this.setOutput(true, "");
        this.setInputsInline(false);
        this.setTooltip('');
    },
    onload : function() {
        var name = this.getFieldValue("NAME");
        var symbols = Abbozza.getSymbols(this);
        var symbol = symbols.getSymbol(name);
        var type = symbol[1].substring(7);
        this.setOutput(true,type);        
    }
};


Abbozza.QueueHead = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var thisBlock = this;
        this.appendDummyInput()
                .appendField( 
                    new VariableTypedDropdown(
                        thisBlock, 
                        "#QUEUE_", 
                        function(name) {
                            var symbols = Abbozza.getSymbols(thisBlock);
                            var symbol = symbols.getSymbol(name);
                            var type = symbol[1].substring(7);
                            thisBlock.setOutput(true,type);
                        },
                        true
                    ),
                    "NAME")
                .appendField(_("obj.queue_head"));
        this.setOutput(true, "");
        this.setInputsInline(false);
        this.setTooltip('');
    },
    onload : function() {
        var name = this.getFieldValue("NAME");
        var symbols = Abbozza.getSymbols(this);
        var symbol = symbols.getSymbol(name);
        var type = symbol[1].substring(7);
        this.setOutput(true,type);        
    }
};


Blockly.Blocks['var_queue'] = Abbozza.VariableQueue;
Blockly.Blocks['queue_new'] = Abbozza.QueueNew;
Blockly.Blocks['queue_is_empty'] = Abbozza.QueueIsEmpty;
Blockly.Blocks['queue_enqueue'] = Abbozza.QueueEnqueue;
Blockly.Blocks['queue_dequeue'] = Abbozza.QueueDequeue;
Blockly.Blocks['queue_head'] = Abbozza.QueueHead;

/*************************
 * LISTS
 *************************/

/**
 * List declaration block
 * 
 * This block declares a variable of type #LIST.
 */
Abbozza.VariableList = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(_("obj.LIST"))
                .appendField( new Blockly.FieldDropdown(
                                    [[_("NUMBER"),"NUMBER"],
                                     [_("DECIMAL"),"DECIMAL"],
                                     [_("STRING"),"STRING"],
                                     [_("BOOLEAN"),"BOOLEAN"]
                                    ]
                                ), "TYPE")
                .appendField( new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");  
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

Abbozza.ListNew = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.DATASTRUCTURES"));
        var block = this;
        this.appendDummyInput()
                .appendField(_("obj.new") + " " + _("obj.list"))
                .appendField( new Blockly.FieldDropdown(
                                    [[_("NUMBER"),"NUMBER"],
                                     [_("DECIMAL"),"DECIMAL"],
                                     [_("STRING"),"STRING"],
                                     [_("BOOLEAN"),"BOOLEAN"]
                                    ]
                                , function(name) { 
                                    block.setOutput(true,"#LIST_"+ name); 
                                }), "TYPE");
        this.setOutput(true, "#LIST_" + this.getFieldValue("TYPE"));
        this.setInputsInline(true);
        this.setTooltip('');
    }
};


Blockly.Blocks['var_list'] = Abbozza.VariableList;
Blockly.Blocks['list_new'] = Abbozza.ListNew;
