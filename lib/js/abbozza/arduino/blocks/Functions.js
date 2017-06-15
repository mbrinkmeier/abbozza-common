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
 * @fileoverview Blocks for functions
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * Block for the declaration of functions
 */
Abbozza.FuncDecl = {
    symbols: null,
    name: "<name>",
    rettype: "VOID",
    init: function () {
        var thisBlock = this;
        this.symbols = new SymbolDB(this.workspace.globalSymbols);
        this.symbols.parentBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.FUNC"));
        this.appendDummyInput()
                .appendField(this.getSignature(), "SIGNATURE");
        this.appendStatementInput("STATEMENTS")
                .setCheck("STATEMENT");
        this.setTooltip('');
        var varPar = Configuration.getParameter("option.localVars");
        if ( varPar=="true") {
           this.setMutator(new DynamicMutator(function () {
               if (Configuration.getParameter("option.noArrays") == "true") {
                   return ['devices_num_noconn', 'devices_string_noconn', 'devices_decimal_noconn', 'devices_boolean_noconn'];
               } else if (Configuration.getParameter("option.linArrays") == "true") {
                   return ['devices_num', 'devices_string', 'devices_decimal', 'devices_boolean', 'arr_dimension_noconn'];
               } else {
                   return ['devices_num', 'devices_string', 'devices_decimal', 'devices_boolean', 'arr_dimension'];
               }
           }));
        }
        Abbozza.addDisposeHandler(this);
    },
    setTitle: function () {
    },
    typeHandler: function (type) {
        var block = this.sourceBlock_;
        var name = block.getFieldValue("NAME");
        block.symbols.setType(name, type);
    },
    nameHandler: function (name, oldName) {
        if (name != oldName) {
            var block = this.sourceBlock_;
            block.symbols.parentDB.delete(oldName);
            var rettype = block.getFieldValue("TYPE");
            block.symbols.parentDB.addFunction(name, type);
        }
    },
    setSymbolDB: function (db) {
        this.symbols = db;
        this.symbols.parentBlock = this;
    },
    generateCode: function (generator) {
        var statements = generator.statementToCode(this, 'STATEMENTS', "   ");

        var code = "";

        var sig = keyword(this.rettype) + " " + this.name + "(";
        var spaces = "";
        for (var j = 0; j < sig.length - 1; j++)
            spaces = spaces + " ";
        code = code + sig;


        var pars = generator.parametersToCode(this.symbols,spaces);
       
        code = code + pars + "{\n";
        code = code + generator.variablesToCode(this.symbols,"   ");
        code = code + statements;
        
        if ( this.getInput("RETURN") ) {
            var returncode = generator.valueToCode(this,"RETURN");
            code = code + "\n   return " + returncode + ";";
        }
        code = code + "\n}\n";
        return code;
    },
    check: function (block) {
        return "Test";
    },
    getSignature: function () {
        var parameters = this.symbols.getParameters(true);
        var pars = "";
        for (var i = 0; i < parameters.length; i++) {
            pars = pars + keyword(parameters[i][1]) + " " + parameters[i][0] +
                    Abbozza.lenAsString(parameters[i][2]);
            if (i < parameters.length - 1)
                pars = pars + ", ";
        }
        var signature = keyword(this.rettype) + " " + this.name + "(" + pars + ")";
        return signature;
    },
    compose: function (topBlock) {
        var nameField = topBlock.getField("NAME");
        if (nameField.editing == true)
            return;

        Abbozza.composeSymbols(topBlock, this);
        this.name = topBlock.getFieldValue("NAME");        
        this.rettype = topBlock.getFieldValue("TYPE");
        if ( this.rettype == "VOID" && this.getInput("RETURN")) {
            this.removeInput("RETURN");
                this.render();
        }
        if ( this.rettype != "VOID" ) {
            if ( !this.getInput("RETURN") ) {
                this.appendValueInput("RETURN")
                    .appendField(_("func.RETURN"))
                    .setAlign(Blockly.ALIGN_RIGHT)
                    .setCheck(this.rettype);
                this.render();
            } else {
                this.getInput("RETURN")
                    .setAlign(Blockly.ALIGN_RIGHT)
                    .setCheck(this.rettype);
                this.render();
            }
        }
        this.setFieldValue(this.getSignature(), "SIGNATURE");

        Abbozza.collectFunctions();
    },
    decompose: function (workspace) {
        var topBlock = Abbozza.decomposeSymbols(workspace, this, _("LOCALVARS"), true);
        
        // deactivate validator for initialization
        var val = topBlock.getField("NAME").getValidator();
        topBlock.getField("NAME").setValidator(null);
        topBlock.setFieldValue(this.name, "NAME");
        // reactivate validator
        topBlock.getField("NAME").setValidator(val);
        
        topBlock.setFieldValue(this.rettype, "TYPE");
        return topBlock;
    },
    mutationToDom: function () {
        var mutation = document.createElement('mutation');
        var child = document.createElement('name');
        child.setAttribute("name", this.name);
        mutation.appendChild(child);
        child = document.createElement('type');
        child.setAttribute("type", this.rettype);
        mutation.appendChild(child);
        mutation.appendChild(this.symbols.toDOM());
        return mutation;
    },
    
    domToMutation: function (xmlElement) {
        var child;
        for (var i = 0; i < xmlElement.childNodes.length; i++) {
            child = xmlElement.childNodes[i];
            if (child.tagName == 'symbols') {
                if (this.symbols == null) {
                    this.setSymbolDB(new SymbolDB(null, this));
                }
                this.symbols.fromDOM(child);
            } else if (child.tagName == "name") {
                this.name = child.getAttribute("name");
            } else if (child.tagName == "type") {
                this.rettype = child.getAttribute("type");
            }
        }
        this.setFieldValue(this.getSignature(), "SIGNATURE");
    },
    updateLook: function () {
        var no = Abbozza.deleteInputs(this, "VAR");

        var no = 0;
        var params = "";
        var entry;
        var variables = this.symbols.getSymbols();
        for (var i = 0; i < variables.length; i++) {
            entry = variables[i];
            if (entry[3] == this.symbols.VAR_SYMBOL) {
                this.appendDummyInput("VAR" + no).appendField(_(entry[1]) + " " + entry[0] + Abbozza.lenAsString(entry[2]));
                if (this.getInput("STATEMENTS"))
                    this.moveInputBefore("VAR" + no, "STATEMENTS");
                no++;
            } else if (entry[3] == this.symbols.PAR_SYMBOL) {
                params = params + ", " + entry[1] + " " + entry[0];
            }
        }

        params = params.substring(2);
    },

    onDispose: function () {
        Abbozza.globalSymbols.delete(this.name);
    }


};


