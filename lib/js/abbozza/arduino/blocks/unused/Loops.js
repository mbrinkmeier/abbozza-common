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
 * @fileoverview Various blocks providing loops.
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * Infinite Loop
 */
Abbozza.LoopEndless = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendDummyInput()
                .appendField(_("loop.ENDLESS"));
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    },
    generateCode: function (generator) {
        var code = "";
        var statements = generator.statementToCode(this, "STATEMENTS", "   ");

        // if ( AbbozzaGenerator.ERROR) return null;

        code = "while (true) {\n";
        code = code + statements + "\n";
        code = code + "}\n";

        return code;
    }

};

Blockly.Blocks['loop_endless'] = Abbozza.LoopEndless;

/**
 * while - loop
 */
Abbozza.LoopWhile = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("CONDITION")
                .setCheck("BOOLEAN")
                .appendField(_("loop.WHILE"));
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
  },
    generateCode: function (generator) {
        var code = "";
        var condition = generator.valueToCode(this, "CONDITION");
        var statements = generator.statementToCode(this, "STATEMENTS", "   ");

        // if ( AbbozzaGenerator.ERROR) return null;

        code = "while (" + condition + ") {\n";
        code = code + statements + "\n";
        code = code + "}\n";

        return code;
    }

};

Blockly.Blocks['loop_while'] = Abbozza.LoopWhile;

/**
 * do-while-loop
 */
Abbozza.LoopDoWhile = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendDummyInput()
                .appendField(_("loop.REPEAT"));
        this.appendStatementInput("STATEMENTS");
        this.appendValueInput("CONDITION")
                .setCheck("BOOLEAN")
                .appendField(_("loop.ASLONG"));
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
  },
    generateCode: function (generator) {
        var code = "";
        var condition = generator.valueToCode(this, "CONDITION");
        var statements = generator.statementToCode(this, "STATEMENTS", "   ");

        // if ( AbbozzaGenerator.ERROR) return null;

        code = "do {\n";
        code = code + statements + "\n";
        code = code + "} while (" + condition + ");";

        return code;
    }

};

Blockly.Blocks['loop_do_while'] = Abbozza.LoopDoWhile;

/**
 * break
 */
Abbozza.LoopBreak = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendDummyInput()
                .appendField(_("loop.BREAK"));
        this.setPreviousStatement(true);
        this.setNextStatement(false);
        this.setTooltip('');
  },
    generateCode: function (generator) {
        var code = "break;";

        return code;
    }

};

Blockly.Blocks['loop_break'] = Abbozza.LoopBreak;

/**
 * Counting loop with a counting variable number of repetitions.
 */
Abbozza.LoopCount = {
    init: function () {
        var thisBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
//    this.appendValueInput("COUNTER")
//        .setCheck("VARNUMBER")
//        .appendField(_("COUNT"));
        this.appendValueInput("FROM")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT", 0))
                .appendField(new VariableTypedDropdown(thisBlock, "NUMBER", null), "VAR")
                .appendField(__("loop.COUNT", 1));
        this.appendValueInput("TO")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT", 2));
        this.appendValueInput("STEP")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT", 3));
        this.setInputsInline(true);
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    },
    generateMenu: function () {
        console.log(this);
        symbols = Abbozza.getSymbols(this);
        return symbols.getVariables("NUMBER", true);
    },
    generateCode: function (generator) {
        var code = "";
        var variable = generator.fieldToCode(this,"VAR");
        var from = generator.valueToCode(this, "FROM");
        var to = generator.valueToCode(this, "TO");
        var step = generator.valueToCode(this, "STEP");
        var statements = generator.statementToCode(this, "STATEMENTS", "   ");

        // if ( AbbozzaGenerator.ERROR) return null;

        code = "for (" + variable + " = " + from + "; " + variable + " <= " + to + " ; " + variable + " = " + variable + " + (" + step + ")) {\n";
        code = code + statements + "\n";
        code = code + "}\n";

        return code;
    }

};

Blockly.Blocks['loop_count'] = Abbozza.LoopCount;


/**
 * Counting loop with a counting variable number of repetitions.
 */
