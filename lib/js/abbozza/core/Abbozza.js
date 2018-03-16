/**
 * @license 
 * abbozza!
 * 
 * File: Abbozza.js
 * 
 * The core object of the abbozza! client
 * 
 * Copyright 2015-2018 Michael Brinkmeier
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

var Abbozza = {
    modified: false,
    serverPort: -1,
    Socket: null,
    // --- not needed ?! --- Dragger: new Dragger(),
    Generator: new AbbozzaGenerator(),
    ReservedWords: ReservedWords,
    globalSymbols: null,
    blockMain: null,
    blockDevices: null,
    blockLogo: null,
    blockConf: null,
    logging: true,
    varWin: null,
    srvWin: null,
    msgWin: null,
    statusBox: null,
    devices: new DeviceDB(),
    HELP_URL: "http://inf-didaktik.rz.uni-osnabrueck.de/abbozza/help",
    systemPrefix: "arduino",
    pathPrefix: "",
    missingBlocks: [],
    devicesAllowed: false,

    sketchDescription: "",
    sketchApplyOptions: false,
    sketchProtected: false,

    generationTimeout: 120000,
    uploadTimeout: 120000,
    infoWin: null,
    board: Board,
    serialRate: 115200
};

// Original mutator icon
// Blockly.Mutator.prototype.png_ = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAANyAAADcgBffIlqAAAAAd0SU1FB98DGhULOIajyb8AAAHMSURBVDjLnZS9SiRBFIXP/CQ9iIHgPoGBTo8vIAaivoKaKJr6DLuxYqKYKIqRgSCMrblmIxqsICgOmAriziIiRXWjYPdnUDvT2+PMsOyBoop7qk71vedWS5KAkrWsGUMjSYjpgSQhNoZGFLEKeGoKGMNttUpULkOhAFL3USiA70MQEBnDDeDJWtaqVaJeB7uNICAKQ1ZkDI1yufOm+XnY2YHl5c6874MxPClJiDulkMvBxYWrw/095POdU0sS4hxALqcWtreloSGpVJLGxtL49bX0+Ci9vUkzM2kcXGFbypUKxHHLBXZ3YW4ONjfh4yN1aGIiPQOQEenrg6MjR+zvZz99Y8PFT09hYCArktdfsFY6PHTr83NlUKu5+eREennJchmR/n5pYcGtJyezG6em3Dw7Kw0OZrlMOr6f1gTg4ACWlmBvz9WoifHxbDpf3Flfd+54njQ9ncYvL6WHB+n9XVpcbHOnW59IUKu5m+p11zftfLHo+qRorZ6Hh/Xt7k5fsLUl1evS1dWfG9swMiJZq9+KIlaD4P/eztkZNgz5LsAzhpvjY6JK5d9e8eioE3h95SdQbDrkhSErxvArjkl6/U/imMQYnsKQH02BT7vbZZfVOiWhAAAAAElFTkSuQmCC';

// Adapted mutator icon
Blockly.Mutator.prototype.png_ = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAANyAAADcgBffIlqAAAAAd0SU1FB98DGhULOIajyb8AAAHMSURBVDjLnZS9SiRBFIXP/CQ9iIHgPoGBTo8vIAaivoKaKJr6DLuxYqKYKIqRgSCMrblmIxqsICgOmAriziIiRXWjYPdnUDvT2+PMsOyBoop7qk71vedWS5KAkrWsGUMjSYjpgSQhNoZGFLEKeGoKGMNttUpULkOhAFL3USiA70MQEBnDDeDJWtaqVaJeB7uNICAKQ1ZkDI1yufOm+XnY2YHl5c6874MxPClJiDulkMvBxYWrw/095POdU0sS4hxALqcWtreloSGpVJLGxtL49bX0+Ci9vUkzM2kcXGFbypUKxHHLBXZ3YW4ONjfh4yN1aGIiPQOQEenrg6MjR+zvZz99Y8PFT09hYCArktdfsFY6PHTr83NlUKu5+eREennJchmR/n5pYcGtJyezG6em3Dw7Kw0OZrlMOr6f1gTg4ACWlmBvz9WoifHxbDpf3Flfd+54njQ9ncYvL6WHB+n9XVpcbHOnW59IUKu5m+p11zftfLHo+qRorZ6Hh/Xt7k5fsLUl1evS1dWfG9swMiJZq9+KIlaD4P/eztkZNgz5LsAzhpvjY6JK5d9e8eioE3h95SdQbDrkhSErxvArjkl6/U/imMQYnsKQH02BT7vbZZfVOiWhAAAAAElFTkSuQmCC';


/**
 * Initialize abbozza!
 * 
 * @param {type} systemPrefix The system id
 * @param {type} devAllow A flag indicating, wether the device block is allowed.
 * @param {type} helpUrl The base URL for help.
 * @returns {undefined}
 */
