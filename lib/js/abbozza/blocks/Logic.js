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
 * @fileoverview Blocks for logic constants and logic operations
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * The prototype block for the logic constants
 */
Abbozza.LogicConst = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.LOGIC"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[_("logic.TRUE"), "TRUE"], [_("logic.FALSE"), "FALSE"]]), "NAME");
    this.setOutput(true,"BOOLEAN");
    this.setTooltip('');
  }
};


/**
 * The prototype block the for binary logic operations AND and OR
 */
Abbozza.LogicOp = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.LOGIC"));
    this.appendValueInput("LEFT")
        .setCheck("BOOLEAN");
    this.appendValueInput("RIGHT")
        .setCheck("BOOLEAN")
        .appendField(new Blockly.FieldDropdown([[_("logic.AND"), "AND"], [_("logic.OR"), "OR"]]), "LOGOP");
    this.setInputsInline(true);
    this.setOutput(true, "BOOLEAN");
    this.setTooltip('');
  }
};


/**
 * The prototype block for the logic not.
 */
Abbozza.LogicNot = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.LOGIC"));
    this.appendValueInput("ARG")
        .setCheck("BOOLEAN")
        .appendField(_("logic.NOT"));
    this.setInputsInline(true);
    this.setOutput(true, "BOOLEAN");
    this.setTooltip('');
  }
};


/**
 * The prototype block for comparisons of values
 */
Abbozza.LogicCompare = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.LOGIC"));
    this.appendValueInput("LEFT");
    this.appendValueInput("RIGHT")
        .appendField(new Blockly.FieldDropdown([
        		[_("logic.EQUALS"),"EQUALS"],
        		[_("logic.INEQUAL"),"INEQUAL"],
        		[_("logic.LESS"),"LESS"],
        		[_("logic.LESSEQ"),"LESSEQ"],
        		[_("logic.GREATER"),"GREATER"],
        		[_("logic.GREATEREQ"),"GREATEREQ"]
         	]),"OP");
    this.setInputsInline(true);
    this.setOutput(true, "BOOLEAN");
    this.setTooltip('');
  }
};


Blockly.Blocks['logic_const'] = Abbozza.LogicConst;
Blockly.Blocks['logic_op'] = Abbozza.LogicOp;
Blockly.Blocks['logic_not'] = Abbozza.LogicNot;
Blockly.Blocks['logic_compare'] = Abbozza.LogicCompare;

