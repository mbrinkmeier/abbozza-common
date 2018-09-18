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
           .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
           .appendField(_("loop.ENDLESS"));
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
    }
};


/**
 * while - loop
 */
Abbozza.LoopWhile = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("CONDITION")
                .setCheck("BOOLEAN")
                .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
                .appendField(_("loop.WHILE"));
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
  }
};

/**
 * do-while-loop
 */
Abbozza.LoopDoWhile = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendDummyInput()
           .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
           .appendField(_("loop.REPEAT"));
        this.appendStatementInput("STATEMENTS");
        this.appendValueInput("CONDITION")
                .setCheck("BOOLEAN")
                .appendField(_("loop.ASLONG"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
  }
};

/**
 * break
 */
Abbozza.LoopBreak = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
            .appendField(_("loop.BREAK"));
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(false);
        this.setTooltip('');
  }
};

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
               .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
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
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
    },
    generateMenu: function () {
        console.log("generateMenu");
        console.log(this);
        symbols = Abbozza.getSymbols(this);
        return symbols.getVariables("NUMBER", true);
    }
};



/**
 * Counting loop with a counting variable number of repetitions.
 */
Abbozza.LoopCountDir = {
    init: function () {
        var thisBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("FROM")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
                .appendField(__("loop.COUNT", 0))
                .appendField(new VariableTypedDropdown(thisBlock, "NUMBER", null), "VAR")
                .appendField( new Blockly.FieldDropdown([[_("loop.ASCENDING"),"ASC"],[_("loop.DESCENDING"),"DESC"]]),"DIR")
                .appendField(__("loop.COUNT", 1));
        this.appendValueInput("TO")
                .setCheck("NUMBER")
                .appendField(__("loop.COUNT", 2));
        this.setInputsInline(true);
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
    },
    generateMenu: function () {
        console.log(this);
        symbols = Abbozza.getSymbols(this);
        return symbols.getVariables("NUMBER", true);
    }
};



/**
 * Counting loop with a counting variable number of repetitions.
 */
Abbozza.LoopCountDirStep = {
    init: function () {
        var thisBlock = this;
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("FROM")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
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
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
    },
    generateMenu: function () {
        console.log(this);
        symbols = Abbozza.getSymbols(this);
        return symbols.getVariables("NUMBER", true);
    }
};


/**
 * Loop with a constant number of repetitions.
 */
Abbozza.LoopFixed = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("COUNT")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
                .appendField(__("loop.FIXEDCOUNT", 0));
        this.appendDummyInput()
                .appendField(__("loop.FIXEDCOUNT", 1));
        this.setInputsInline(true);
        this.appendStatementInput("STATEMENTS");
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
  }
};





/**
 * Timed pause
 */
Abbozza.LoopDelayMillis = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("TIME")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
                .appendField(_("loop.STOPFOR"));
        this.appendDummyInput()
                .appendField(_("loop.WAITFOR_MS"));
        this.setInputsInline(true);
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
  }
};





/**
 * Timed pause
 */
Abbozza.LoopDelayMicros = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("TIME")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
                .appendField(_("loop.STOPFOR"));
        this.appendDummyInput()
                .appendField(_("loop.WAITFOR_MICROS"));
        this.setInputsInline(true);
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
  }
};





/**
 * Timed pause
 */
Abbozza.LoopDelaySeconds = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("TIME")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
                .appendField(_("loop.STOPFOR"));
        this.appendDummyInput()
                .appendField("s");
        this.setInputsInline(true);
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
  }
};


/**
 * Timed pause
 */
Abbozza.LoopDelay = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getCatColor("cat.LOOPS"));
        this.appendValueInput("TIME")
                .setCheck("NUMBER")
                .appendField(new Blockly.FieldImage("img/devices/loop.png",16,16))     
                .appendField(_("loop.WAITFOR"));
        this.appendDummyInput()
                .appendField("ms");
        this.setInputsInline(true);
        this.setPreviousStatement(true,"STATEMENT");
        this.setNextStatement(true,"STATEMENT");
        this.setTooltip('');
  }
};

Blockly.Blocks['loop_endless'] = Abbozza.LoopEndless;
Blockly.Blocks['loop_while'] = Abbozza.LoopWhile;
Blockly.Blocks['loop_do_while'] = Abbozza.LoopDoWhile;
Blockly.Blocks['loop_break'] = Abbozza.LoopBreak;
Blockly.Blocks['loop_count'] = Abbozza.LoopCount;
Blockly.Blocks['loop_count_dir'] = Abbozza.LoopCountDir;
Blockly.Blocks['loop_count_dir_step'] = Abbozza.LoopCountDirStep;
Blockly.Blocks['loop_fixed'] = Abbozza.LoopFixed;
Blockly.Blocks['loop_delay_millis'] = Abbozza.LoopDelayMillis;
Blockly.Blocks['loop_delay_micros'] = Abbozza.LoopDelayMicros;
Blockly.Blocks['loop_delay_seconds'] = Abbozza.LoopDelaySeconds;
Blockly.Blocks['loop_delay'] = Abbozza.LoopDelay;