Abbozza.LoopCountDir = {
    init: function () {
        var thisBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
//    this.appendValueInput("COUNTER")
//        .setCheck("VARNUMBER")
//        .appendField(_("COUNT"));
        this.appendValueInput("FROM")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT", 0))
                .appendField(new VariableTypedDropdown(thisBlock, "NUMBER", null), "VAR")
                .appendField( new Blockly.FieldDropdown([[_("loop.ASCENDING"),"ASC"],[_("loop.DESCENDING"),"DESC"]]),"DIR")
                .appendField(__("loop.COUNT", 1));
        this.appendValueInput("TO")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT", 2));
        this.setInputsInline(true);
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    },
    generateMenu: function () {
        console.log(this);
        symbols = Abbozza.getSymbols(this);
        return symbols.getVariables("NUMBER", true);
    },
    generateCode: function (generator) {
        var code = "";
        var variable = generator.fieldToCode(this,"VAR");
        var from = generator.valueToCode(this, "FROM");
        var to = generator.valueToCode(this, "TO");
        var dir = generator.fieldToCode(this, "DIR");
        var step = 1;
        var rel = "<=";
        if ( dir == "DESC" ) {
            rel = ">=";
            step = -1;
        }
        var statements = generator.statementToCode(this, "STATEMENTS", "   ");

        // if ( AbbozzaGenerator.ERROR) return null;

        code = "for (" + variable + " = " + from + "; " + variable + " " + rel + " " + to + " ; " + variable + " = " + variable + " + (" + step + ")) {\n";
        code = code + statements + "\n";
        code = code + "}\n";

        console.log(code); 
        return code;
    }

};

Blockly.Blocks['loop_count_dir'] = Abbozza.LoopCountDir;


/**
 * Counting loop with a counting variable number of repetitions.
 */
Abbozza.LoopCountDirStep = {
    init: function () {
        var thisBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
//    this.appendValueInput("COUNTER")
//        .setCheck("VARNUMBER")
//        .appendField(_("COUNT"));
        this.appendValueInput("FROM")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT", 0))
                .appendField(new VariableTypedDropdown(thisBlock, "NUMBER", null), "VAR")
                .appendField( new Blockly.FieldDropdown([[_("loop.ASCENDING"),"ASC"],[_("loop.DESCENDING"),"DESC"]]),"DIR")
                .appendField(__("loop.COUNT", 1));
        this.appendValueInput("TO")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT", 2));
        this.appendValueInput("STEP")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT",3));
        this.setInputsInline(true);
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    },
    generateMenu: function () {
        console.log(this);
        symbols = Abbozza.getSymbols(this);
        return symbols.getVariables("NUMBER", true);
    },
    generateCode: function (generator) {
        var code = "";
        var variable = generator.fieldToCode(this,"VAR");
        var from = generator.valueToCode(this, "FROM");
        var to = generator.valueToCode(this, "TO");
        var dir = generator.fieldToCode(this, "DIR");
        var step = generator.valueToCode(this, "STEP");
        var rel = "<=";
        if ( dir == "DESC" ) {
            rel = ">=";
        }
        var statements = generator.statementToCode(this, "STATEMENTS", "   ");

        // if ( AbbozzaGenerator.ERROR) return null;

        code = "for (" + variable + " = " + from + "; " + variable + " " + rel + " " + to + " ; " + variable + " = " + variable + " + (" + step + ")) {\n";
        code = code + statements + "\n";
        code = code + "}\n";

        console.log(code); 
        return code;
    }

};

Blockly.Blocks['loop_count_dir_step'] = Abbozza.LoopCountDirStep;

/**
 * Loop with a constant number of repetitions.
 */
Abbozza.LoopFixed = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("COUNT")
                .setCheck("NUMBER")
                .appendField(__("loop.FIXEDCOUNT", 0));
        this.appendDummyInput()
                .appendField(__("loop.FIXEDCOUNT", 1));
        this.setInputsInline(true);
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
  },
    generateCode: function (generator) {
        var code = "";
        var count = generator.valueToCode(this, "COUNT");
        var statements = generator.statementToCode(this, "STATEMENTS", "   ");

        // if ( AbbozzaGenerator.ERROR) return null;

        code = "for ( " + keyword("NUMBER") + " __counter =0 ; __counter <= " + count + "; __counter++) {\n";
        code = code + statements + "\n";
        code = code + "}\n";

        return code;
    }

};

Blockly.Blocks['loop_fixed'] = Abbozza.LoopFixed;




/**
 * Timed pause
 */
Abbozza.LoopDelay = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("TIME")
                .setCheck("NUMBER")
                .appendField(_("loop.WAITFOR"));
        this.appendDummyInput()
                .appendField(_("loop.WAITFOR_MS"));
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
  },
    generateCode: function (generator) {
        var code = "";
        var time = generator.valueToCode(this, "TIME");
        code = "delay(" + time + ");";
        return code;
    }

};


Blockly.Blocks['loop_delay'] = Abbozza.LoopDelay;



/**
 * Timed pause
 */
Abbozza.LoopDelayMicros = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("TIME")
                .setCheck("NUMBER")
                .appendField(_("loop.WAITFOR"));
        this.appendDummyInput()
                .appendField(_("loop.WAITFOR_MICROS"));
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
  },
    generateCode: function (generator) {
        var code = "";
        var time = generator.valueToCode(this, "TIME");
        code = "delay(" + time + ");";
        return code;
    }

};

Blockly.Blocks['loop_delay_micros'] = Abbozza.LoopDelayMicros;