Abbozza.init = function (systemPrefix, devAllow, helpUrl) {

    if (typeof helpUrl != "undefined") {
        this.HELP_URL = helpUrl;
    }

    this.systemPrefix = systemPrefix;
    if (devAllow)
        this.devicesAllowed = devAllow;

    this.pathPrefix = this.systemPrefix + "/";

    window.name = "abbozzaWorkspace";

    // Check APIs
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    /**
     * Disable context menu of browser
     */
    document.oncontextmenu = function (event) {
        return false;
    }

    /**
     * Adding String.prototype.startsWith for JavaFX WebEngine
     */
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // 
    // --- not needed ?! ---
    // Initialize DraggingManager
    // this.Dragger.init();
    // ------

    Board.init(this.systemPrefix);

    Configuration.load();

    TaskWindow.init();

    Blockly.bindEvent_(document, 'blocklySelectChange', null,
            Abbozza.changeSelection);
    Blockly.addChangeListener(Abbozza.onChange);
    window.Blockly = Blockly;

    var but = document.getElementById("generate");
    but.setAttribute("title", _("gui.generate_button"));
    but = document.getElementById("upload");
    but.setAttribute("title", _("gui.upload_button"));
    but = document.getElementById("new");
    but.setAttribute("title", _("gui.new_button"));
    but = document.getElementById("load");
    but.setAttribute("title", _("gui.load_button"));
    but = document.getElementById("save");
    but.setAttribute("title", _("gui.save_button"));
    but = document.getElementById("tools");
    but.setAttribute("title", _("gui.serial_button"));
    but = document.getElementById("connect");
    but.setAttribute("title", _("gui.connect_button"));
    but = document.getElementById("config");
    but.setAttribute("title", _("gui.config_button"));
    but = document.getElementById("info");
    but.setAttribute("title", _("gui.info_button"));

    Abbozza.buildToolsMenu();

    // Check request for query
    if (window.location.search != "") {
        // A sketch should be loaded from sketchPath
        var sketchPath = "/abbozza/load?" + window.location.search.substring(1);
        Connection.getXML(sketchPath,
                function (response) {
                    Abbozza.setSketch(response, window.location.hash.substr(1));
                },
                function (response) {
                    var args = [];
                    args.push(sketchPath);
                    Abbozza.openOverlay(_("msg.invalid_sketch", args))
                    Abbozza.overlayWaitForClose();
                    Abbozza.newSketch();
                }
        );
    } else {
        // Inject starting Blocks
        this.newSketch();
    }

    // Initalize generator
    // This operation reads the code template
    this.Generator.init();

};


/**
 * Delete the sketch stored in browser memory.
 * @returns {undefined}
 */
Abbozza.clearTempSketch = function () {
    localStorage.removeItem("abbozza_temp_sketch");
}


/**
 * Store the current sketch in browser memory.
 * 
 * @returns {undefined}
 */
Abbozza.storeTempSketch = function () {
    // Get current sketch
    var xml = Abbozza.workspaceToDom(Blockly.mainWorkspace);

    var desc = document.createElement("description");
    desc.textContent = Abbozza.sketchDescription;
    xml.appendChild(desc);

    var task = document.createElement("task");
    task.textContent = TaskWindow.getContent(); // Abbozza.taskContent;
    task.setAttribute("width", TaskWindow.getWidth());
    task.setAttribute("height", TaskWindow.getHeight());
    xml.appendChild(task);


    localStorage.setItem("abbozza_temp_sketch", Blockly.Xml.domToText(xml));
};


/**
 * This operation builds a new sketch.
 * 
 * @returns {undefined}
 */
