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
 * @fileoverview Blocks for in and output control
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * Set the mode of a specific pin
 */
Abbozza.InOutPinmode = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    // this.getColour = function() { return ColorMgr.getColour(this); };
    this.setColour(ColorMgr.getColor("cat.INOUT"));
    this.appendValueInput("PIN")
    	.setCheck(["NUMBER","PIN_ALL"])
        .appendField(__("io.PINMODE",0));
    this.appendDummyInput()
    	.appendField(__("io.PINMODE",1))
        .appendField(new Blockly.FieldDropdown([[_("io.INPUT"), "INPUT"], [_("io.OUTPUT"), "OUTPUT"]]), "MODE");
    this.setInputsInline(true);   
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
}

Blockly.Blocks['inout_pinmode'] = Abbozza.InOutPinmode;

/**
 * This block allows to choose a constant pin.
 */
Abbozza.InOutPin = {

  onchange: function(event) { },
  init: function() {
	 this.pinType = 0;
     var block = this;
    this.setHelpUrl(Abbozza.HELP_URL);
    // this.getColour = function() { return ColorMgr.getColour(this); };
    this.setColour(ColorMgr.getColor("cat.INOUT"));
    this.pinField = new Blockly.FieldLabel(_("io.PIN"));

    this.pinField.updateTextNode_ = function() {
        if (!this.textElement_) {
            // Not rendered yet.
            return;
        }
        var text;
        if (this.sourceBlock_.outputConnection.targetConnection != null) {
            text = "";
        } else {
            text = this.text_;
        }
        if (text.length > this.maxDisplayLength) {
            // Truncate displayed string and add an ellipsis ('...').
            text = text.substring(0, this.maxDisplayLength - 2) + '\u2026';
        }
        // Empty the text element.
        goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));
        // Replace whitespace with non-breaking spaces so the text doesn't collapse.
        text = text.replace(/\s/g, Blockly.Field.NBSP);
        if (this.sourceBlock_.RTL && text) {
            // The SVG is LTR, force text to be RTL.
            text += '\u200F';
        }
        if (!text) {
            // Prevent the field from disappearing if empty.
            // text = Blockly.Field.NBSP;
            text = "";
        }
        var textNode = document.createTextNode(text);
        this.textElement_.appendChild(textNode);
        
        // Cached width is obsolete.  Clear it.
        this.size_.width = 0;
    };
        
    this.appendDummyInput()
    	.appendField(this.pinField)
        .appendField(new PinDropdown(), "PIN");
    this.setOutput(true,"NUMBER");  
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  },
  
  setType: function(type) {
	 this.pinType = type;
  }
}

Blockly.Blocks['inout_pin'] = Abbozza.InOutPin;

/**
 * block providing constants representing the digital level
 */
Abbozza.InOutLevel = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.INOUT"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[_("io.HIGH"), "HIGH"], [_("io.LOW"), "LOW"]]), "LEVEL");
    this.setOutput(true,["BOOLEAN","NUMBER"]);  
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  }
}

Blockly.Blocks['inout_level'] = Abbozza.InOutLevel;

/**
 * Reading a digital input
 */
Abbozza.InOutDigitalRead = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.INOUT"));
    this.appendValueInput("PIN")
    	.appendField(_("io.READDPIN"))
    	.setCheck(["NUMBER","PIN_DIGITAL"]);
    this.setInputsInline(true);
    this.setOutput(true,["BOOLEAN","NUMBER"]);  
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  }
}

Blockly.Blocks['inout_digital_read'] = Abbozza.InOutDigitalRead;

/**
 * Writing to a digital output
 */
Abbozza.InOutDigitalWrite = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.INOUT"));
    this.appendValueInput("PIN")
        .appendField(__("io.SETDPIN",0))
        .setCheck("NUMBER");
    this.appendValueInput("LEVEL")
        .appendField(__("io.SETDPIN",1))
        .setCheck(["BOOLEAN","NUMBER","PIN_DIGITAL"]);
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
}

Blockly.Blocks['inout_digital_write'] = Abbozza.InOutDigitalWrite;

/**
 * Read from an analogue input
 */
Abbozza.InOutAnalogRead = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.INOUT"));
    this.appendValueInput("PIN")
    	.appendField(_("io.READAPIN"))
    	.setCheck(["NUMBER","PIN_ANALOG"]);
    this.setInputsInline(true);
    this.setOutput(true,"NUMBER");  
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  }
}

Blockly.Blocks['inout_analog_read'] = Abbozza.InOutAnalogRead;

/**
 * Write to an analog output (PWM)
 */
Abbozza.InOutAnalogWrite = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.INOUT"));
    this.appendValueInput("PIN")
        .appendField(__("io.SETAPIN",0))
        .setCheck(["NUMBER","PIN_PWM"]);
    this.appendValueInput("VALUE")
        .appendField(__("io.SETAPIN",1)) 
        .setCheck("NUMBER");
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
}


Blockly.Blocks['inout_analog_write'] = Abbozza.InOutAnalogWrite;
