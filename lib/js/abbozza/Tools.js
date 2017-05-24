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
 * @fileoverview Some utility operations for abbozza! and patches for Blockly
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */


/**
 * This operation returns the local symbols of the given block.
 */
Abbozza.getSymbols = function (block) {
    var rootBlock = block.getRootBlock();
    if (rootBlock.symbols) {
        return rootBlock.symbols;
    } else {
        return rootBlock.workspace.symbols;
    }
}

/**
 * Retrieves one specific symbol from the block
 */
Abbozza.getSymbol = function (block, name) {
    var symbols = this.getSymbols(block);
    if (symbols == null)
        return null;
    return symbols.getSymbol(name);
}

/**
 * Gets a specific global symbol
 */
Abbozza.getGlobalSymbol = function (name) {
    return Blockly.mainWorkspace.symbols.getSymbol(name);
}

/**
 * Returns the top block of the given name
 */
Abbozza.getTopBlock = function (name) {
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();

    if (topBlocks == null)
        return null;

    for (var i = 0; i < topBlocks.length; i++) {
        if (topBlocks[i].name && topBlocks[i].name == name) {
            return topBlocks[i];
        }
    }
}

/**
 * Returns the lengths of dimensions of a specific array block as an array
 */
Abbozza.getLen = function (block) {
    var dimen = block.getInputTargetBlock("DIM");

    if (dimen == null)
        return null;

    var len = [];
    while (dimen != null) {
        var field = dimen.getField("LEN");
        var length = parseInt(field.getText());
        len[len.length] = length;
        dimen = dimen.getInputTargetBlock("DIM");
    }
    return len;
};


/**
 * Returns the lengths of dimensions of a specific array block as a string
 */
Abbozza.lenAsString = function (len) {
    if (len == null)
        return "";
    var result = "";
    for (var i = 0; i < len.length; i++) {
        result = result + "[" + len[i] + "]";
    }
    return result;
};

/**
 * Returns the dimension of an array as sequence of empty bracket pairs.
 */
Abbozza.lenAsEmptyString = function (len) {
    if (len == null)
        return "";
    var result = "";
    for (var i = 0; i < len.length; i++) {
        result = result + "[]";
    }
    return result;
};


/**
 * Parses a string containing array dimensions for the lengths.
 */