Abbozza.newSketch = function () {
    if (this.modified && !this.askForSave())
        return;

    TaskWindow.setContent("", true);
    TaskWindow.setSize(600, 400);
    // Abbozza.taskContent = "";
    Abbozza.sketchDescription = "";
    Abbozza.sketchApplyOptions = false;
    Abbozza.sketchProtected = false;

    this.clear();
    // Blockly.Block.obtain(Blockly.mainWorkspace,'base_setup');

    var sketch = localStorage.getItem("abbozza_temp_sketch");
    Abbozza.clearTempSketch();
    if (sketch != null) {
        // var xmlSketch = Blockly.Xml.textToDom(sketch);
        var parser = new DOMParser();
        var xmlSketch = parser.parseFromString(sketch, "text/xml");
        this.setSketch(xmlSketch);
        this.clearTempSketch();
        Abbozza.modified = false;
        return;
    } else {
        if ((Configuration.getParameter("option.devices") == "true") && this.devicesAllowed) {
            // new
            Blockly.Xml.domToWorkspace(document.getElementById('startBlocks'), Blockly.mainWorkspace);
            // old
            // Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, document.getElementById('startBlocks') );        
        } else {
            // new
            Blockly.Xml.domToWorkspace(document.getElementById('startBlocksWoDevices'), Blockly.mainWorkspace);
            // old
            // Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, document.getElementById('startBlocksWoDevices'));
        }
    }


    var blocks = Blockly.mainWorkspace.getTopBlocks();

    // First look for devices
    this.blockMain = null;
    this.blockDevices = null;

    for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].type == "main") { // devices
            this.blockMain = blocks[i];
            // this.blockMain.setTitle(_("GLOBALVARS"));
            this.blockMain.setPreviousStatement(false);
            this.blockMain.setSymbolDB(this.globalSymbols);
        } else if (blocks[i].type == "devices") {
            this.blockDevices = blocks[i];
        }
    }

    if (this.blockMain == null) {
        this.blockMain = Blockly.mainWorkspace.newBlock("main");
        this.blockMain.setPreviousStatement(false);
        this.blockMain.setSymbolDB(this.globalSymbols);
        this.blockMain.initSvg();
        this.blockMain.moveBy(20, 20);
    }

    if (this.devicesAllowed && (this.blockDevices == null) && (Configuration.getParameter("option.devices") == "true")) {
        this.blockDevices = Blockly.mainWorkspace.newBlock("devices");
        this.blockDevices.initSvg();
        this.blockDevices.moveBy(500, 20);
    }


    // Now look for the rest
    for (i = 0; i < blocks.length; i++) {
        if (blocks[i].type == "func_loop") {
            symbols = new SymbolDB();
            blocks[i].setSymbolDB(symbols);
            this.globalSymbols.addFunction("loop", "VOID", null);
            this.globalSymbols.addChild(symbols, "loop");
        } else if (blocks[i].type == "func_setup") {
            symbols = new SymbolDB();
            blocks[i].setSymbolDB(symbols);
            this.globalSymbols.addFunction("setup", "VOID", null);
            this.globalSymbols.addChild(symbols, "setup");
        }
    }

    // var ww = Blockly.mainWorkspace.getWidth();

    this.blockLogo = null;
    this.blockConf = null;
    
    // Rewrite the displayed URL
    history.pushState(null,null,"/" + Abbozza.systemPrefix + ".html");
};


/**
 * Set the workspace to the given sketch.
 * 
 * @param {type} sketch The dom containing the blocks
 * @param {type} page The page to be displayed in the task window
 * @returns {undefined}
 */
Abbozza.setSketch = function (sketch, page) {
    TaskWindow.hide();

    // Retrieve description from sketch
    var desc = sketch.getElementsByTagName("description");
    if (desc[0]) {
        Abbozza.sketchDescription = desc[0].textContent;
    } else {
        Abbozza.sketchDescription = _("msg.sketch_description");
    }

    // Fetch Sketch options
    var opts = sketch.getElementsByTagName("options");
    if (opts[0]) {
        Abbozza.sketchApplyOptions = (opts[0].getAttribute("apply") == "yes");
        Abbozza.sketchProtected = (opts[0].getAttribute("protected") == "yes");

        if (Abbozza.sketchApplyOptions) {
            var options = opts[0].textContent;
            Configuration.apply(options);
        }
    } else {
        Abbozza.sketchApplyOptions = false;
        Abbozza.sketchProtected = false;
    }

    var task = sketch.getElementsByTagName("task");
    if (task[0]) {
        TaskWindow.setContent(task[0].textContent, true);
        TaskWindow.setSize(task[0].getAttribute("width"), task[0].getAttribute("height"));
        // Abbozza.taskContent = task[0].textContent;
    } else {
        TaskWindow.setContent("", true);
        TaskWindow.setSize(600, 400);
        // Abbozza.taskContent="";
    }

    Abbozza.setBlocks(sketch.firstChild);

    if (Abbozza.sketchProtected) {
        var blocks = Blockly.mainWorkspace.getAllBlocks();
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].setDeletable(false);
        }
    }

    // Check if TaskWindow contains something
    if (!TaskWindow.isCurrentPageEmpty()) {
        TaskWindow.show();
        if (page)
            TaskWindow.setPage_(parseInt(page) - 1);
    }

    this.modified = false;
}

/**
 * Show the info page.
 * 
 * @returns {undefined}
 */
Abbozza.showInfo = function () {
    Connection.getText("/abbozza/info");
}

/**
 * Select the board.
 * 
 * @returns {undefined}
 */
Abbozza.selectBoard = function () {
    Board.load(true);
}

/**
 * Show the configuration dialog.
 * 
 * @returns {undefined}
 */