Blockly.Blocks['func_decl'] = Abbozza.FuncDecl;



/**
 * Function call
 */
Abbozza.FunctionCall = {
    callLabel: null,
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getColor("cat.FUNC"));
        var thisBlock = this;
        this.callLabel = new Blockly.FieldLabel(__("func.CALL", 0));
        this.callLabel2 = new Blockly.FieldLabel(__("func.CALL", 1));
        this.appendDummyInput("INP")
                .appendField(this.callLabel)
                .appendField(new FunctionDropdown(this, function (entry) {
                    thisBlock.refitInputs(entry);
                }), "NAME")
                .appendField(this.callLabel2);
        this.setInputsInline(true);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    onchange: function() {
        var name = this.getFieldValue("NAME");
        // this.refitInputs(name);
    },
    refitInputs: function (name) {
        var symbol = Abbozza.getGlobalSymbol(name);

        if (symbol == null)
            return;

        var no = Abbozza.deleteInputs(this, "PAR");

        var funcBlock = Abbozza.getTopBlock(name);
        if (name == null)
            return;

        if (funcBlock.symbols == null) return;
        
        var parameters = funcBlock.symbols.getParameters(true);
        var inp;

        var localeEntry = "func.CALL";
        if (symbol[1] != "VOID") {
            localeEntry = "func.RETURNS";
        }

        this.callLabel.setText(__(localeEntry, 0));
        if (parameters.length == 0) {
            this.setInputsInline(true);
        } else {
            this.setInputsInline(false);
            for (no = 0; no < parameters.length; no++) {
                inp = this.appendValueInput("PAR" + no)
                          .setCheck(parameters[no][1])
                          .appendField(parameters[no][0])
                          .setAlign(Blockly.ALIGN_RIGHT);
            }           
        }

        if (symbol[1] != "VOID") {
            if (this.outputConnection != null) {
                // already had output				
                this.setOutput(true,symbol[1]);
            } else {
                // was a statement
                this.unplug(true, true);
                this.setPreviousStatement(false);
                this.setNextStatement(false);
                this.setOutput(true, symbol[1]);
            }
        } else {
            if (this.outputConnection != null) {
                // had output
                this.unplug(true, true);
                this.setOutput(false, "STATEMENT");
                this.setPreviousStatement(true, "STATEMENT");
                this.setNextStatement(true, "STATEMENT");
            } else {
                // was statement -> nothing happens
            }

        }

    },
    mutationToDom: function () {
        var mutation = document.createElement('mutation');
        var name = this.getFieldValue("NAME");
        mutation.setAttribute("name", name);
       
        // Write parameters to DOM

        var symbol = Abbozza.getGlobalSymbol(name);

        if (symbol == null) {
            mutation.setAttribute("type", "VOID");
            return mutation;
        }

        var no = 0;

        var funcBlock = Abbozza.getTopBlock(name);
        if (name == null)
            return;

        var parameters = funcBlock.symbols.getParameters(true);
        var el;
        var t;

        for (no = 0; no < parameters.length; no++) {
            el = document.createElement("par");
            el.setAttribute("type", parameters[no][1]);
            el.setAttribute("name", parameters[no][0])
            mutation.appendChild(el);
        }

        mutation.setAttribute("type", symbol[1]);

        return mutation;
    },
    domToMutation: function (xmlElement) {
        var name = xmlElement.getAttribute("name");
        var type = xmlElement.getAttribute("type");

        var parameters = xmlElement.getElementsByTagName("par");
        var inp;

        var no = Abbozza.deleteInputs(this, "PAR");

        var localeEntry = "func.CALL";
        if (type != "VOID") {
            localeEntry = "func.RETURNS";
        }

        this.callLabel.setText(__(localeEntry, 0));

        if (parameters[0] == null) {
            this.setInputsInline(true);
        } else {
            no = 0;
            while (parameters[no]) {
                this.setInputsInline(false);
                inp = this.appendValueInput("PAR" + no).
                      setCheck(parameters[no].getAttribute("type"));
                inp.appendField(parameters[no].getAttribute("name"));
                inp.setAlign(Blockly.ALIGN_RIGHT);
                no++;
            }
            // this.appendDummyInput("PAR" + no).appendField(") " + __(localeEntry, 1));
        }
       
        if (type != "VOID") {
            this.setPreviousStatement(false);
            this.setNextStatement(false);
            this.setOutput(true, type);
        } else {
            this.setOutput(false, "STATEMENT");
            this.setPreviousStatement(true, "STATEMENT");
            this.setNextStatement(true, "STATEMENT");
        } 
    },
    generateCode: function (generator) {
        var code = "";
        var name = generator.fieldToCode(this, "NAME");
        
        var symbols = this.getRootBlock().symbols;
        var symbol = symbols.exists(name);
        if ( !symbol || ((symbol[3] != symbols.FUN_SYMBOL) && (symbol[3] != symbols.ISR_SYMBOL)) ) {
            ErrorMgr.addError(this,_("err.WRONG_NAME")+": " + name);
        }

        var block;

        code = name + "(";
        var no = 0;
        var par;
        var inp;
        while (inp = this.getInput("PAR" + no)) {
            if (inp.type == Blockly.INPUT_VALUE) {
                par = generator.valueToCode(this, "PAR" + no);
                if (no != 0)
                    code = code + ",";
                code = code + par;
            }
            no++;
        }
        code = code + ")";
        
        if ( symbol[1] == "VOID" ) {
            code = code +";";
        }
        
        return code;
    }


};

