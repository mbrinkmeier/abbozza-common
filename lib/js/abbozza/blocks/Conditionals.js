/**
 * @license
 * abbozza!
 *
 * Copyright 2015-17 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
 * @fileoverview Blocks for conditions and decisions
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * If-block
 */
Abbozza.CondIf = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.COND"));
    this.appendValueInput("CONDITION")
        .setCheck("BOOLEAN")
        .appendField(new Blockly.FieldImage("img/devices/if.png",16,16))     
        .appendField(_("cond.IF"));
    this.appendStatementInput("STATEMENTS");
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
};


/**
 * If-Else-block
 */
Abbozza.CondIfElse = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.COND"));
    this.appendValueInput("CONDITION")
        .setCheck("BOOLEAN")
        .appendField(new Blockly.FieldImage("img/devices/if.png",16,16))     
        .appendField(_("cond.IF"));
    this.appendStatementInput("STATEMENTS1");
    this.appendDummyInput()
        .appendField(_("cond.ELSE"));
    this.appendStatementInput("STATEMENTS2");
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
};

Blockly.Blocks['cond_if'] = Abbozza.CondIf;
Blockly.Blocks['cond_if_else'] = Abbozza.CondIfElse;