Abbozza.showConfiguration = function () {
    Abbozza.storeTempSketch();
    Abbozza.openOverlay(_("msg.open_config"));
    Connection.getText("/abbozza/frame", function (text) {
        Abbozza.closeOverlay();
        Configuration.apply(text);
        // Trigger a reload
        window.location.reload();
    }, function (text) {
        Abbozza.clearTempSketch();
        Abbozza.closeOverlay();
    });
}

/**
 * Load a sketch from the server. Set the URL with an empty query afterwards.
 * 
 * @returns {undefined}
 */
Abbozza.loadSketch = function () {
    if (this.modified && !this.askForSave())
        return;

    var xml = document.createElement("abbozza");
    Abbozza.openOverlay(_("msg.load_sketch"));
    var sketch = Connection.getXML("/abbozza/load",
            function (sketch) {
                Abbozza.closeOverlay();
                Abbozza.newSketch();
                Abbozza.setSketch(sketch);
                history.pushState(null,null,"/" + Abbozza.systemPrefix + ".html");
            },
            function (response) {
                Abbozza.closeOverlay();
            }
    );
}

/**
 * Save the current workspace.
 * 
 * @returns {undefined}
 */
Abbozza.saveSketch = function () {
    // First fetch the modified con tent of TaskWindow
    if ( TaskWindow.editing_ ) {
        TaskWindow.setPage_(TaskWindow.currentPage_,true);
    }
    var xml = Abbozza.workspaceToDom(Blockly.mainWorkspace);

    var desc = document.createElement("description");
    desc.textContent = Abbozza.sketchDescription;
    xml.appendChild(desc);

    var opts = document.createElement("options");
    xml.appendChild(opts);
    opts.setAttribute("apply", Abbozza.sketchApplyOptions ? "yes" : "no");
    opts.setAttribute("protected", Abbozza.sketchProtected ? "yes" : "no");

    var task = document.createElement("task");
    task.textContent = TaskWindow.getContent(); // Abbozza.taskContent;
    task.setAttribute("width", TaskWindow.getWidth());
    task.setAttribute("height", TaskWindow.getHeight());

    xml.appendChild(task);

    opts.textContent = Configuration.getOptionString();

    Abbozza.openOverlay(_("msg.save_sketch"));
    Connection.sendXML("/abbozza/save", Blockly.Xml.domToText(xml),
            function (response) {
                Abbozza.closeOverlay();
                this.modified = false;
            },
            function (response) {
                Abbozza.closeOverlay();
            }
    );
}

/**
 * Generate the sketch, ie. the source code, form the current workspace.
 * 
 * @returns {undefined}
 */
Abbozza.generateSketch = function () {
    Abbozza.openOverlay(_("msg.generate_sketch"));
    var code = this.Generator.workspaceToCode();
    if (!ErrorMgr.hasErrors()) {
        Abbozza.appendOverlayText(_("msg.code_generated"));
        Abbozza.appendOverlayText(_("msg.compiling"));
        Connection.sendText("/abbozza/check", code,
                function (response) {
                    Abbozza.appendOverlayText(_("msg.done_compiling"));
                    Abbozza.closeOverlay();
                },
                function (response) {
                    if (response == "TIMEOUT") {
                        Abbozza.appendOverlayText("<br/>" + _("msg.compile_timeout") + "<br/>");
                        Abbozza.overlayWaitForClose();
                    } else {
                        Abbozza.appendOverlayText("<br/>" + _("msg.error_compiling") + "<br/>");
                        response = response.replace(/\n/g, "<br/>");
                        Abbozza.appendOverlayText("<pre id='overlay_err'>" + response + "</pre>");
                        Abbozza.overlayWaitForClose();
                    }
                }
        , this.generationTimeout);
    } else {
        Abbozza.closeOverlay();
    }
}

/**
 * Upload the sketch to the server.
 * 
 * @returns {undefined}
 */