Abbozza.lenFromString = function (lens) {
    if (lens == null)
        return null;
    var len = [];

    lens = lens.replace(/\[/g, "");
    lenss = lens.split("]");
    for (var i = 0; i < lenss.length - 1; i++) {
        len.push(parseInt(lenss[i]));
    }
    if (len.length == 0)
        return null;
    return len;
};

/**
 * Collects all declared function blocks from the workspace
 */
Abbozza.collectFunctions = function () {
    Abbozza.globalSymbols.deleteFunctions();
    Abbozza.globalSymbols.deleteISRs();

    var topBlocks = Blockly.mainWorkspace.getTopBlocks();
    for (var i = 0; i < topBlocks.length; i++) {
        if (topBlocks[i].type == "func_decl") {
            var newName = Abbozza.globalSymbols.getLegalName(topBlocks[i].name);
            topBlocks[i].name = newName;
            Abbozza.globalSymbols.addFunction(topBlocks[i].name, topBlocks[i].rettype, topBlocks[i].getCommentText());
            Abbozza.globalSymbols.addChild(topBlocks[i].symbols, topBlocks[i].name);
            topBlocks[i].setFieldValue(topBlocks[i].getSignature(), "SIGNATURE");
        } else if (topBlocks[i].type == "int_isr") {
            var newName = Abbozza.globalSymbols.getLegalName(topBlocks[i].name);
            topBlocks[i].name = newName;
            Abbozza.globalSymbols.addISR(topBlocks[i].name, topBlocks[i].getCommentText());
            Abbozza.globalSymbols.addChild(topBlocks[i].symbols, topBlocks[i].name);            
            topBlocks[i].setFieldValue(topBlocks[i].getSignature(), "SIGNATURE");
        }
    }
}

/**
 * 
 * @param {type} topBlock
 * @param {type} funcBlock
 * @returns {undefined}
 */
Abbozza.composeSymbols = function (topBlock, funcBlock) {
    var names = [];
    var len;

    if (funcBlock.symbols == null)
        return;

    funcBlock.symbols.deleteVariables();
    funcBlock.symbols.deleteParameters();

    var no = 0;
    while (funcBlock.getInput("VAR" + no)) {
        funcBlock.removeInput("VAR" + no);
        no = no + 1;
    }

    no = 0;
    while (funcBlock.getInput("PAR" + no)) {
        funcBlock.removeInput("PAR" + no);
        no = no + 1;
    }

    if (topBlock == null)
        return;

    Abbozza.composeSymbolsAtInput(topBlock, funcBlock, false);
    Abbozza.composeSymbolsAtInput(topBlock, funcBlock, true);

    Abbozza.changeSelection(null);
};


/**
 * 
 * @param {type} topBlock
 * @param {type} funcBlock
 * @param {type} parameter
 * @returns {undefined}
 */
Abbozza.composeSymbolsAtInput = function (topBlock, funcBlock, parameter) {
    var block;
    var inputName;
    var inputType;

    if (parameter == false) {
        block = topBlock.getInputTargetBlock("VARS");
        inputName = "VAR";
        inputType = Blockly.INPUT_VALUE;
    } else {
        block = topBlock.getInputTargetBlock("PARS");
        inputName = "PAR";
        inputType = Blockly.DUMMY_INPUT;
    }

    var params = "";
    var no = 0;
    while (block) {
        if (block.getInput("DIM")) {
            block.getInput("DIM").type = inputType;
        }
        var field = block.getField("NAME");
        if (field.editing == false || field.editing == true) {
            var name = field.getText();
            var newname = funcBlock.symbols.getLegalName(name);
            if (newname != name) {
                // console.log("Name " + name + " replaced by " + newname);
                field.setText(newname);
                name = newname;
            }
            if (name != "<name>") {
                switch (block.type) {
                    case "var_num":
                    case "var_num_noconn":
                    case "devices_num":
                    case "devices_num_noconn":
                        len = Abbozza.getLen(block);
                        funcBlock.symbols.addArray(name, "NUMBER", len, parameter, block.getCommentText());
                        // if ( parameter == false )
                        //	funcBlock.appendDummyInput(inputName+no).appendField(_("NUMBER") + " " + name + Abbozza.lenAsString(len));
                        // else {
                        //	params = params + ", " + keyword("NUMBER") + " " + name;
                        // }
                        break;
                    case "var_string":
                    case "var_string_noconn":
                    case "devices_string":
                    case "devices_string_noconn":
                        len = Abbozza.getLen(block);
                        funcBlock.symbols.addArray(name, "STRING", len, parameter, block.getCommentText());
                        // if ( parameter == false )
                        // 	funcBlock.appendDummyInput(inputName+no).appendField(_("STRING") + " " + name + Abbozza.lenAsString(len));
                        // else {
                        // 	params = params + ", "  + keyword("STRING") + " " + name;
                        // }
                        break;
                    case "var_decimal":
                    case "var_decimal_noconn":
                    case "devices_decimal":
                    case "devices_decimal_noconn":
                        len = Abbozza.getLen(block);
                        funcBlock.symbols.addArray(name, "DECIMAL", len, parameter, block.getCommentText());
                        // if ( parameter == false )
                        // 	funcBlock.appendDummyInput(inputName+no).appendField(_("DECIMAL") + " "  + name + Abbozza.lenAsString(len));
                        // else {
                        // 	params = params + ", " + keyword("DECIMAL") + " " + name;
                        // }
                        break;
                    case "var_boolean":
                    case "var_boolean_noconn":
                    case "devices_boolean":
                    case "devices_boolean_noconn":
                        len = Abbozza.getLen(block);
                        funcBlock.symbols.addArray(name, "BOOLEAN", len, parameter, block.getCommentText());
                        // if ( parameter == false )
                        // 	funcBlock.appendDummyInput(inputName+no).appendField(_("BOOLEAN")  + " " + name + Abbozza.lenAsString(len));
                        // else {
                        // 	params = params + ", " + keyword("BOOLEAN") + " " + name;
                        // }
                        break;
                    default:
                        throw "Unknown variable type";
                }
                // if (( parameter == false) && funcBlock.getInput("STATEMENTS")) funcBlock.moveInputBefore(inputName+no,"STATEMENTS");
            }
        }
        no++;
        block = block.nextConnection && block.nextConnection.targetBlock();
    }

    /*
     if ( (parameter == true) && funcBlock.getField_("PARAMS") ) {
     params = params.substring(2);
     funcBlock.getField_("PARAMS").setText(params);
     }*/

}

/**
 * Decomposes the symbols list of the given function an constructs the declaration block
 * 
 *  workspace: the Workspace of the control block
 *  funcBlock: the function/variable block
 *  title: title of the control block
 */
Abbozza.decomposeSymbols = function (workspace, funcBlock, title, parameters) {
    var topBlock;

    if (parameters == false) {
        // ISR function
        if ( funcBlock.type == "int_isr") {
            topBlock = workspace.newBlock("int_isr_control"); // Blockly.Block.obtain(workspace,"devices_control");            
        } else {
            // Global variables
            topBlock = workspace.newBlock("devices_control"); // Blockly.Block.obtain(workspace,"devices_control");
        }
    } else {
        // regular function
        topBlock = workspace.newBlock("func_decl_control"); // Blockly.Block.obtain(workspace,"func_decl_control");
    }
    
    topBlock.setTitle(title);

    topBlock.initSvg();
    topBlock.symbols = funcBlock.symbols;

    workspace.symbols = funcBlock.symbols;

    workspace.oldDispose = workspace.dispose;
    workspace.dispose = function () {
        // funcBlock.compose(topBlock);
        this.oldDispose();
    }

    // Treat variables
    Abbozza.decomposeSymbolsAtInput("VARS", workspace, topBlock, funcBlock);
    Abbozza.decomposeSymbolsAtInput("PARS", workspace, topBlock, funcBlock);

    return topBlock;
};


/**
 * Constructs the blocks for parameters and variables of the given declaration block
 * @param {type} name
 * @param {type} workspace
 * @param {type} controlBlock
 * @param {type} funcBlock
 * @returns {undefined}
 */
Abbozza.decomposeSymbolsAtInput = function (name, workspace, controlBlock, funcBlock) {
    // topBlock = controlBlock
    // funcBlock = funcBlock
    var input = controlBlock.getInput(name);
    if (input == null)
        return;

    var connection = input.connection;
    var variables;
    if (name == "VARS") {
        variables = funcBlock.symbols.getVariables(true);
    } else {
        variables = funcBlock.symbols.getParameters(true);
    }

    // Abbozza.log(funcBlock.symbols);
    // Abbozza.log(variables);

    for (var i = 0; i < variables.length; i++) {
        var entry = variables[i];
        var block = null;
        var dim = null;
        var ndim = null;
        switch (entry[1]) {
            case "NUMBER":
                if ((entry[2] == null) && (Configuration.getParameter("option.noArrays") == "true")) {
                    block = workspace.newBlock("var_num_noconn"); // Blockly.Block.obtain(workspace,"devices_num_noconn");                                    
                } else {
                    block = workspace.newBlock("var_num"); // Blockly.Block.obtain(workspace,"devices_num");
                }
                block.getField("NAME").setText(entry[0]);
                break;
            case "STRING":
                if ((entry[2] == null) && (Configuration.getParameter("option.noArrays") == "true")) {
                    block = workspace.newBlock("var_string_noconn"); // Blockly.Block.obtain(workspace,"devices_string_noconn");                                    
                } else {
                    block = workspace.newBlock("var_string"); // Blockly.Block.obtain(workspace,"devices_string");
                }
                block.getField("NAME").setText(entry[0]);
                break;
            case "DECIMAL":
                if ((entry[2] == null) && (Configuration.getParameter("option.noArrays") == "true")) {
                    block = workspace.newBlock("var_decimal_noconn"); // Blockly.Block.obtain(workspace,"devices_decimal_noconn");                                    
                } else {
                    block = workspace.newBlock("var_decimal"); // Blockly.Block.obtain(workspace,"devices_decimal");
                }
                block.getField("NAME").setText(entry[0]);
                break;
            case "BOOLEAN":
                if ((entry[2] == null) && (Configuration.getParameter("option.noArrays") == "true")) {
                    block = workspace.newBlock("var_boolean_noconn"); // Blockly.Block.obtain(workspace,"devices_boolean_noconn");                                    
                } else {
                    block = workspace.newBlock("var_boolean"); // Blockly.Block.obtain(workspace,"devices_boolean");
                }
                block.getField("NAME").setText(entry[0]);
        }
        if (block) {
            if ((entry[4] != null) && (entry[4] != "")) {
                block.setCommentText(entry[4]);
            }
            if (name == "PARS") {
                if (block.getInput("DIM")) {
                    block.getInput("DIM").type = Blockly.DUMMY_INPUT;
                }
            } else {
                if (block.getInput("DIM")) {
                    block.getInput("DIM").type = Blockly.INPUT_VALUE;
                }
            }
            block.initSvg();
            connection.connect(block.previousConnection);
            connection = block.nextConnection;
            if (entry[2] != null) {
                for (var j = entry[2].length - 1; j >= 0; j--) {
                    ndim = workspace.newBlock("arr_dimension"); // Blockly.Block.obtain(workspace,"arr_dimension");
                    ndim.initSvg();
                    ndim.getField("LEN").setText(entry[2][j].toString());
                    if (dim != null) {
                        var input = ndim.getInput("DIM");
                        input.connection.connect(dim.outputConnection);
                    }
                    dim = ndim;
                }
                input = block.getInput("DIM");
                input.connection.connect(dim.outputConnection);
            }
        }
    }
}

/**
 * Deletes all inputs forma given block.
 * 
 * @param {type} block
 * @param {type} prefix
 * @returns {Number}
 */
Abbozza.deleteInputs = function (block, prefix) {
    var no = 0;
    while (block.getInput(prefix + no)) {
        if (block.getInputTargetBlock()) {
            block.getInputTargetBlock().unplug(true, true);
        }
        block.removeInput(prefix + no);
        no++;
    }
    return no;
}

/**
 * Covert a length into pixels.
 * 
 * @param {string} length The length to be converted (as string)
 * @param {Element} element The element to which the length relates
 * @returns {number} the length in pixels
 */
Abbozza.toPx = function(length, element) {
    var reg = /^(-?[\d+\.\-]+)([a-z]*|%)$/i;
    if ( !length ) return 0;
    if ( typeof length == "number" ) return length;
    if ( typeof length == "string" ) {
        var matches = length.match(reg);
        var unit = matches[2];
        var value = Number(matches[1]);
        if ( unit == "pt" ) {
            value = 4.0*value/3.0;
        } else if ( unit == "pc") {
            value =  16.0*value;
        } else if ( unit == "em") {
            var px = window.getComputedStyle(element,null).fontSize.match(reg)[1];
            value = value * px;
        }
        return value;
    }
}

/**
 * This operation patches the original Blockly dispose.
 * The first block to be removed is removed from the workspace after its children.
 * 
 * @param {type} healStack
 * @returns {undefined}
 */
Blockly.Block.prototype.dispose = function (healStack) {
    if (!this.workspace) {
        // Already deleted.
        return;
    }
    // Terminate onchange event calls.
    if (this.onchangeWrapper_) {
        this.workspace.removeChangeListener(this.onchangeWrapper_);
    }
    this.unplug(healStack);
    if (Blockly.Events.isEnabled()) {
        Blockly.Events.fire(new Blockly.Events.Delete(this));
    }
    Blockly.Events.disable();

    try {
        // Just deleting this block from the DOM would result in a memory leak as
        // well as corruption of the connection database.  Therefore we must
        // methodically step through the blocks and carefully disassemble them.

        // First, dispose of all my children.
        for (var i = this.childBlocks_.length - 1; i >= 0; i--) {
            this.childBlocks_[i].dispose(false);
        }
        // 
        // This block is now at the top of the workspace.
        // Remove this block from the workspace's list of top-most blocks.
        if (this.workspace) {
            this.workspace.removeTopBlock(this);
            // Remove from block database.
            delete this.workspace.blockDB_[this.id];
            this.workspace = null;
        }

        // Then dispose of myself.
        // Dispose of all inputs and their fields.
        for (var i = 0, input; input = this.inputList[i]; i++) {
            input.dispose();
        }
        this.inputList.length = 0;
        // Dispose of any remaining connections (next/previous/output).
        var connections = this.getConnections_(true);
        for (var i = 0; i < connections.length; i++) {
            var connection = connections[i];
            if (connection.isConnected()) {
                connection.disconnect();
            }
            connections[i].dispose();
        }
    } finally {
        Blockly.Events.enable();
    }
};


/**
 * Position the bubble realtive to the anchor.
 * @private
 */
Blockly.Bubble.prototype.layoutBubble_ = function () {
    this.relativeLeft_ = 50;
    this.relativeTop_ = 20;
};


/**
 * 
 */
Abbozza.domToBlockHeadless_ = Blockly.Xml.domToBlockHeadless_;

Blockly.Xml.domToBlockHeadless_ = function(xmlBlock, workspace) {
    var type = xmlBlock.getAttribute("type");
    if ( !Blockly.Blocks[type] ) {
        Abbozza.missingBlocks.push(type);
        xmlBlock.setAttribute("type","unknown");
    }
    var block = Abbozza.domToBlockHeadless_(xmlBlock,workspace);
    xmlBlock.setAttribute("type",type);    
    return block;
}


Blockly.createSvgElement = function(name, attrs, parent) {
    console.log("Blockly.createSvgElement changed to Blockly.utils.createSvgElement");
    return Blockly.utils.createSvgElement(name, attrs, parent);
}
