/**
 * @license
 * abbozza!
 *
 * File: Configuration.js
 * 
 * Copyright 2015-2018 Michael Brinkmeier
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
 * @fileoverview Configuration
 * 
 * A singleton object managing the configuration of the abbozza! client.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 * 
 * NOT SYSTEM SPECIFIC
 */

// Required for the pop-down menu entries
goog.require('Blockly.Msg');


/**
 * The configuration object stores the parameters and manages the locale.
 * 
 * @type type
 */
var Configuration = {
    locale: "de",
    // --- deprectaed -- locales		: [],
    xmlLocale: null,
    xmlLocale2: null,
    parameters: []
};

/**
 * This operation loads the parameters from the abbozza! server.
 * It initializes the toolbox.
 * 
 * @returns {undefined}
 */
Configuration.load = function () {

    // var waiting = true;

    Connection.getTextSynced("/abbozza/config",
            function (response) {
                Configuration._apply(response, true);
            },
            function (response) {
                console.log("error");
            }
    );

    Board.load(false);
};

/**
 * This operation loads the parameters from the abbozza! server.
 * It initializes the toolbox.
 * 
 * @returns {undefined}
 */
Configuration.set = function(key,value) {

    // var waiting = true;

    Connection.getTextSynced("/abbozza/config?" + key + "=" + value,
            function (response) {
                // Configuration._apply(response, true);
            },
            function (response) {
                // console.log("error");
            }
    );

    Board.load(false);
};


/**
 * This operation loads the parameters from a given string.
 * It rebuilds the toolbox.
 * 
 * The string has to be of the form 
 * { parameter=value , parameter=value, ... }
 * 
 * @param {type} config
 * @returns {undefined}
 */
Configuration.apply = function (config) {
    this._apply(config, false);
};


/**
 * This operation parses the string and stores the parameters.
 * 
 * @param {type} config
 * @param {type} init
 * @returns {undefined}
 */
Configuration._apply = function (config, init) {
    config = config.replace(/{/g, "");
    config = config.replace(/}/g, "");
    var pars = config.split(",");
    for (var i = 0; i < pars.length; i++) {
        pars[i] = pars[i].trim();
        pair = pars[i].split("=");
        this.setParameter(pair[0], pair[1]);
    }

    // Check the Coloring strategy
    if (Configuration.getParameter("option.colorType") == "true") {
        ColorMgr._strategy = ColorMgr.BY_TYPE;        
    } else if (Configuration.getParameter("option.colorCategory") == "true") {
        ColorMgr._strategy = ColorMgr.BY_CATEGORY;
    } else {
        ColorMgr._strategy = ColorMgr.BY_DEFAULT;            
    }

    // Get timeout
    var timeout = Configuration.getParameter("timeout");
    if (timeout) {
        Abbozza.generationTimeout = timeout;
        Abbozza.uploadTimeout = timeout;
    }
    
    if (init) {
        ToolboxMgr.rebuild(true);
    } else {
        ToolboxMgr.rebuild(false);
    }

    Blockly.mainWorkspace.render();
};



/**
 * This operation sets a parameter to the given value.
 * If it already exists the value is replaced. Otherwise its is
 * added.
 * 
 * @param {type} par
 * @param {type} value
 * @returns {undefined}
 */
Configuration.setParameter = function (par, value) {
    var set = false;

    for (var i = 0; i < this.parameters.length; i++) {
        if (this.parameters[i][0] == par) {
            this.parameters[i][1] = value;
            set = true;
        }
    }
    if (!set)
        this.parameters.push([par, value]);

    // Apply the parameter, id possible
    switch (par) {
        case "locale" :
            this.setLocale(value);
            break;
        case "serverPort" :
            Abbozza.serverPort = value;
            break;
        case "tasksEditable" :
            if ( Configuration.getParameter("tasksEditable") == null ) {
                TaskWindow.setEditable(true);
            } else {
                TaskWindow.setEditable(Configuration.getParameter("tasksEditable") == "true");
            }
        default:
            break;
    }
};

/**
 * This operation gets the value of a given parameter.
 * 
 * @param {type} par
 * @returns {Configuration@arr;@arr;parameters}
 */
Configuration.getParameter = function (par) {
    for (var i = 0; i < this.parameters.length; i++) {
        if (this.parameters[i][0] == par) {
            return this.parameters[i][1];
        }
    }
    return null;
};


/**
 * This operation returns a string representation of all parameters starting
 * with "option." 
 * 
 * @returns {undefined}
 */
Configuration.getOptionString = function() {
    var result = "";
    for (var i = 0; i < this.parameters.length; i++) {
        if (this.parameters[i][0].startsWith("option.")) {
            if ( result != "" ) result = result + ",";
            result = result + this.parameters[i][0] + "=" + this.parameters[i][1];
        }
    }
    result = "{" + result + "}";
    return result;
};