Abbozza.uploadSketch = function () {
    Abbozza.openOverlay(_("msg.generate_sketch"));
    var code = this.Generator.workspaceToCode();
    if (!ErrorMgr.hasErrors()) {
        Abbozza.appendOverlayText(_("msg.code_generated"));
        var content = document.createTextNode(code);
        // Check for board
        var boardFound = false;
        Connection.getTextSynced("/abbozza/board",
                function (response) {
                    boardFound = true;
                },
                function (response) {
                    boardFound = false;
                    Abbozza.appendOverlayText(_("msg.no_board"));
                    Abbozza.appendOverlayText(_("msg.compiling"));
                    Connection.sendText("/abbozza/check", code,
                            function (response) {
                                Abbozza.appendOverlayText(_("msg.done_compiling"));
                                Abbozza.overlayWaitForClose();
                            },
                            function (response) {
                                if (response == "TIMEOUT") {
                                    Abbozza.appendOverlayText("<br/>" + _("msg.upload_timeout") + "<br/>");
                                    Abbozza.overlayWaitForClose();
                                } else {
                                    Abbozza.appendOverlayText("<br/>" + _("msg.error_compiling") + "<br/>");
                                    Abbozza.appendOverlayText(response);
                                    Abbozza.overlayWaitForClose();
                                }
                            }
                    , this.uploadTimeout);
                    // Abbozza.overlayWaitForClose();
                });
        if (!boardFound)
            return;

        Abbozza.appendOverlayText(_("msg.compiling"));
        Connection.sendText("/abbozza/upload", code,
                function (response) {
                    Connection.getText("/abbozza/monitor_resume");
                    Abbozza.closeOverlay();
                },
                function (response) {
                    Abbozza.appendOverlayText("<br/>" + _("msg.error_compiling") + "<br/>");
                    response = response.replace(/\n/g, "<br/>");
                    Abbozza.appendOverlayText("<pre id='overlay_err'>" + response + "</pre>");
                    Abbozza.overlayWaitForClose();
                    Connection.getText("/abbozza/monitor_resume");
                });
    } else {
        Abbozza.closeOverlay();
    }
}

/**
 * Open the serial monitor.
 * 
 * @returns {undefined}
 */
Abbozza.serialMonitor = function () {
    Connection.getText("/abbozza/monitor",
            function (text) {
            },
            function (text) {
            });
}

/**
 * Ask if the sketch should be saved.
 * 
 * @returns {Abbozza.askForSave.result}
 */
Abbozza.askForSave = function () {
    var result = confirm(_("msg.drop_sketch"));
    return result;
}

/**
 * Handler for change events.
 * 
 * @param {type} event The event fired
 * @returns {undefined}
 */
Abbozza.changeSelection = function (event) {
    if (Blockly.selected == null)
        return;
    var block = Blockly.selected.getRootBlock();
    if (block.symbols && Abbozza.varWin) {
        Abbozza.varWin.setText(block.symbols.toString());
    }
};


/**
 * Clear the workspace.
 * 
 * @returns {undefined}
 */
Abbozza.clear = function () {
    ErrorMgr.clearErrors();
    TaskWindow.hide();

    if (this.varWin)
        this.varWin.dispose();

    Blockly.mainWorkspace.clear();

    // Clear symbols
    var symbols;
    this.globalSymbols = new SymbolDB();
    Blockly.mainWorkspace.symbols = this.globalSymbols;
}

/**
 * Sets the blocks in the workspace.
 * 
 * @param {type} xml The dom containing the blocks.
 * @returns {undefined}
 */
Abbozza.setBlocks = function (xml) {
    this.clear();

    this.missingBlocks = [];

    Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);

    if (this.missingBlocks.length > 0) {
        Abbozza.openOverlay(_("gui.unknown_blocks"));
        Abbozza.overlayWaitForClose();
    }

    // Run through topBlocks and get everything right
    var topBlocks = Blockly.mainWorkspace.getTopBlocks();

    for (var i = 0; i < topBlocks.length; i++) {
        if (topBlocks[i].type == "main") {
            this.blockMain = topBlocks[i];
            this.globalSymbols = topBlocks[i].symbols;
            Blockly.mainWorkspace.symbols = this.globalSymbols;
        } else if (topBlocks[i].type == "devices") {
            this.blockDevices = topBlocks[i];
        }
    }

    if (this.blockMain == null) {
        this.blockMain = Blockly.mainWorkspace.newBlock("main");
        this.blockMain.setPreviousStatement(false);
        this.blockMain.setSymbolDB(this.globalSymbols);
        this.blockMain.initSvg();
        this.blockDevices.moveBy(20, 20);
    }

    if (this.devicesAllowed && (this.blockDevices == null) && (Configuration.getParameter("option.devices") == "true")) {
        this.blockDevices = Blockly.mainWorkspace.newBlock("devices");
        this.blockDevices.initSvg();
        this.blockDevices.moveBy(500, 20);
    }

    for (i = 0; i < topBlocks.length; i++) {
        if (topBlocks[i].type == "func_loop") {
            this.globalSymbols.addFunction("loop", "VOID", null);
            this.globalSymbols.addChild(topBlocks[i].symbols, "loop");
        } else if (topBlocks[i].type == "func_setup") {
            this.globalSymbols.addFunction("setup", "VOID", null);
            this.globalSymbols.addChild(topBlocks[i].symbols, "setup");
        } else if (topBlocks[i].type == "func_decl") {
            var name = topBlocks[i].name;
            this.globalSymbols.addChild(topBlocks[i].symbols, name);
        }

    }

    var ww = Blockly.mainWorkspace.getWidth();

    this.blockLogo = null;
    this.blockConf = null;

    var blocks = Blockly.mainWorkspace.getAllBlocks();
    for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].onload) {
            blocks[i].onload();
        }
    }
    Blockly.mainWorkspace.render();
}

