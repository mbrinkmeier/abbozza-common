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
 * @fileoverview Blocks for numerical constants and mathematical operations
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Abbozza.MathNumber = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("0",Validator.numericalValidator), "VALUE");
    this.setOutput(true,["NUMBER","DECIMAL"]);
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
  	var num = this.getFieldValue("VALUE");
  	return String(num);
  }
  
};


Abbozza.MathDecimal = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("0",Validator.decimalValidator), "VALUE");
    this.setOutput(true,["DECIMAL"]);
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
  	var num = this.getFieldValue("VALUE");
  	return String(num);
  }
  
};


Abbozza.MathCalc = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("LEFT").setCheck(["NUMBER","DECIMAL"]);
   	this.appendValueInput("RIGHT").setCheck(["NUMBER","DECIMAL"])
        .appendField(new Blockly.FieldDropdown([["+", "PLUS"], ["-", "MINUS"], ["*", "MULT"], ["/", "DIV"], ["%", "MOD"], ["^","POWER"]]), "OP");
    this.setInputsInline(true);
    this.setOutput(true,["NUMBER","DECIMAL"]);
    this.setTooltip('');
  },
 
  generateCode : function(generator) {
  	var left = generator.valueToCode(this,"LEFT");
  	var right = generator.valueToCode(this,"RIGHT");
  	var op = this.getFieldValue("OP");
  	if ( op == "POWER" ) {
  		return "pow(" + left + "," + right +")";
  	}
  	return "(" + left + keyword(op) + right + ")";
  }
  
};


Abbozza.MathRound =  {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("ARG").setCheck(["DECIMAL","NUMBER"])
        .appendField(new Blockly.FieldDropdown([[_("math.ROUND"),"ROUND"],[_("math.FLOOR"),"FLOOR"],[_("math.CEIL"),"CEIL"]]), "OP");
    this.setInputsInline(true);
    this.setOutput(true,["NUMBER"]);
    this.setTooltip('');
  },
  
  generateCode: function(generator) {
  	var arg = generator.valueToCode(this,"ARG");
  	var op = this.getFieldValue("OP");
  	return keyword(op) + "(" + arg +")";
  }
};

 
Abbozza.MathUnary = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("ARG").setCheck(["DECIMAL"])
        .appendField(new Blockly.FieldDropdown([[_("math.ABS"), "ABS"], [_("math.SQRT"), "SQRT"], [_("math.SIN"), "SIN"], [_("math.COS"), "COS"], [_("math.TAN"), "TAN"]]), "OP");
    this.setInputsInline(true);
    this.setOutput(true,["DECIMAL"]);
    this.setTooltip('');
  },
 
  generateCode: function(generator) {
  	var arg = generator.valueToCode(this,"ARG");
  	var op = this.getFieldValue("OP");
  	return keyword(op) + "(" + arg +")";
  }
};

Abbozza.MathUnaryX = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("ARG").setCheck(["DECIMAL"])
        .appendField(new Blockly.FieldDropdown([[_("math.ABS"), "ABS"], [_("math.SQRT"), "SQRT"], [_("math.SIN"), "SIN"], 
                [_("math.COS"), "COS"], [_("math.TAN"), "TAN"],[_("math.ASIN"),"ASIN"],[_("math.ACOS"),"ACOS"],[_("math.ATAN"),"ATAN"]
            ]), "OP");
    this.setInputsInline(true);
    this.setOutput(true,["DECIMAL"]);
    this.setTooltip('');
  },
 
  generateCode: function(generator) {
  	var arg = generator.valueToCode(this,"ARG");
  	var op = this.getFieldValue("OP");
  	return keyword(op) + "(" + arg +")";
  }
};

Abbozza.MathBinary = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("FIRST").setCheck(["NUMBER","DECIMAL"])
        .appendField(new Blockly.FieldDropdown([[_("math.MIN"),"MIN"],[_("math.MAX"),"MAX"]]), "OP")
    	.appendField("(");
    this.appendValueInput("SECOND").setCheck(["NUMBER","DECIMAL"])
    	.appendField(",");
    this.appendDummyInput()
    	.appendField(")");
    this.setInputsInline(true);
    this.setOutput(true,["NUMBER","DECIMAL"]);
    this.setTooltip('');
  },
 
  generateCode: function(generator) {
  	var first = generator.valueToCode(this,"FIRST");
  	var second = generator.valueToCode(this,"SECOND");
  	var op = this.getFieldValue("OP");
  	switch (op) {
  		case "MAX":
  			return "max(" + first + "," + second + ")";
  			break;
  		case "MIN":
  			return "min(" + first + "," + second + ")";
  			break;
  	}
  	return "";
  }
};


Abbozza.MathRandom = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("MAX")
        .setCheck("NUMBER")
        .appendField(_("math.RANDOM0"));
    this.setInputsInline(true);
    this.setOutput(true, "NUMBER");
    this.setTooltip('');
  },
 
  generateCode: function(generator) {
  	var max = parseInt(generator.valueToCode(this,"MAX"))+1;
  	return "random(" + max + ")";
  }
};


Abbozza.MathRandom2 = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("MIN")
        .setCheck("NUMBER")
        .appendField(__("math.RANDOM",0));
    this.appendValueInput("MAX")
        .setCheck("NUMBER")
        .appendField(__("math.RANDOM",1));
    this.setInputsInline(true);
    this.setOutput(true, "NUMBER");
    this.setTooltip('');
  },
 
  generateCode_: function(generator) {
  	var min = generator.valueToCode(this,"MIN");
  	var max = parseInt(generator.valueToCode(this,"MAX"))+1;
  	return "random(" + min + "," + max + ")";
  }
};

Abbozza.MathRandomSeed = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("SEED")
        .setCheck("NUMBER")
        .appendField(_("math.INITRAND"));
    this.setInputsInline(true);
    this.setPreviousStatement(true, "STATEMENT");
    this.setNextStatement(true, "STATEMENT");
    this.setTooltip('');
  },
 
  generateCode: function(generator) {
  	var seed = generator.valueToCode(this,"SEED");
  	return "randomSeed(" + seed + ");";
  }
  
};

Abbozza.MathMillis = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendDummyInput()
        .appendField(_("MILLIS"));
    this.setOutput(true, "NUMBER");
    this.setTooltip('');
  },
 
  generateCode: function(generator) {
  	return "millis()";
  }
};

Abbozza.MathMicros = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendDummyInput()
        .appendField(_("MICROS"));
    this.setOutput(true, "NUMBER");
    this.setTooltip('');
  },
 
  generateCode: function(generator) {
  	return "micros()";
  }
};

Blockly.Blocks['math_number'] = Abbozza.MathNumber;
Blockly.Blocks['math_decimal'] = Abbozza.MathDecimal;
Blockly.Blocks['math_calc'] = Abbozza.MathCalc;
Blockly.Blocks['math_round'] = Abbozza.MathRound;
Blockly.Blocks['math_unary'] = Abbozza.MathUnary;
Blockly.Blocks['math_unary_x'] = Abbozza.MathUnaryX;
Blockly.Blocks['math_binary'] = Abbozza.MathBinary;
Blockly.Blocks['math_random'] = Abbozza.MathRandom;
Blockly.Blocks['math_random2'] = Abbozza.MathRandom2;
Blockly.Blocks['math_randomseed'] = Abbozza.MathRandomSeed;
Blockly.Blocks['math_millis'] = Abbozza.MathMillis;
Blockly.Blocks['math_micros'] = Abbozza.MathMicros;
