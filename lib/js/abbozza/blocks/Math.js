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
  }
};


Abbozza.MathCalc = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendValueInput("LEFT").setCheck(["NUMBER","DECIMAL","BOOLEAN"]);
   	this.appendValueInput("RIGHT").setCheck(["NUMBER","DECIMAL","BOOLEAN"])
        .appendField(new Blockly.FieldDropdown([["+", "PLUS"], ["-", "MINUS"], ["*", "MULT"], ["/", "DIV"], ["%", "MOD"], ["^","POWER"]]), "OP");
    this.setInputsInline(true);
    this.setOutput(true,["NUMBER","DECIMAL"]);
    this.setTooltip('');
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




/**
 * The math expression block
 */
Abbozza.MathExpression = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.MATH"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput("0",Validator.expressionValidator), "EXPRESSION");
    this.setOutput(true,["NUMBER","DECIMAL"]);
    this.setTooltip('');
  }, 
  validate : function(expression) {
    var root = math.parse(expression);
    if ( root == null ) {
        ErrorMgr.addError(block,"Syntax error!");
        return false;
    }
    var block = this;
    root.traverse( function(node,path,parent) {
    switch (node.type) {
        // case "AccessorNode" :           // <array>[<index>]
        //    var name = node.name;
        //    var symbol = SymbolDB.getSymbol(name);
        //    if ( (symbol == null) || (symbol[1] != SymbolDB.VAR_SYMBOL) || (symbol[2] == null ) ) {
        //        ErrorMgr.addError(block,"Unknown array")
        //    }
        //    break;
        case "ConstantNode" : break;    // Numerical constant
        case "FunctionNode" :           // Function call
           if ( __allowed_functions != null ) {
              var name = node.fn;
              var args = node.args;
              if ( typeof __allowed_functions[name] == "undefined" ) {
                  ErrorMgr.addError(block,"Unknown function: " + name);
           return false;
                  break;
              }
              if ( __allowed_functions[name] != args.length ) {
                  ErrorMgr.addError(block,"Wromg number of arguments for " + name);
           return false;
                  break;                  
              }
           } else {
              ErrorMgr.addError(block,"Functions not allowed in expressions!");               
           return false;
           }
           break;
        // case "IndexNode"    : break;    // Array index
        //    break;
        case "OperatorNode" : break;    // Operator +,-,*,/
        case "ParanthesisNode" : break; // Paranthesis
        case "SymbolNode" :             // Symbol
           var name = node.name;
           var symbol = SymbolDB.getSymbol(name);
           if ( (symbol == null) || (symbol[1] != SymbolDB.VAR_SYMBOL) || (symbol[2] != null ) ) {
               ErrorMgr.addError(block,"Unknown symbol")
           return false;
           }
           break;          
        default:
           ErrorMgr.addError(block,"Syntax error!");
           return false;
    }
    return true;
  });
  }
};

Blockly.Blocks['math_expression'] = Abbozza.MathExpression;