/**
 * Create the dom from the current workspace.
 * 
 * @param {type} workspace The workspace.
 * @returns {Abbozza.workspaceToDom.xml} The dom of the workspaces content
 */
Abbozza.workspaceToDom = function (workspace) {
    var width;
    if (Blockly.RTL) {
        width = workspace.getWidth();
    }
    var xml = goog.dom.createDom('xml');
    var blocks = workspace.getTopBlocks(true);
    for (var i = 0, block; block = blocks[i]; i++) {
        var element = Blockly.Xml.blockToDom(block);
        var xy = block.getRelativeToSurfaceXY();
        element.setAttribute('x', Blockly.RTL ? width - xy.x : xy.x);
        element.setAttribute('y', xy.y);
        xml.appendChild(element);
    }
    return xml;
}

/**
 * Show an info message.
 * 
 * @param {type} text
 * @param {type} open
 * @returns {undefined}
 */
Abbozza.showInfoMessage = function (text) {
    this.showInfoMessage(text, true);
}

/**
 * Show an info message.
 * 
 * @param {type} text The displayed text.
 * @param {type} open A flag indicating, wether the info message really should 
 *                    be shown.
 * @returns {undefined}
 */
Abbozza.showInfoMessage = function (text, open) {
    if (this.infoWin == null && open == true) {
        var vw = Blockly.mainWorkspace.getMetrics().viewWidth;
        var vh = Blockly.mainWorkspace.getMetrics().viewHeight;
        // var wh = Blockly.mainWorkspace.getHeight();
        this.infoWin = new InternalWindow(Blockly.mainWorkspace,
                this.blockMain, _("INFOMSG"), "abbozzaMsgWin", 0,
                vh - 30, 500, 130, function (event) {
                    if (Abbozza.infoWin != null) {
                        Abbozza.infoWin.dispose();
                        Abbozza.infoWin = null;
                    }
                });
        this.infoWin.setText("");

    }
    if (this.infoWin)
        this.infoWin.appendText(text + "\n");
}

/**
 * Add a dispose handler to the given block.
 * 
 * @param {type} block The block
 * @returns {undefined}
 */
Abbozza.addDisposeHandler = function (block) {
    if (!block.onDispose)
        return;
    block.oldDispose_ = block.dispose;
    block.dispose = function (healStack, animate, opt_dontRemoveFromWorkspace) {
        block.onDispose();
        block.oldDispose_(healStack, animate, opt_dontRemoveFromWorkspace);
    }
}

/**
 * Open the task window.
 * 
 * @returns {undefined}
 */
Abbozza.openTaskWindow = function () {
    TaskWindow.show();
}

/**
 * OVERLAY OPERATIONS
 */

/**
 * Opens the overlay for messages
 * 
 * @param {type} text The text to be displayed
 * @returns {undefined}
 */
Abbozza.openOverlay = function (text) {
    overlay = document.getElementById("overlay");
    overlay_content = document.getElementById("overlay_content");
    overlay.style.display = "block";
    overlay.style.zIndex = 42;
    overlay_content.innerHTML = "<span>" + text + "</span>";
    this.overlay_closeable = false;
}

/**
 * Appends a text to the overlay message.
 * 
 * @param {type} text The text to be appended.
 * @returns {undefined}
 */
Abbozza.appendOverlayText = function (text) {
    overlay_content.innerHTML = overlay_content.innerHTML + "<br/><span>" + text + "</span>";

}

/**
 * Close the overlay.
 * 
 * @returns {undefined}
 */
Abbozza.closeOverlay = function () {
    overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    overlay.style.zIndex = -1;
    this.overlay_closeable = false;
    overlay_content.style.backgroundColor = "#f0f0f0";
}

/**
 * Wait for thhe overlay to be closed by the user.
 * @returns {undefined}
 */
Abbozza.overlayWaitForClose = function () {
    this.overlay_closeable = true;
    Abbozza.appendOverlayText("");
    Abbozza.appendOverlayText(_("msg.click_to_continue"));
    overlay_content.style.backgroundColor = "#ffd0d0";
}

/**
 * A handler called if the overlay is clicked.
 * @param {type} overlay
 * @param {type} event
 * @returns {undefined}
 */
Abbozza.overlayClicked = function (overlay, event) {
    if (this.overlay_closeable)
        Abbozza.closeOverlay();
}


