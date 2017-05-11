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

/**
 * Activating interrupts
 */
Abbozza.Interrupts = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.INT"));
    this.appendDummyInput()
        .appendField(__("int.INTERRUPTS",0));
    this.setInputsInline(true);   
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
	return "interrupts();";
  }
}

/**
 * Deactivating interrupts
 */
Abbozza.NoInterrupts = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.INT"));
    this.appendDummyInput()
        .appendField(__("int.NOINTERRUPTS",0));
    this.setInputsInline(true);   
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
	return "noInterrupts();";
  }
}

/**
 * Attaching operation to interrupt
 */
Abbozza.AttachInterrupt = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.INT"));
    this.appendDummyInput()
    	.appendField(__("int.ATTACH",0))
        .appendField(new PinDropdown(PinDropdown.INTERRUPTS), "PIN")
    	.appendField(__("int.ATTACH",1))
        .appendField(new FunctionDropdown(this, null,true), "ISR")
    	.appendField(__("int.ATTACH",2))
        .appendField(new Blockly.FieldDropdown([[_("int.CHANGE"),"CHANGE"],[_("int.LOW"), "LOW"], [_("int.HIGH"), "HIGH"], [_("int.RISING"), "RISING"],[_("int.FALLING"),"FALLING"]]), "TYPE");
    this.setInputsInline(true);   
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
    var pin = generator.fieldToCode(this,"PIN"); 
    var name =  generator.fieldToCode(this,"ISR");
    var type =  generator.fieldToCode(this,"TYPE");
    

    var symbols = this.getRootBlock().symbols;
    var symbol = symbols.exists(name);
    if ( !symbol || symbol[3] != symbols.ISR_SYMBOL) {
        ErrorMgr.addError(this,_("err.WRONG_NAME")+": " + name );
    }
    
    return "attachInterrupt(" + pin + "," + name + "," + type + ");";
  }
}


/**
 * Attaching operation to interrupt
 */
Abbozza.DetachInterrupt = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.INT"));
    this.appendDummyInput()
    	.appendField(__("int.DETACH",0))
        .appendField(new PinDropdown(PinDropdown.INTERRUPT), "PIN");
    this.setInputsInline(true);   
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
    var pin = generator.fieldToCode(this,"PIN"); 
    return "detachInterrupt(" + pin + ");";
  }
}


Abbozza.ISRDecl = {
    symbols: null,
    name: "<name>",
    rettype: "VOID",
    init: function () {
        var thisBlock = this;
        this.symbols = new SymbolDB(this.workspace.globalSymbols);
        this.symbols.parentBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.INT"));
        this.appendDummyInput()
                .appendField(this.getSignature(), "SIGNATURE");
        this.appendStatementInput("STATEMENTS")
                .setCheck("STATEMENT");
        this.setTooltip('');
        this.setMutator(new DynamicMutator(function () {
            if (Configuration.getParameter("option.noArrays") == "true") {
                return ['devices_num_noconn', 'devices_string_noconn', 'devices_decimal_noconn', 'devices_boolean_noconn'];
            } else if (Configuration.getParameter("option.linArrays") == "true") {
                return ['devices_num', 'devices_string', 'devices_decimal', 'devices_boolean', 'arr_dimension_noconn'];
            } else {
                return ['devices_num', 'devices_string', 'devices_decimal', 'devices_boolean', 'arr_dimension'];
            }
        }));
        Abbozza.addDisposeHandler(this);
    },
    
    setTitle: function () {
    },
    
    /*
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
    */
   
    setSymbolDB: function (db) {
        this.symbols = db;
        this.symbols.parentBlock = this;
    },
    generateCode: function (generator) {
        var statements = generator.statementToCode(this, 'STATEMENTS', "   ");
        var code = "";
        var sig = "void " + this.name + "()";
        code = code + sig + " {\n";
        code = code + generator.variablesToCode(this.symbols,"   ");
        code = code + statements;
        code = code + "\n}\n";
        return code;
    },

    /*
    check: function (block) {
        return "Test";
    },
    */
   
    getSignature: function () {
        var signature = "void " + this.name + "()";
        return signature;
    },
    
    compose: function (topBlock) {
        var nameField = topBlock.getField("NAME");
        if (nameField.editing == true)
            return;

        Abbozza.composeSymbols(topBlock, this);
        this.name = topBlock.getFieldValue("NAME");
        this.setFieldValue(this.getSignature(), "SIGNATURE");

        Abbozza.collectFunctions();
    },
    
    decompose: function (workspace) {
        var topBlock = Abbozza.decomposeSymbols(workspace, this, _("LOCALVARS"), false);
        
        // deactivate validator for initialization
        var val = topBlock.getField("NAME").getValidator();
        topBlock.getField("NAME").setValidator(null);
        topBlock.setFieldValue(this.name, "NAME");
        // reactivate validator
        topBlock.getField("NAME").setValidator(val);
        
        return topBlock;
    },
    
    mutationToDom: function () {
        var mutation = document.createElement('mutation');
        var child = document.createElement('name');
        child.setAttribute("name", this.name);
        mutation.appendChild(child);
        child = document.createElement('type');
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




/**
 * Block for the definition of local variables, parameters and return type
 */
Abbozza.ISRDeclControl = {
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getColor("cat.INT"));
        this.appendDummyInput()
                .appendField(_("func.NAME"))
                .appendField(new FieldNameInput("<name>", Abbozza.globalSymbols, Abbozza.globalSymbols.FUN_SYMBOL), "NAME");
        this.appendDummyInput()
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(_("LOCALVARS"));
        this.appendStatementInput("VARS").setCheck("VAR_DECL");
        this.setTooltip('');
    },
    setTitle: function (title) {
    }

};

Blockly.Blocks['int_isr_control'] = Abbozza.ISRDeclControl;
Blockly.Blocks['int_isr'] = Abbozza.ISRDecl;
Blockly.Blocks['int_interrupts'] = Abbozza.Interrupts;
Blockly.Blocks['int_no_interrupts'] = Abbozza.NoInterrupts;
Blockly.Blocks['int_attach'] = Abbozza.AttachInterrupt;
Blockly.Blocks['int_detach'] = Abbozza.DetachInterrupt;
