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
  
  confirm: function(flag) {
      if ( flag ) {
         this.setColour(ColorMgr.getCatColor("cat.TEXT"));
         this.confirmed = true;
     } else {
         this.setColour("#F0F0F0");
         this.confirmed = false;
     }
  },
  mutationToDom: function () {
    var mutation = null;
    if ( this.confirmed == false) {
       mutation = document.createElement('mutation');
       mutation.setAttribute("confirmed","false");
    }
    return mutation;
  },   
  domToMutation: function (xmlElement) {
     if ( xmlElement.hasAttribute("confirmed") ) {
        var state = xmlElement.getAttribute("confirmed");
        if ( state == "true" ) {
            this.confirm(true);
        } else {
            this.confirm(false);
        }
     } else {
        this.confirm(true);
     }
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
        .setCheck(["NUMBER","DECIMAL","BOOLEAN"]);
    this.appendDummyInput()
        .appendField(__("txt.FROMNUMBER",1));
    this.setInputsInline(true);
    this.setOutput(true, "STRING");
    this.setTooltip('');
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
  }
}


Abbozza.TextLength = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEXT"));
    this.appendValueInput("TEXT")
        .appendField(_("txt.LENGTH"))
        .setCheck(["STRING"]);
    this.setInputsInline(true);
    this.setOutput(true, "NUMBER");
    this.setTooltip('');
  }
}


Abbozza.TextSubstring = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEXT"));
    this.appendValueInput("TEXT")
        .appendField(__("txt.SUBSTRING",0))
        .setCheck(["STRING"]);
    this.appendValueInput("FROM")
        .appendField(__("txt.SUBSTRING",1))
        .setCheck(["NUMBER"]);
    this.appendValueInput("TO")
        .appendField(__("txt.SUBSTRING",2))
        .setCheck(["NUMBER"]);
    this.setInputsInline(true);
    this.setOutput(true, "STRING");
    this.setTooltip('');
  }
}

Abbozza.repr = {
	init : function() {
            this.setHelpUrl(Abbozza.HELP_URL);
            this.setColour(ColorMgr.getCatColor("cat.VAR"));
            this.setPreviousStatement(false);
            this.setNextStatement(false);
            this.setOutput(true,"STRING");
            this.appendValueInput("VALUE")
                    .appendField(_("block.asString"))
                    .setCheck(["NUMBER","DECIMAL","BOOLEAN"]);
            this.setTooltip('');
	}
}

Blockly.Blocks['text_as_string'] = Abbozza.repr;
Blockly.Blocks['text_const'] = Abbozza.TextConstant;
Blockly.Blocks['text_charat'] = Abbozza.TextCharAt;
Blockly.Blocks['text_concat'] = Abbozza.TextConcat;
Blockly.Blocks['text_from_number'] = Abbozza.TextFromNumber;
Blockly.Blocks['text_from_ascii'] = Abbozza.TextFromASCII;
Blockly.Blocks['ascii_from_text'] = Abbozza.ASCIIFromText;
Blockly.Blocks['text_length'] = Abbozza.TextLength;
Blockly.Blocks['text_substring'] = Abbozza.TextSubstring;