/**
 * A handler called if a key is pressed while the overlay is shown.
 * @returns {undefined}
 */
Abbozza.overlayKeyPressed = function () {}


/**
 * MISC
 */

/**
 * This handler is called if the workspace content was changed. It checks
 * if a unconfirmed block becomes confirmed or is removed from its parent.
 * In the second case it is disposed.
 * 
 * @param {type} event The event
 * @returns {undefined} Nothing
 */
Abbozza.onChange = function (event) {
    if (event.type == "change") {
        var block = Blockly.mainWorkspace.getBlockById(event.blockId);
        if ((block) && (typeof (block.confirmed) != "undefined") && (block.confirmed == false)) {
            block.confirm(true);
        }
        // Abbozza.modified = true;
    }
    if (event.type == "move") {
        var block = Blockly.mainWorkspace.getBlockById(event.blockId);
        if ((block) && (typeof (block.confirmed) != "undefined") && (block.confirmed == false)) {
            if (block.getParent() == null) {
                block.dispose(true);
            }
        }
        // Abbozza.modified = true;
    }
    if ((event.type == "create") || (event.type == "delete")) {
        // Abbozza.modified = true;
    }
}


/**
 * Block helpers
 */

/**
 * Get the id of a block, which is stored in block.data
 * 
 * @param {type} block The block.
 * @returns {String} The id of the blocke.
 */
Abbozza.getBlockId = function (block) {
    return block.data;
}

/**
 * Ask for the id of a block. It is stored in block.data.
 * 
 * @param {type} block The block
 * @returns {undefined}
 */
Abbozza.setBlockId = function (block) {
    var id = Abbozza.getBlockId(block);
    id = prompt(_("gui.ask_for_id"), id);
    if (id != null) {
        block.data = id;
    }
}

/**
 * Returns the blocks with the given id.
 * 
 * @param {type} id The id.
 * @returns {Array|Abbozza.getBlocksById.result} An array or a single block.
 */
Abbozza.getBlocksById = function (id) {
    var id_;
    var result = [];
    var blocks = Blockly.mainWorkspace.getAllBlocks();
    for (var i = 0; i < blocks.length; i++) {
        id_ = Abbozza.getBlockId(blocks[i]);
        if (id_ == id) {
            result.push(blocks[i]);
        }
    }
    return result;
}



/**
 * Operations to handle the tols of plugins.
 */

/**
 * The array containing all tools.
 * 
 * @type Array
 */
Abbozza.tools = null;

/**
 * Register the tool for a plugin.
 * 
 * @param {type} plugin The id of the plugin.
 * @param {type} id The id of the tool.
 * @param {type} img The icon for the tool.
 * @param {type} callback The callback function.
 * @returns {undefined}
 */
Abbozza.registerPluginTool = function (plugin, id, img, callback) {
    if (Abbozza.tools == null) {
        Abbozza.tools = [];
    }
    Abbozza.tools.push([plugin, id, img, callback]);
}


/**
 * This operation builds the tool menu.
 * 
 * @returns {undefined} Nothing
 */
Abbozza.buildToolsMenu = function () {
    if (Abbozza.tools == null)
        return;
    for (var i = 0; i < Abbozza.tools.length; i++) {
        Abbozza.addPluginTool(Abbozza.tools[i][0], Abbozza.tools[i][1], Abbozza.tools[i][2], Abbozza.tools[i][3]);
    }
}


/**
 * Add a plugin tool to the menu.
 * 
 * @param {type} plugin The id of the plugin.
 * @param {type} title The title of the tool.
 * @param {type} img The icon used in the menu
 * @param {type} callback The callback function, if the menu item is clicked.
 * @returns {undefined} Nothing
 */
Abbozza.addPluginTool = function (plugin, title, img, callback) {
    var tools = document.querySelector("[id='tools']");
    var button = document.createElement("div");
    button.setAttribute("title", _(title));
    button.className = "toolButton";
    button.onclick = function () {
        Abbozza.callPluginTool(plugin, callback);
    }
    button.setAttribute("plugin", plugin);
    var image = document.createElement("img");
    image.src = img;
    button.appendChild(image);
    tools.appendChild(button);
}

/**
 * Calls the tool registered for the given plugin.
 * 
 * @param {type} plugin The id of the plugin.
 * @param {type} callback The callback function executed, if the plugin is activated
 * @returns {undefined}
 */
Abbozza.callPluginTool = function (plugin, callback) {
    if (Abbozza.isPluginActivated(plugin)) {
        callback.call(this);
    } else {
        Abbozza.openOverlay(__("gui.plugin_deactivated", 0) + plugin + __("gui.plugin_deactivated", 1));
        Abbozza.overlayWaitForClose();
    }
}

