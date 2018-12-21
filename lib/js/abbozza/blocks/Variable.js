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
 * @fileoverview Blocks for variables
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * Number-variable declaration block
 * 
 * This block declares a variable of type NUMBER.
 */

Abbozza.VariableNum = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        thisBlock = this;
        this.appendValueInput("DIM")
                .setCheck("ARR_DIM")
                .appendField(_("NUMBER"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

/**
 * Number-variable declaration block w/o array connection
 * 
 * This block declares a variable of type NUMBER.
 */

Abbozza.VariableNumNoConn = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
       this.appendDummyInput()
                 .appendField(_("NUMBER"))
                 .appendField(new FieldNameInput("<name>", this.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
        this.setOutput(false);
    }
};

/**
 * Text-variable declaration block
 * 
 * This block declares a variable of type TEXT.
 */

Abbozza.VariableString = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        thisBlock = this;
        this.appendValueInput("DIM")
                .setCheck("ARR_DIM")
                .appendField(_("STRING"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

/**
 * Text-variable declaration block w/o array connection
 * 
 * This block declares a variable of type TEXT.
 */

Abbozza.VariableStringNoConn = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(_("STRING"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

/**
 * Decimal-variable declaration block 
 * 
 * This block declares a variable of type DECIMAL.
 */

Abbozza.VariableDecimal = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        thisBlock = this;
        this.appendValueInput("DIM")
                .setCheck("ARR_DIM")
                .appendField(_("DECIMAL"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

/**
 * Decimal-variable declaration block w/o array connection 
 * 
 * This block declares a variable of type DECIMAL.
 */

Abbozza.VariableDecimalNoConn = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(_("DECIMAL"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};


/**
 * Boolean-variable declaration block
 * 
 * This block declares a variable of type BOOLEAN.
 */

Abbozza.VariableBoolean = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        thisBlock = this;
        this.appendValueInput("DIM")
                .setCheck("ARR_DIM")
                .appendField(_("BOOLEAN"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

/**
 * Boolean-variable declaration block w/o array connection
 * 
 * This block declares a variable of type BOOLEAN.
 */

Abbozza.VariableBooleanNoConn = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        thisBlock = this;
        this.appendDummyInput()
                .appendField(_("BOOLEAN"))
                .appendField(new FieldNameInput("<name>", thisBlock.workspace.symbols), "NAME");
        this.setPreviousStatement(true, "VAR_DECL");
        this.setNextStatement(true, "VAR_DECL");
        this.setTooltip('');
    }
};

/** 
 * Array-dimension block
 * 
 * This block can be appended to a variable declaration block or another
 * array-dimension block, to add an array dimension to the variable.
 * The length has to be a constant.
 */

Abbozza.ArrayDimension = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        this.appendValueInput("DIM")
                .setCheck("ARR_DIM")
                .appendField("[")
                .appendField(new FieldLengthInput("1", -1), "LEN")
                .appendField("]");
        this.setOutput(true, "ARR_DIM");
        this.setTooltip('');
    }
};


/** 
 * Array-dimension block w/o connection
 * 
 * This block can be appended to a variable declaration block or another
 * array-dimension block, to add an array dimension to the variable.
 * The length has to be a constant.
 */

Abbozza.ArrayDimensionNoConn = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        this.appendDummyInput()
                .appendField("[")
                .appendField(new FieldLengthInput("1", -1), "LEN")
                .appendField("]");
        this.setOutput(true, "ARR_DIM");
        this.setTooltip('');
    }
};


/**
 * Variable usage block
 * 
 * This block represents the variable of the given name.
 * Depending on the context of the block only global variables and
 * the local functions of its parent block can be chosen.
 */

Abbozza.VariableBlock = {
    symbol: null,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        // var thisBlock = this;
        this.appendDummyInput()
                .appendField(new VariableDropdown(this, function (name) {
                    if (name == null) return null;

                    var symbols = Abbozza.getSymbols(this.sourceBlock_);
                    this.symbol = symbols.exists(name);

                    if (this.sourceBlock_.getInput("DIMX"))
                        this.sourceBlock_.removeInput("DIMX");
                    
                    var no = Abbozza.deleteInputs(this.sourceBlock_, "DIM");

                    if (this.symbol[2] != null) {
                        for (var i = 0; i < this.symbol[2].length; i++) {
                            var inp = this.sourceBlock_.appendValueInput("DIM" + i).setCheck("NUMBER");
                            if (i == 0) {
                                inp.appendField("[");
                            } else {
                                inp.appendField("][");
                            }
                        }
                        this.sourceBlock_.appendDummyInput("DIMX").appendField("]");
                    }
                    this.sourceBlock_.setOutput(true,[this.symbol[1], "VAR" + this.symbol[1]]);
                    return this.symbol[0];
                }), "NAME");
        this.setOutput(true, null);
        this.setInputsInline(true);
        this.setTooltip('');
    },
    onload: function () {
        this.getSymbol();
    },
    mutationToDom: function () {
        this.getSymbol();

        if (this.symbol && (this.symbol[2] != null)) {
            var mutation = document.createElement('mutation');
            mutation.setAttribute("dimension", this.symbol[2].length);
            return mutation;
        }
        return null;
    },
    domToMutation: function (xmlElement) {
        var dim = parseInt(xmlElement.getAttribute("dimension"));
        for (var i = 0; i < dim; i++) {
            var inp = this.appendValueInput("DIM" + i).setCheck("NUMBER");
            if (i == 0) {
                inp.appendField("[");
            } else {
                inp.appendField("][");
            }
        }
        this.appendDummyInput("DIMX").appendField("]");
        
        if (this.symbol) {
            this.setOutput(true,[this.symbol[1], "VAR" + this.symbol[1]]);
        } else {
        }
    },
    getSymbol: function () {
        var name = this.getFieldValue("NAME");
        var symbols = Abbozza.getSymbols(this);
        if (symbols == null) {
            this.setOutput(true,null);
            return;
        }
        this.symbol = symbols.getSymbol(name);

        if (this.symbol) {
            this.setOutput(true,[this.symbol[1], "VAR" + this.symbol[1]]);
        }
    }
    
};



/**
 * Variable assigment block
 * 
 * A value can be assigned to the given variable.
 */

Abbozza.VariableAssign = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        this.appendValueInput("LEFT")
                .appendField(__("var.SET", 0))
                .setCheck(null);
        this.appendValueInput("RIGHT").appendField(__("var.SET", 1));
        this.setOutput(false, "STATEMENT");
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(true);
        this.setTooltip('');
    },
    onchange: function () {
        var variable = this.getInputTargetBlock("LEFT");
        if (variable != null) {
            var symbol = Abbozza.getSymbol(this, variable.getFieldValue("NAME"));
            if (symbol != null) {
                var type = symbol[1];
                if (type == "DECIMAL") {
                    this.getInput("RIGHT").setCheck(["DECIMAL", "NUMBER"]);
                    this.render();
                } else {
                    this.getInput("RIGHT").setCheck(type);
                    this.render();
                }
            } else {
                this.getInput("RIGHT").setCheck(null);
                this.render();
            }
        }
    }
/*,
    generateCode_: function (generator) {
        var left = generator.valueToCode(this, "LEFT");
        var right = generator.valueToCode(this, "RIGHT");
                
        if (left == null) {
            return null;
        }
        if (right == null) {
            return null;
        }

        var code = left + " = " + right + ";";

        return code;
    } */
};

Blockly.Blocks['var_block'] = Abbozza.VariableBlock;
Blockly.Blocks['var_num'] = Abbozza.VariableNum;
Blockly.Blocks['var_num_noconn'] = Abbozza.VariableNumNoConn;
Blockly.Blocks['var_string'] = Abbozza.VariableString;
Blockly.Blocks['var_string_noconn'] = Abbozza.VariableStringNoConn;
Blockly.Blocks['var_boolean'] = Abbozza.VariableBoolean;
Blockly.Blocks['var_boolean_noconn'] = Abbozza.VariableBooleanNoConn;
Blockly.Blocks['var_decimal_noconn'] = Abbozza.VariableDecimalNoConn;
Blockly.Blocks['var_decimal'] = Abbozza.VariableDecimal;
Blockly.Blocks['arr_dimension'] = Abbozza.ArrayDimension;
Blockly.Blocks['arr_dimension_noconn'] = Abbozza.ArrayDimensionNoConn;
Blockly.Blocks['var_assign'] = Abbozza.VariableAssign;

// For compatibility reasons
Blockly.Blocks['devices_block'] = Abbozza.VariableBlock;
Blockly.Blocks['devices_num'] = Abbozza.VariableNum;
Blockly.Blocks['devices_num_noconn'] = Abbozza.VariableNumNoConn;
Blockly.Blocks['devices_string'] = Abbozza.VariableString;
Blockly.Blocks['devices_string_noconn'] = Abbozza.VariableStringNoConn;
Blockly.Blocks['devices_boolean'] = Abbozza.VariableBoolean;
Blockly.Blocks['devices_boolean_noconn'] = Abbozza.VariableBooleanNoConn;
Blockly.Blocks['devices_decimal_noconn'] = Abbozza.VariableDecimalNoConn;
Blockly.Blocks['devices_decimal'] = Abbozza.VariableDecimal;
Blockly.Blocks['devices_assign'] = Abbozza.VariableAssign;


Abbozza.VarIntStepUp = {
    init: function () {
        var thisBlock = this;        
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        this.appendDummyInput()
                .appendField(_("var.INT_STEP_UP"))
                .appendField(new VariableTypedDropdown(thisBlock, "NUMBER", null), "VAR");
        this.setOutput(false, "STATEMENT");
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(true);
        this.setTooltip('');
    }
}


Abbozza.VarIntStepDown = {
    init: function () {
        var thisBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        this.appendDummyInput()
                .appendField(_("var.INT_STEP_DOWN"))
                .appendField(new VariableTypedDropdown(thisBlock, "NUMBER", null), "VAR");          
        this.setOutput(false, "STATEMENT");
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(true);
        this.setTooltip('');
    }
}


Abbozza.VarIntChangeBy = {
    init: function () {
        var thisBlock = this;        
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        this.appendValueInput("VALUE")
                .appendField(__("var.INT_CHANGE_BY",0))
                .appendField(new VariableTypedDropdown(thisBlock, "NUMBER", null), "VAR")           
                .appendField(__("var.INT_CHANGE_BY",1))
                .setCheck("NUMBER");
        this.setOutput(false, "STATEMENT");
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setInputsInline(true);
        this.setTooltip('');
    }
}


Blockly.Blocks['var_int_step_up'] = Abbozza.VarIntStepUp;
Blockly.Blocks['var_int_step_down'] = Abbozza.VarIntStepDown;
Blockly.Blocks['var_int_change_by'] = Abbozza.VarIntChangeBy;
