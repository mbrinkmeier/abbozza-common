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
 * A constant text
 */
Abbozza.TextConstant = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEXT"));
    this.appendDummyInput()
        .appendField("\"")
        .appendField(new Blockly.FieldTextInput("default"), "CONTENT")
        .appendField("\"");
    this.setInputsInline(false);
    this.setOutput(true, "STRING");
    this.setTooltip('');
  },
  
  getText : function(generator) {
    var content = this.getFieldValue("CONTENT");
    return goog.string.quote(content);  
  },
  
  generateCode : function(generator) {
  	var content = this.getFieldValue("CONTENT");
  	
	return "String(" + goog.string.quote(content) + ")";
  }
}

/**
 * Picks a specific character from a text
 */
Abbozza.TextCharAt = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEXT"));
    this.appendValueInput("POS")
        .appendField(__("txt.LETTERAT",0))
        .setCheck("NUMBER");
    this.appendValueInput("TEXT")
        .appendField(__("txt.LETTERAT",1))
        .setCheck("STRING");
    this.setInputsInline(true);
    this.setOutput(true, "STRING");
    this.setTooltip('');
  },
  
  generateCode_ : function(generator) {
  		var code = "";
  		var text = generator.valueToCode(this,"TEXT");
  		var pos = generator.valueToCode(this,"POS");
  		
  		code = "String(" + text + ".charAt(" + pos + "))";
  		return code;
  }
}

/**
 * Concatenation of two strings
 */
Abbozza.TextConcat = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEXT"));
    this.appendValueInput("TEXT1")
        .setCheck("STRING");
    this.appendValueInput("TEXT2")
        .setCheck("STRING");
    this.setInputsInline(true);
    this.setOutput(true, "STRING");
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
  		var code = "";
  		var text1 = generator.valueToCode(this,"TEXT1");
  		var text2 = generator.valueToCode(this,"TEXT2");
  		
  		code = text1 + "+" + text2;
  		return code;
  }
}

/**
 * Picks a specific character from a text
 */
Abbozza.TextFromNumber = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEXT"));
    this.appendValueInput("VALUE")
        .appendField(__("txt.FROMNUMBER",0))
        .setCheck(["NUMBER","DECIMAL"]);
    this.appendDummyInput()
        .appendField(__("txt.FROMNUMBER",1));
    this.setInputsInline(true);
    this.setOutput(true, "STRING");
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
  		var code = "";
  		var value = generator.valueToCode(this,"VALUE");
  		
  		code = "String(" + value + ")";
  		return code;
  }
}

/**
 * Returns a string consisting of the character with the given ascci code
 */
Abbozza.TextFromASCII = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEXT"));
    this.appendValueInput("VALUE")
        .appendField(__("txt.TEXTFROMASCII",0))
        .setCheck(["NUMBER","DECIMAL"]);
    this.setInputsInline(true);
    this.setOutput(true, "STRING");
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
  		var code = "";
  		var value = generator.valueToCode(this,"VALUE");
  		
  		code = "String(char(" + value + "))";
  		return code;
  }
}

/**
 * Returns a string consisting of the character with the given ascci code
 */
Abbozza.ASCIIFromText = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEXT"));
    this.appendValueInput("TEXT")
        .appendField(__("txt.ASCIIFROMTEXT",0))
        .setCheck(["STRING"]);
    this.setInputsInline(true);
    this.setOutput(true, "NUMBER");
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
  		var code = "";
  		var text = generator.valueToCode(this,"TEXT");
  		
  		code = text + ".charAt(0)";
  		return code;
  }
}


Blockly.Blocks['text_const'] = Abbozza.TextConstant;
Blockly.Blocks['text_charat'] = Abbozza.TextCharAt;
Blockly.Blocks['text_concat'] = Abbozza.TextConcat;
Blockly.Blocks['text_from_number'] = Abbozza.TextFromNumber;
Blockly.Blocks['text_from_ascii'] = Abbozza.TextFromASCII;
Blockly.Blocks['ascii_from_text'] = Abbozza.ASCIIFromText;
