/**
 * @license
 * abbozza!
 *
 * Copyright 2017 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
 * @fileoverview Blocks for the handling of servo motors
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

DEV_TYPE_I2C_MASTER = 50;
DEV_TYPE_I2C_SLAVE = 51;

/**
 * Initialize the Arduino as I2C Master
 * 
 * @type type
 */
Abbozza.DeviceI2CMaster = {
    devtype: DEV_TYPE_I2C_MASTER,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/comm32.png",16,16))
                .appendField(__("dev.I2C_MASTER",0));
//                .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(true, "DEVICE");
        this.setNextStatement(true, "DEVICE");
        this.setTooltip('');
        Abbozza.addDisposeHandler(this);
    },
    
    getName: function () {
        return("i2c_master");
        // return this.getFieldValue("NAME");
    },
    
    generateCode: function (generator) {
        generator.addLibrary("Wire.h");
        generator.addSetupCode("Wire.begin();");
        return "";
    },
    
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }


};
Blockly.Blocks['dev_i2c_master'] = Abbozza.DeviceI2CMaster;


/**
 * Initialize the Arduino as I2C Slave with given address
 * @type type
 */
Abbozza.DeviceI2Clave = {
    devtype: DEV_TYPE_I2C_SLAVE,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/comm32.png",16,16))
                .appendField(__("dev.I2C_SLAVE",0))
                .appendField(new Blockly.FieldNumber(8,8,127),"ADDRESS");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(true, "DEVICE");
        this.setNextStatement(true, "DEVICE");
        this.setTooltip('');
        Abbozza.addDisposeHandler(this);
    },
    
    getName: function () {
        return "i2c_slave";
        // return this.getFieldValue("NAME");
    },
    
    generateCode: function (generator) {
        generator.addLibrary("Wire.h");
        var addr = generator.fieldToCode(this,"ADDRESS");
        generator.addSetupCode("Wire.begin(" + addr + ");");
        return "";
    },
    
    onDispose: function () {
        Abbozza.devices.delDevice(this.getName());
    }


};
Blockly.Blocks['dev_i2c_slave'] = Abbozza.DeviceI2Clave;


/**
 * This Block sends a single Byte.
 * 
 * @type type
 */
Abbozza.DeviceI2CMasterSend = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2C_MASTER_SEND",0))        
                .setCheck("NUMBER");
        this.appendValueInput("VALUE")
                .appendField(__("dev.I2C_MASTER_SEND",1))
                .setCheck("NUMBER");
        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },

    generateCode: function (generator) {
        var value = generator.valueToCode(this, "VALUE");
        var address = generator.valueToCode(this, "ADDRESS");
        
        var code = "Wire.beginTransmission(" + address + ");\n";
        code = code + "Wire.write(byte(" + value + "));\n";
        code = code + "Wire.endTransmission()";
        
        return code;
    }
};
Blockly.Blocks['dev_i2c_master_send'] = Abbozza.DeviceI2CMasterSend;

/**
 * This Block sends a string.
 * 
 * @type type
 */
Abbozza.DeviceI2CMasterSendString = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2C_MASTER_SEND_STRING",0))        
                .setCheck("NUMBER");
        this.appendValueInput("VALUE")
                .appendField(__("dev.I2C_MASTER_SEND_STRING",1))
                .setCheck("STRING");
        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },

    generateCode: function (generator) {
        var value = generator.valueToCode(this, "VALUE");
        var address = generator.valueToCode(this, "ADDRESS");
        
        var code = "Wire.beginTransmission(" + address + ");\n";
        code = code + "Wire.write(" + value + ");\n";
        code = code + "Wire.endTransmission()";
        
        return code;
    }
};
Blockly.Blocks['dev_i2c_master_send_string'] = Abbozza.DeviceI2CMasterSendString;



/**
 * This block requests a given number of bytes from a slave.
 * 
 * @type type
 */
Abbozza.DeviceI2CMasterRequest = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
                
        this.appendValueInput("COUNT")
                .appendField(__("dev.I2C_MASTER_REQUEST",0))
                .setCheck("NUMBER");
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2C_MASTER_REQUEST",1))        
                .setCheck("NUMBER");
        this.setInputsInline(true);
        this.setOutput("NUMBER");
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },

    generateCode: function (generator) {
        var count = generator.valueToCode(this, "COUNT");
        var address = generator.valueToCode(this, "ADDRESS");
        
        var code = "Wire.requestFrom(" + address + "," + count + ");";
        
        return code;
    }
};
Blockly.Blocks['dev_i2c_master_request'] = Abbozza.DeviceI2CMasterRequest;



/**
 * This block starts a transmission.
 * 
 * @type type
 */
