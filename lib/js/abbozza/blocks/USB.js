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
 * Set the serial rate
 */

Abbozza.SerialBeginRate = {
    init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(__("serial.BEGINRATE",0))
        .appendField(new Blockly.FieldDropdown([["300","300"], ["600","600"], ["1200","1200"], 
            ["2400","2400"], ["4800","4800"], ["9600","9600"], ["14400","14400"], ["19200","19200"], 
            ["28800","28800"], ["38400","38400"] , ["57600","57600"] ,["115200","115200"]]), "RATE")
        .appendField(__("serial.BEGINRATE",1));
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
}

Blockly.Blocks['serial_begin_rate'] = Abbozza.SerialBeginRate;

/**
 * Stops serial communiucation (unused)
 */
Abbozza.SerialEnd = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(_("serial.END"));
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
}

Blockly.Blocks['serial_end'] = Abbozza.SerialEnd;


/**
 * Write 4-byte int to the serial port
 */
Abbozza.SerialWriteInt = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("serial.WRITE_INT_USB"))
        .setCheck("NUMBER");
    this.setOutput(false);  
    this.setInputsInline(false);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
}

Blockly.Blocks['serial_write_int'] = Abbozza.SerialWriteInt;


/**
 * Read 4-byte int to the serial port
 */
Abbozza.SerialReadInt = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("serial.READ_INT_USB"));
    this.setOutput(true,"NUMBER");  
    this.setInputsInline(true);
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  }
}

Blockly.Blocks['serial_read_int'] = Abbozza.SerialReadInt;



/**
 * Write byte int to the serial port
 */
Abbozza.SerialWriteByte = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("serial.WRITE_BYTE_USB"))
        .setCheck("NUMBER");
    this.setOutput(false);  
    this.setInputsInline(false);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
  }
}

Blockly.Blocks['serial_write_byte'] = Abbozza.SerialWriteByte;


/**
 * Read 4-byte int to the serial port
 */
Abbozza.SerialReadByte = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("serial.READ_BYTE_USB"));
    this.setOutput(true,"NUMBER");  
    this.setInputsInline(false);
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setTooltip('');
  }
}

Blockly.Blocks['serial_read_byte'] = Abbozza.SerialReadByte;



/**
 * Write a string to the serial port.
 */
Abbozza.SerialPrint = {
  init: function() {
     this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(__("serial.PRINT",0))
        .setCheck("STRING");
    this.appendDummyInput()
        .appendField(__("serial.PRINT",1));
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
 }
}

Blockly.Blocks['serial_print'] = Abbozza.SerialPrint;

/**
 * Writes a string with a newline to the serial port.
 */
Abbozza.SerialPrintLn = {
   init: function() {
     this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendValueInput("VALUE")
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(__("serial.PRINTLN",0))
        .setCheck(["STRING","NUMBER","BOOLEAN","DECIMAL"]);
    this.appendDummyInput()
        .appendField(__("serial.PRINTLN",1));
    this.setOutput(false);  
    this.setInputsInline(true);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
   }
}

Blockly.Blocks['serial_println'] = Abbozza.SerialPrintLn;

/**
 * Writes a string with a newline to the serial port.
 */
Abbozza.SerialReadLn = {
   init: function() {
     this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("serial.READLN"));
    this.setOutput(true,"STRING");  
    this.setTooltip('');
 }
}

Blockly.Blocks['serial_readln'] = Abbozza.SerialReadLn;


/**
 * Writes a string with a newline to the serial port.
 */
Abbozza.SerialAvailable = {
   init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("serial.AVAILABLE"));
    this.setOutput(true,"BOOLEAN");  
    this.setTooltip('');
    }
}

Blockly.Blocks['serial_available'] = Abbozza.SerialAvailable;


Abbozza.USBTableMenu = [
   ["digital","0"],
   ["0... 1023", "1"],
   ["0 .. 65535","2"],
   ["-32768 ... 32767","3"],
   ["-1024 ... 1023","4"]   
];