Blockly.Blocks['func_call'] = Abbozza.FunctionCall;


/**
 * Block for the definition of local variables, parameters and return type
 */
Abbozza.FunctionDeclControl = {
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getColor("cat.FUNC"));
        this.appendDummyInput()
                .appendField(_("func.NAME"))
                .appendField(new FieldNameInput("<name>", Abbozza.globalSymbols, Abbozza.globalSymbols.FUN_SYMBOL), "NAME");
        this.appendDummyInput()
                .appendField(_("func.RETURNTYPE"))
                .appendField(new Blockly.FieldDropdown(Abbozza.Generator.typeList), "TYPE");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(_("func.PARAMETER"));
        this.appendStatementInput("PARS").setCheck("VAR_DECL");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(_("LOCALVARS"));
        this.appendStatementInput("VARS").setCheck("VAR_DECL");
        this.setTooltip('');
    },
    setTitle: function (title) {
    }

};

Blockly.Blocks['func_decl_control'] = Abbozza.FunctionDeclControl;

/**
 * Return statement
 */

Abbozza.FunctionReturn = {
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getColor("cat.FUNC"));
        this.appendValueInput("VALUE")
                .appendField(_("func.RETURN"));
        this.setPreviousStatement(true, "STATEMENT");
        this.setTooltip('');
    },
    onchange: function() {
        var root = this.getRootBlock();
        if ( root && root.rettype ) {
            this.getInput("VALUE").setCheck(root.rettype);
            this.render(true);
        } else {
            this.getInput("VALUE").setCheck("VOID");
            this.render(true);
        }
    },
    generateCode: function (generator) {
        var code = "";
        var result = "";
        var root = this.getRootBlock();
        if ( root && root.rettype && root.rettype != "VOID") {   
            result = " " + generator.valueToCode(this, "VALUE");
        }
        code = code + "return" + result + ";";
        if ( this.getRootBlock() ) {
            var root = this.getRootBlock();
            if ( root.type == "main" ) {
                // Ignore the return statement if in main block
                code = "/* " + code + " */";
            }
        }
        return code;
    }

};

Blockly.Blocks['func_return'] = Abbozza.FunctionReturn;