Abbozza.DeviceI2CMasterBegin = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2C_BEGIN",0))        
                .setCheck("NUMBER");
        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },

    generateCode: function (generator) {
        var address = generator.valueToCode(this, "ADDRESS");
        
        var code = "Wire.beginTransmission(" + address + ");";
    }
};
Blockly.Blocks['dev_i2c_master_begin'] = Abbozza.DeviceI2CMasterBegin;


/**
 * This block ends the transmission and sends ist to the slave.
 * 
 * @type type
 */
Abbozza.DeviceI2CMasterEnd = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
                
        this.appendDummyInput("ADDRESS")
                .appendField(__("dev.I2C_END",0));
        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },

    generateCode: function (generator) {
        
        var code = "Wire.endTransmission();";
        
        return code;
    }
};
Blockly.Blocks['dev_i2c_master_end'] = Abbozza.DeviceI2CMasterEnd;

/**
 * Write a single byte to the slave
 * 
 * @type type
 */
Abbozza.DeviceI2CWrite = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2C_WRITE",0))        
                .setCheck("NUMBER");
        this.appendValueInput("VALUE")
                .appendField(__("dev.I2C_WRITE",1))
                .setCheck("NUMBER");
        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },

    generateCode: function (generator) {
        var value = generator.valueToCode(this, "VALUE");
        
        var code = "Wire.write(byte(" + value + "));";
        
        return code;
    }
};
Blockly.Blocks['dev_i2c_write'] = Abbozza.DeviceI2CWrite;


/**
 * 
 * @type type
 */
Abbozza.DeviceI2CWriteString = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2C_WRITE_STRING",0))        
                .setCheck("NUMBER");
        this.appendValueInput("VALUE")
                .appendField(__("dev.I2C_WRITE_STRING",1))
                .setCheck("STRING");
        this.setInputsInline(true);
        this.setOutput(false);
        this.setPreviousStatement(true, "STATEMENT");
        this.setNextStatement(true, "STATEMENT");
        this.setTooltip('');
    },

    generateCode: function (generator) {
        var value = generator.valueToCode(this, "VALUE");
        
        var code = "Wire.write(" + value + ");";
        
        return code;
    }
};
Blockly.Blocks['dev_i2c_write_string'] = Abbozza.DeviceI2CWriteString;



/**
 * 
 */
Abbozza.DeviceI2CAvailable = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
        this.appendDummyInput()
                .appendField(__("dev.I2C_AVAILABLE",0));
        this.setInputsInline(false);
        this.setOutput(true, "NUMBER");
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    },

    generateCode: function (generator) {
        var code = "Wire.available()";
        return code;
    }

};
Blockly.Blocks['dev_i2c_available'] = Abbozza.DeviceI2CAvailable;

/**
 * 
 */
Abbozza.DeviceI2CRead = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2C"));
        this.appendDummyInput()
                .appendField(__("dev.I2C_READ",0));
        this.setInputsInline(false);
        this.setOutput(true, "NUMBER");
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setTooltip('');
    },

    generateCode: function (generator) {
        var code = "Wire.read()";
        return code;
    }

};
Blockly.Blocks['dev_i2c_read'] = Abbozza.DeviceI2CRead;



/**
 * 
 */
Abbozza.DeviceI2COnReceive = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.I2C"));
    this.appendDummyInput()
    	.appendField(__("dev.I2C_RECEIVE",0))
        .appendField(new FunctionDropdown(this, null,true), "ISR")
        .appendField(__("dev.I2C_RECEIVE",1));
    this.setInputsInline(true);   
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
    var name =  generator.fieldToCode(this,"ISR");    

    var symbols = this.getRootBlock().symbols;
    var symbol = symbols.exists(name);
    if ( !symbol || symbol[3] != symbols.ISR_SYMBOL) {
        ErrorMgr.addError(this,_("err.WRONG_NAME")+": " + name );
    }
    
    return "Wire.onReceive(" + name + ");";
  }
}
Blockly.Blocks['dev_i2c_on_receive'] = Abbozza.DeviceI2COnReceive;


/**
 * 
 */
Abbozza.DeviceI2COnRequest = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.I2C"));
    this.appendDummyInput()
    	.appendField(__("dev.I2C_REQUEST",0))
        .appendField(new FunctionDropdown(this, null,true), "ISR")
    	.appendField(__("dev.I2C_REQUEST",1));
    this.setInputsInline(true);   
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  },
  
  generateCode : function(generator) {
    var name =  generator.fieldToCode(this,"ISR");    

    var symbols = this.getRootBlock().symbols;
    var symbol = symbols.exists(name);
    if ( !symbol || symbol[3] != symbols.ISR_SYMBOL) {
        ErrorMgr.addError(this,_("err.WRONG_NAME")+": " + name );
    }
    
    return "Wire.onRequest(" + name + ");";
  }
}
Blockly.Blocks['dev_i2c_on_request'] = Abbozza.DeviceI2COnRequest;