/**
 * This operation checks if a specific plugin is activated.
 * 
 * @param {type} plugin The id of the plugin.
 * @returns {Boolean} true if the plugin is activated, false otherwise.
 */
Abbozza.isPluginActivated = function (plugin) {
    var path = "/abbozza/plugin/" + plugin;
    var result;
    Connection.getTextSynced(path,
            function () {
                result = true;
            },
            function () {
                result = false;
            }
    );
    return result;
}


/**
 * BLOCKLY HACKS
 */


/**
 * Blockly hack to change the context menu
 * @param {type} menuOptions
 * @returns {undefined}
 */
Blockly.BlockSvg.prototype.customContextMenu = function (menuOptions) {
    var block = this;
    if (this.isDeletable()) {
        var protectOption = {
            text: _("gui.protect_block"),
            enabled: true,
            callback: function () {
                block.setDeletable(false);
            }
        }
        menuOptions.push(protectOption);
    } else if ((this.type != "main") && (this.type != "devices")) {
        var copyOption = {
            text: _("menu.duplicate_block"),
            enabled: true,
            callback: function () {
                // This is mainly the original code from Blockly.duplicate_
                // 
                // Save the clipboard.
                var clipboardXml = Blockly.clipboardXml_;
                var clipboardSource = Blockly.clipboardSource_;

                // Create a duplicate via a copy/paste operation.
                Blockly.copy_(block);
                block.workspace.paste(Blockly.clipboardXml_);
                // Make the copy deletable
                Blockly.selected.setDeletable(true);

                // Restore the clipboard.
                Blockly.clipboardXml_ = clipboardXml;
                Blockly.clipboardSource_ = clipboardSource;
            }
        }
        menuOptions.push(copyOption);
        var unprotectOption = {
            text: _("gui.unprotect_block"),
            enabled: true,
            callback: function () {
                block.setDeletable(true);
            }
        }
        menuOptions.push(unprotectOption);
    }
    var idOption = {
        text: _("gui.block_id") + (Abbozza.getBlockId(this) != "" ? " (" + Abbozza.getBlockId(this) + ")" : ""),
        enabled: true,
        callback: function () {
            Abbozza.setBlockId(block);
        }
    }
    menuOptions.push(idOption);
}


/**
 * DEPRECATED STUFF
 */

Abbozza.showDeprecatedMsg = function (text) {
    var err = new Error(text + " deprecated");
    console.log(err.stack);
}


/**
 * @deprecated ErrorMgr is responsible for errors.
 */
Abbozza.hideError = function () {
    e = new Error("Abbozza.hideError deprecated");
    console.log(e.stack);
    if (this.error != null) {
        this.error.setVisible(false);
        this.error.dispose();
    }
}

/**
 * @deprecated ErrorMgr is responsible for errors.
 */
Abbozza.addError = function (block, text) {
    e = new Error("Abbozza.addError deprecated");
    console.log(e.stack);
    ErrorMgr.addError(block, text);
}

/**
 * @deprecated ErrorMgr is responsible for errors.
 */
Abbozza.hasError = function () {
    e = new Error("Abbozza.hasError deprecated");
    console.log(e.stack);
    return ErrorMgr.hasErrors();
}

/**
 * @deprecated ErrorMgr is responsible for errors.
 */
Abbozza.delError = function (block) {
    e = new Error("Abbozza.delError deprecated");
    console.log(e.stack);
    return ErrorMgr.clearBlock(block);
}

/**
 * @deprecated ErrorMgr is responsible for errors.
 */
Abbozza.showError = function (block, text) {
    e = new Error("Abbozza.showError deprecated");
    console.log(e.stack);
}


/**
 * @deprecated ???
 * Create an editor for comments.
 * 
 * @returns {Abbozza.createEditor_.foreignObject_}
 */
Abbozza.createEditor_ = function () {
    e = new Error("Abbozza.createEditor_ deprecated");
    console.log(e.stack);
    var foreignObject_ = Blockly.createSvgElement('foreignObject', {
        'x': Blockly.Bubble.BORDER_WIDTH,
        'y': Blockly.Bubble.BORDER_WIDTH
    }, null);
    var body = document.createElementNS(Blockly.HTML_NS, 'body');
    body.setAttribute('xmlns', Blockly.HTML_NS);
    body.className = 'blocklyMinimalBody';
    var textarea_ = document.createElementNS(Blockly.HTML_NS, 'textarea');
    textarea_.className = 'blocklyCommentTextarea';
    textarea_.setAttribute('dir', Blockly.RTL ? 'RTL' : 'LTR');
    body.appendChild(textarea_);
    foreignObject_.appendChild(body);
    Blockly.bindEvent_(textarea_, 'mouseup', this, null);
    return foreignObject_;
}
