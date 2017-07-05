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
 * @fileoverview The global variable blocks
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Abbozza.VariableDecl = {
    title: "<title>",
    symbols: null,
    // test: "",

    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.appendDummyInput().appendField(_("DEVICES"));
        this.appendStatementInput("DEVICES")
                .setCheck("DEVICE");
        this.setTooltip('');
        /*		this.setMutator(new DynamicMutator( function() {
         if ( Configuration.getParameter("option.noArrays") == "true") {
         return ['devices_num_noconn', 'devices_string_noconn','devices_decimal_noconn', 'devices_boolean_noconn'];			
         } else if ( Configuration.getParameter("option.linArrays") == "true" ) {
         return ['devices_num', 'devices_string','devices_decimal', 'devices_boolean','arr_dimension_noconn'];			
         } else {
         return ['devices_num', 'devices_string','devices_decimal', 'devices_boolean','arr_dimension'];
         }
         }));*/
        this.setDeletable(false);
    },
    // customContextMenu : function (menu) {},
    setSymbolDB: function (db) {
        this.symbols = db;
    },
    setTitle: function (title) {
        this.title = title;
        this.getField("TITLE").setText(title);
   },
    compose: function (topBlock) {
        Abbozza.composeSymbols(topBlock, this);
    },
    decompose: function (workspace) {
        return Abbozza.decomposeSymbols(workspace, this, _("GLOBALVARS"), false);
    },
    generateSetupCode: function (generator) {
        this.checkDevices();
        var statements = generator.statementToCode(this, 'DEVICES', "   ");
        return statements;
    },
    generateCode: function (generator) {
        this.checkDevices();
        var statements = generator.statementToCode(this, 'DEVICES', "   ");
        generator.addSetupCode(statements);
        return "";
    },
    check: function (block) {
        return "Test";
    },
    /*
     mutationToDom: function() {
     // Abbozza.log("variables to Dom")
     var mutation = document.createElement('mutation');
     var title = document.createElement('title');
     title.appendChild(document.createTextNode(this.title));
     mutation.appendChild(title);
     mutation.appendChild(this.symbols.toDOM());
     // Abbozza.log(mutation);
     return mutation;
     },
     
     
     domToMutation: function(xmlElement) {
     var child;
     // Abbozza.log("variables from Dom")
     for ( var i = 0; i < xmlElement.childNodes.length; i++) {
     child = xmlElement.childNodes[i];
     // Abbozza.log(child);
     if ( child.tagName == 'symbols') {
     if ( this.symbols == null ) {
     this.setSymbolDB(new SymbolDB(null,this));
     }
     this.symbols.fromDOM(child);
     // Abbozza.log(this.symbols);
     } else if ( child.tagName == 'title' ) {
     // Abbozza.log("title : " + child.textContent);
     this.setTitle(child.textContent);
     }
     }
     },
     */

    getDevices: function () {
        var devices = [];
        var current = this.getInputTargetBlock("DEVICES");
        while (current) {
            devices.push(current);
            current = current.getNextBlock();
        }
        return devices;
    },
    getDevicesByType: function (devtype) {
        var devices = [];
        var current = this.getInputTargetBlock("DEVICES");
        while (current) {
            if (current.devtype == devtype) {
                // devices.push([current.getFieldValue("NAME"),current]);
                devices.push([current.getFieldValue("NAME"), current.getFieldValue("NAME")]);
            }
            current = current.getNextBlock();
        }
        if (devices.length == 0) {
            return [["<name>", "<name>"]];
        }
        return devices;
   },
    getDevice: function (name) {
        var current = this.getInputTargetBlock("DEVICES");
        while (current) {
            if (current.getFieldValue("NAME") == name) {
                return current;
            }
            current = current.getNextBlock();
        }
        return null;
    },
    checkDevices: function () {
        var devices = this.getDevices();
        for (var i = devices.length - 1; i >= 1; i--) {
            for (var j = 0; j < i; j++) {
                if (devices[i].getFieldValue("NAME") == devices[j].getFieldValue("NAME")) {
                    ErrorMgr.addError(devices[i], _("err.DEVICE"));
                    break;
                }
            }
        }
    }

};


Blockly.Blocks['devices'] = Abbozza.VariableDecl;





Abbozza.VariableDeclControl = {
    // variables: null,
    title: "",
    init: function () {
        this.setHelpUrl(Abbozza.HERLP_URL);
        this.setColour(ColorMgr.getCatColor("cat.VAR"));
        this.appendDummyInput().appendField(this.title, "TITLE");
        this.appendStatementInput("VARS")
                .setCheck("VAR_DECL");
        this.setTooltip('');
    },
    setTitle: function (title) {
        this.title = title;
        this.getField("TITLE").setText(title);
    }
};

Blockly.Blocks['devices_control'] = Abbozza.VariableDeclControl;
Blockly.Blocks['var_control'] = Abbozza.VariableDeclControl;