/**
 * This operation sets the locale.
 * 
 * @param {type} loc
 * @returns {undefined}
 */
Configuration.setLocale = function (loc) {
    this.locale = loc;
   
   this.xmlLocale = Connection.getXMLSynced("/abbozza/locale", function(xml){}, function(xml){});
   
    if (Blockly.mainWorkspace)
        Blockly.mainWorkspace.resize();

    Blockly.Msg.COLLAPSE_ALL = _("menu.collapse_blocks");
    Blockly.Msg.COLLAPSE_BLOCK = _("menu.collapse_block");
    Blockly.Msg.ADD_COMMENT = _("menu.add_comment");
    Blockly.Msg.REMOVE_COMMENT = _("menu.remove_comment");
    Blockly.Msg.DELETE_BLOCK = _("menu.delete_block");
    Blockly.Msg.DUPLICATE_BLOCK = _("menu.duplicate_block");
    // Blockly.Msg.DUPLICATE_X_BLOCKS = _("menu.duplicate_block");
    Blockly.Msg.EXPAND_ALL = _("menu.expand_all");
    Blockly.Msg.EXPAND_BLOCK = _("menu.block_expand");
    Blockly.Msg.HELP = _("menu.help");
    Blockly.Msg.DELETE_X_BLOCKS = _("menu.delete_x_blocks");
    Blockly.Msg.ENABLE_BLOCK = _("menu.enable_block");
    Blockly.Msg.DISABLE_BLOCK = _("menu.disable_block");
    Blockly.Msg.EXTERNAL_INPUTS = _("menu.external_inputs");
    Blockly.Msg.INLINE_INPUTS = _("menu.inline_inputs");
};


/**
 * DEPRECATED OPERATIONS
 */
Configuration.readCookie = function () {
    var e = new Error("Configuratio readCookie deprecated");
    console.log(e.stack);
};


Configuration.readParameters = function () {
    var e = new Error("Configuratio readParameters deprecated");
    console.log(e.stack);
};


Configuration.readBlock = function (block) {
    var e = new Error("Configuratio.readBlock deprecated");
    console.log(e.stack);
};


Configuration.setBlock = function (block) {
    var e = new Error("Configuratio.setBlock deprecated");
};


Configuration.writeCookie = function () {
    var e = new Error("Configuratio.writeCookie deprecated");
    console.log(e.stack);
};


Configuration.checkLocale = function (loc) {
    Abbozza.showDeprecatedMsg("Configuration.checkLocale");
    return false;
};



Configuration.getLocales = function () {
    Abbozza.showDeprecatedMsg("Configuration.getLocales");
    return null;
};


Configuration.readFeatures = function () {
    Abbozza.showDeprecatedMsg("Configuration.readFeatures");
};


Configuration.setLocales = function (xmlLocales) {
    var elements = xmlLocales.getElementsByTagName("locale");
    for (var i = 0; i < elements.length; i++) {
        this.locales.push([elements[i].textContent, elements[i].id]);
    }
};

/**
 * This function returns the localized string.
 * 
 * @param id The id of the String.
 * @param args An array of arguments inserted into the string (e.g. /#1 for args[1] )
 * 
 * @returns The respective localized string
 */
_ = function (id, args) {
    id = id.toLowerCase();
    if (Configuration == null || Configuration.xmlLocale == null ) return id;
    
    // var el = Configuration.xmlLocale.getElementById(id);
    var el = Configuration.xmlLocale.querySelector("[id='" + id + "']");
    if (!el && Configuration.xmlLocale2) {
        // el = Configuration.xmlLocale2.getElementById(id);
        el = Configuration.xmlLocale2.querySelector("[id='" + id + "']");
    }
    
    if (el) {
        if (args == null) {
            return el.textContent;
        } else {
            var text = el.textContent;
            var pattern;
            for (var i = 0; i < args.length; i++) {
                pattern = "";
                text = text.replace(/#/, args[i]);
            }
            return text;
        }
    }
    return "<" + id + ">";
    
};

/**
 * This function returns the localized string.
 * 
 * @param {type} id The string id
 * @param {type} num The number of its element (seperated by #
 * @returns {String}
 */
__ = function (id, num) {
    id = id.toLowerCase();
    // var el = Configuration.xmlLocale.getElementById(id);
    var el = Configuration.xmlLocale.querySelector("[id='" + id + "']");
    if (!el) {
        // el = Configuration.xmlLocale2.getElementById(id);
        if ( Configuration.xmlLocale2 ) {
            el = Configuration.xmlLocale2.querySelector("[id='" + id + "']");
        }
    }
    
    if (el) {
        var text = el.textContent;
        var ar = text.split("#");
        if (num < ar.length) {
            return text.split("#")[num].trim();
        } else {
            return "";
        }
    }
    return "<" + id + ">";
};