/**
 * Writes the given values to the serial port. The Monitor is able to parse them.
 */
Abbozza.SerialTable = {
  init: function() {
    var thisblock = this;
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getColor("cat.USB"));
    this.appendDummyInput()
        .appendField(new Blockly.FieldImage("img/devices/usb.png",16,16))     
        .appendField(_("serial.SENDVALUES"));
    this.appendValueInput("CHANNEL0")
        .setCheck(["BOOLEAN","NUMBER"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(_("serial.CHANNEL") + " 1")
        .appendField(new Blockly.FieldDropdown(Abbozza.USBTableMenu, 
            function(value) {
              switch (value) {
                case "0" :
                    thisblock.getInput("CHANNEL0").setCheck(["BOOLEAN","NUMBER"]);
                    break;
                case "1" :
                case "2" :
                case "3" :
                    thisblock.getInput("CHANNEL0").setCheck(["NUMBER","BOOLEAN"]);
                }                
              thisblock.render();
            }
        ),"CHANNEL0_TYPE");
    this.appendValueInput("CHANNEL1")
        .setCheck(["BOOLEAN","NUMBER"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(_("serial.CHANNEL") + " 2")
        .appendField(new Blockly.FieldDropdown(Abbozza.USBTableMenu, 
            function(value) {
              switch (value) {
                case "0" :
                    thisblock.getInput("CHANNEL1").setCheck(["BOOLEAN","NUMBER"]);
                    break;
                default :
                    thisblock.getInput("CHANNEL1").setCheck(["NUMBER","BOOLEAN"]);
                }                
              thisblock.render();
            }
        ),"CHANNEL1_TYPE");
    this.appendValueInput("CHANNEL2")
        .setCheck(["BOOLEAN","NUMBER"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(_("serial.CHANNEL") + " 3")
        .appendField(new Blockly.FieldDropdown(Abbozza.USBTableMenu, 
            function(value) {
              switch (value) {
                case "0" :
                    thisblock.getInput("CHANNEL2").setCheck(["BOOLEAN","NUMBER"]);
                    break;
                default :
                    thisblock.getInput("CHANNEL2").setCheck(["NUMBER","BOOLEAN"]);
                }                
              thisblock.render();
            }
        ),"CHANNEL2_TYPE");
    this.appendValueInput("CHANNEL3")
        .setCheck(["BOOLEAN","NUMBER"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(_("serial.CHANNEL") + " 4")
        .appendField(new Blockly.FieldDropdown(Abbozza.USBTableMenu, 
            function(value) {
              switch (value) {
                case "0" :
                    thisblock.getInput("CHANNEL3").setCheck(["BOOLEAN","NUMBER"]);
                    break;
                default :
                    thisblock.getInput("CHANNEL3").setCheck(["NUMBER","BOOLEAN"]);
                }                
              thisblock.render();
            }
        ),"CHANNEL3_TYPE");
    this.appendValueInput("CHANNEL4")
        .setCheck(["BOOLEAN","NUMBER"])
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(_("serial.CHANNEL") + " 5")
        .appendField(new Blockly.FieldDropdown(Abbozza.USBTableMenu, 
            function(value) {
              switch (value) {
                case "0" :
                    thisblock.getInput("CHANNEL4").setCheck(["BOOLEAN","NUMBER"]);
                    break;
                default :
                    thisblock.getInput("CHANNEL4").setCheck(["NUMBER","BOOLEAN"]);
                }                
              thisblock.render();
            }            
        ),"CHANNEL4_TYPE");
    this.setOutput(false);
    this.setPreviousStatement(true,"STATEMENT");
    this.setNextStatement(true,"STATEMENT");
    this.setTooltip('');
 }
}

Blockly.Blocks['serial_table'] = Abbozza.SerialTable;
