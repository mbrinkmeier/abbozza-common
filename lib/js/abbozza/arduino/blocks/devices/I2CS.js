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

DEV_TYPE_I2CS_MASTER = 50;
DEV_TYPE_I2CS_SLAVE = 51;

/**
 * I2CS Master Devices
 * 
 * @type type
 */
Abbozza.DeviceI2CSMaster = {
    devtype: DEV_TYPE_I2CS_MASTER,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.DEVICES"));
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/comm32.png",16,16))
                .appendField(__("dev.I2CS_MASTER",0));
//                .appendField(new FieldDevNameInput("<default>", Abbozza.blockDevices, this), "NAME");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(true, "DEVICE");
        this.setNextStatement(true, "DEVICE");
        this.setTooltip('');
        Abbozza.addDisposeHandler(this);
    },
    
    getName: function () {
        return("i2cs_master");
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
Blockly.Blocks['dev_i2cs_master'] = Abbozza.DeviceI2CSMaster;


/**
 * 
 * @type type
 */
Abbozza.DeviceI2CSSlave = {
    devtype: DEV_TYPE_I2CS_SLAVE,
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
        this.appendDummyInput()
                .appendField(new Blockly.FieldImage("img/devices/comm32.png",16,16))
                .appendField(__("dev.I2CS_SLAVE",0))
                .appendField(new Blockly.FieldNumber(8,8,127),"ADDRESS");
        this.setInputsInline(false);
        this.setOutput(false);
        this.setPreviousStatement(true, "DEVICE");
        this.setNextStatement(true, "DEVICE");
        this.setTooltip('');
        Abbozza.addDisposeHandler(this);
    },
    
    getName: function () {
        return "i2cs_slave";
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
Blockly.Blocks['dev_i2cs_slave'] = Abbozza.DeviceI2CSSlave;


/**
 * 
 * @type type
 */
Abbozza.DeviceI2CSMasterSend = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2CS_MASTER_SEND",0))        
                .setCheck("NUMBER");
        this.appendValueInput("VALUE")
                .appendField(__("dev.I2CS_MASTER_SEND",1))
                .setCheck(["STRING","NUMBER"]);
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
Blockly.Blocks['dev_i2cs_master_send'] = Abbozza.DeviceI2CSMasterSend;


/**
 * 
 * @type type
 */
Abbozza.DeviceI2CSMasterRequest = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
                
        this.appendValueInput("COUNT")
                .appendField(__("dev.I2CS_MASTER_REQUEST",0))
                .setCheck("NUMBER");
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2CS_MASTER_REQUEST",1))        
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
Blockly.Blocks['dev_i2cs_master_request'] = Abbozza.DeviceI2CSMasterRequest;



/**
 * 
 * @type type
 */
Abbozza.DeviceI2CSMasterBegin = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2CS_BEGIN",0))        
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
Blockly.Blocks['dev_i2cs_master_begin'] = Abbozza.DeviceI2CSMasterBegin;


/**
 * 
 * @type type
 */
Abbozza.DeviceI2CSMasterEnd = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
                
        this.appendDummyInput("ADDRESS")
                .appendField(__("dev.I2CS_END",0));
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
Blockly.Blocks['dev_i2cs_master_end'] = Abbozza.DeviceI2CSMasterEnd;

/**
 * 
 * @type type
 */
Abbozza.DeviceI2CSWrite = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2CS_WRITE",0))        
                .setCheck("NUMBER");
        this.appendValueInput("VALUE")
                .appendField(__("dev.I2CS_WRITE",1))
                .setCheck(["STRING","NUMBER"]);
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
Blockly.Blocks['dev_i2cs_write'] = Abbozza.DeviceI2CSWrite;


/**
 * 
 * @type type
 */
Abbozza.DeviceI2CSWriteArray = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
                
        this.appendValueInput("ADDRESS")
                .appendField(__("dev.I2CS_WRITE_ARRAY",0))        
                .setCheck("NUMBER");
        this.appendValueInput("VALUE")
                .appendField(__("dev.I2CS_WRITE_ARRAY",1))
                .setCheck(["STRING","NUMBER"]);
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
Blockly.Blocks['dev_i2cs_write_array'] = Abbozza.DeviceI2CSWriteArray;



/**
 * 
 */
Abbozza.DeviceI2CSAvailable = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
        this.appendDummyInput()
                .appendField(__("dev.I2CS_AVAILABLE",0));
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
Blockly.Blocks['dev_i2cs_available'] = Abbozza.DeviceI2CSAvailable;

/**
 * 
 */
Abbozza.DeviceI2CSRead = {
    init: function () {
        this.setHelpUrl(Abbozza.HELP_URL);
        this.setColour(ColorMgr.getColor("cat.I2CS"));
        this.appendDummyInput()
                .appendField(__("dev.I2CS_READ",0));
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
Blockly.Blocks['dev_i2cs_read'] = Abbozza.DeviceI2CSRead;



/**
 * 
 */
Abbozza.DeviceI2CSOnReceive = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.I2CS"));
    this.appendDummyInput()
    	.appendField(__("dev.I2CS_RECEIVE",0))
        .appendField(new FunctionDropdown(this, null,true), "ISR");
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
Blockly.Blocks['dev_i2cs_on_receive'] = Abbozza.DeviceI2CSOnReceive;


/**
 * 
 */
Abbozza.DeviceI2CSOnRequest = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.I2CS"));
    this.appendDummyInput()
    	.appendField(__("dev.I2CS_REQUEST",0))
        .appendField(new FunctionDropdown(this, null,true), "ISR");
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
Blockly.Blocks['dev_i2cs_on_request'] = Abbozza.DeviceI2CSOnRequest;