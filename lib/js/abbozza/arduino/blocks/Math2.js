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
 * @fileoverview ... 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Abbozza.MathConstrain = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("VALUE")
        .setCheck("NUMBER")
        .appendField(__("math.CONSTRAIN",0));
    this.appendValueInput("MIN")
        .setCheck("NUMBER")
        .appendField(__("math.CONSTRAIN",1));
    this.appendValueInput("MAX")
        .setCheck("NUMBER")
        .appendField(__("math.CONSTRAIN",2));
    this.setInputsInline(true);
    this.setOutput(true, "NUMBER");
    this.setTooltip('');
  },
 
  generateCode : function(generator) {
  	var value = generator.valueToCode(this,"VALUE");
  	var min = generator.valueToCode(this,"MIN");
  	var max = generator.valueToCode(this,"MAX");
  	return "constrain(" + value + "," + min + "," + max + ")";
  }
};


Abbozza.MathScale = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("VALUE")
        .setCheck("NUMBER")
        .appendField(__("math.SCALE",0));
    this.appendValueInput("FMIN")
        .setCheck("NUMBER")
        .appendField(__("math.SCALE",1));
    this.appendValueInput("FMAX")
        .setCheck("NUMBER")
        .appendField(__("math.SCALE",2));
    this.appendValueInput("TMIN")
        .setCheck("NUMBER")
        .appendField(__("math.SCALE",3));
    this.appendValueInput("TMAX")
        .setCheck("NUMBER")
        .appendField(__("math.SCALE",4));
    this.appendDummyInput()
        .appendField(__("math.SCALE",5));        
    this.setInputsInline(true);
    this.setOutput(true, "NUMBER");
    this.setTooltip('');
  },
 
  generateCode: function(generator) {
  	var value = generator.valueToCode(this,"VALUE");
  	var fmin = generator.valueToCode(this,"FMIN");
  	var fmax = generator.valueToCode(this,"FMAX");
  	var tmin = generator.valueToCode(this,"TMIN");
  	var tmax = generator.valueToCode(this,"TMAX");
        var code = "map(" + value + "," + fmin + "," + fmax  + "," + tmin + "," + tmax + ")";
        console.log(code);
  	return code;
  }
};


Blockly.Blocks['math_constrain'] = Abbozza.MathConstrain;
Blockly.Blocks['math_scale'] = Abbozza.MathScale;
