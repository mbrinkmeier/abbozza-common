/* global ErrorMgr, TaskWindow, Configuration, Connection, Board, goog, ReservedWords */

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
    reloadForced: false,

    sketchDescription: "",
    sketchApplyOptions: false,
    sketchProtected: false,

    generationTimeout: 120000,
    uploadTimeout: 120000,
    infoWin: null,
    board: Board,
    serialRate: 115200
};


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
    window.name = "abbozzaWorkspace";

    // Check APIs
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    // Adding String.prototype.startsWith for JavaFX WebEngine
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) == position;
        };
    }

    // Disable context menu of browser
    document.oncontextmenu = function (event) {
        return false;
    };

    // Set help URL
    if (typeof helpUrl != "undefined")
        this.HELP_URL = helpUrl;

    // Set the systems prefix
    this.systemPrefix = systemPrefix;
    this.pathPrefix = this.systemPrefix + "/";

    // Check if devices are allowed
    if (devAllow)
        this.devicesAllowed = devAllow;

    /**
     * React to back and forward button
     */
    window.addEventListener("popstate",
            /**
             * 
             * @param {type} event
             * @returns {undefined}
             */
                    function (event) {
                        Abbozza.setSketchFromPath(document.location.search.substring(1));
                    }
            );


            /*
             document.addEventListener("abzResetModified", function(event) {
             Abbozza.modified = false;
             console.log("modified reset");
             });
             */

            // Load Configuration
            Configuration.load();

            // Initialize board
            Board.init(this.systemPrefix);

            // Initialize the TaskWindow
            TaskWindow.init();

            // Register change listeners
            Blockly.bindEvent_(document, 'blocklySelectChange', null, Abbozza.changeSelection);
            Blockly.mainWorkspace.addChangeListener(Abbozza.onChange);

            window.Blockly = Blockly;

            Abbozza.initButtons();

            // Build the Tools menu
            Abbozza.buildToolsMenu();

            // Check request for query
            if (document.location.search != "") {
                // If a query is given, load the sketch
                Abbozza.setSketchFromPath(document.location.search.substring(1));
            } else {
                // Check if start sketch is given by config
                var startSketch = Configuration.getParameter("startSketch");
                if (startSketch != null) {
                    Abbozza.setSketchFromPath(startSketch);
                } else {
                    var askForTutorial = Configuration.getParameter("askForTutorial");
                    if ((askForTutorial != null) && (askForTutorial.toUpperCase() == "TRUE")) {
                        var overlayDialog =
                                "<table  style='margin: auto;'>" +
                                "<tr><td colspan='2'>" + _("MSG.START_TUTORIAL") + "</td></tr>" +
                                "<tr><td>&nbsp;</td></tr>" +
                                "<tr><td style='width:50%'>" +
                                "<input style='width:100%' type='button' value='" + _("MSG.YES") + "' onclick='Abbozza.closeOverlayDialog(\"YES\")'></input>" +
                                "</td><td style='width:50%'>" +
                                "<input style='width:100%' type='button' value='" + _("MSG.NO") + "' onclick='Abbozza.closeOverlayDialog(\"NO\")'></input>" +
                                "</td></tr>" +
                                "<tr><td>&nbsp;</td></tr>" +
                                "<tr><td colspan='2'><input name='askForTutorial' value='askForTutorial' type='checkbox'>" + _("MSG.DONT_ASK_AGAIN") + "</input></td></tr>" +
                                "</table>";
                        Abbozza.openOverlayDialog(overlayDialog, function (answer, div) {
                            var dontAskForTutorial = div.children[0].children[0].children[0].children[4].children[0].children[0].checked;
                            if (dontAskForTutorial) {
                                Configuration.set("askForTutorial", "false");
                            } else {
                                Configuration.set("askForTutorial", "true");
                            }
                            if (answer == "YES") {
                                this.setSketchFromPath("!sketches/tutorial/" + Configuration.locale + "/start.abz");
                            } else {
                                this.clearSketch();
                            }
                        });
                    } else {
                        // Inject starting Blocks if no query was given.
                        this.clearSketch();
                    }
                }
            }

            // Initalize generator
            // This operation reads the code template
            this.Generator.init();

            /**
             * Before the page is unloaded, store the changes in the browser storage.
             */
            window.onbeforeunload = Abbozza.onUnload;
            /*
             document.addEventListener("beforeunload",  function(event) {
             Abbozza.storeSketch(document.location.search.substring(1));
             alert("beforeunload");
             });
             */

        };


/**
 * The button handlers
 * 
 * The following methods handle the various buttons in the GUI.
 */

Abbozza.initButtons = function() {
            // Set the buttons toolstips
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
};            

/**
 * Board-Button: Check the connected board
 * 
 * @returns {undefined}
 */
Abbozza.selectBoard = function () {
    Board.load(true);
};

/**
 * Show the configuration dialog.
 * 
 * @returns {undefined}
 */
Abbozza.showConfiguration = function () {
    Abbozza.storeSketch("abbozza_temp_sketch");
    Abbozza.openOverlay(_("msg.open_config"));
    Connection.getText("/abbozza/frame", function (text) {
        Abbozza.closeOverlay();
        Configuration.apply(text);
        // Trigger a reload
        window.sessionStorage.setItem("abbozza.overrideOptions", "true");
        document.location.reload();
    }, function (text) {
        Abbozza.clearStoredSketch("abbozza_temp_sketch");
        Abbozza.closeOverlay();
    });
};


/**
 * Load-Button
 * 
 * Load a sketch from the server.
 * Sets the URL of the loaded sketch as query.
 * 
 * The stored sketch for the given path is not retreived.
 * 
 * @returns {undefined}
 */
Abbozza.loadSketch = function () {
    // Check if sketch was modified, ask if it should be saved
    if (this.modified && !this.askForSave()) {
        return;
    }

    // Store current sketch
    if ((document.location.search != null) && (document.location.search != "")) {
        Abbozza.storeSketch(document.location.search.substring(1));
    }

    var xml = document.createElement("abbozza");
    Abbozza.openOverlay(_("msg.load_sketch"));
    var sketch = Connection.getXML("/abbozza/load",
            function (sketch, xhttp) {
                Abbozza.closeOverlay();
                // Abbozza.storeSketch("abbozza_temp_sketch");
                Abbozza.clearSketch();
                Abbozza.setSketch(sketch);
                var location = xhttp.getResponseHeader("Content-Location");
                Abbozza.setContentLocation(location);
                // history.pushState(null,null,"/" + Abbozza.systemPrefix + ".html?" + location);
            },
            function (response) {
                Abbozza.closeOverlay();
            }
    );
};

/**
 * Save the current workspace.
 * 
 * @returns {undefined}
 */
Abbozza.saveSketch = function () {
    // First fetch the modified con tent of TaskWindow
    if (TaskWindow.editing_) {
        TaskWindow.setPage_(TaskWindow.currentPage_, true);
    }
    var xml = Abbozza.workspaceToDom(Blockly.mainWorkspace);

    var desc = document.createElement("description");
    desc.textContent = Abbozza.sketchDescription;
    xml.appendChild(desc);

    var opts = document.createElement("options");
    xml.appendChild(opts);
    opts.setAttribute("apply", Abbozza.sketchApplyOptions ? "yes" : "no");
    opts.setAttribute("protected", Abbozza.sketchProtected ? "yes" : "no");

    var task = TaskWindow.getHTML();
    xml.appendChild(task);

    var tasks = xml.getElementsByTagName("task");
    if (tasks[0]) {
        tasks[0].removeAttribute("curpage");
    }

    if ( Abbozza.worldToDom ) {
        var dom = Abbozza.worldToDom();
        if ( dom ) xml.appendChild(dom);
    }
    
    opts.textContent = Configuration.getOptionString();

    var path = document.location.search.substring(1);
    var request = "/abbozza/save";

    if ((path != null) && (path != "")) {
        request = request + "?" + path;
    }

    // Store the current sketch in session memory
    Abbozza.storeSketch(path);

    Abbozza.openOverlay(_("msg.save_sketch"));
    Connection.sendXML(request, Blockly.Xml.domToText(xml),
            function (response, xhttp) {
                Abbozza.closeOverlay();
                Abbozza.resetModified();
                // set location
                // Put saved url into history
                var location = xhttp.getResponseHeader("Content-Location");
                Abbozza.setContentLocation(location);
                // history.pushState(null,null,"/" + Abbozza.systemPrefix + ".html?" + location);                
            },
            function (response, xhttp) {
                Abbozza.closeOverlay();
            }
    );
};

/**
 * New-Button
 * 
 * @returns {undefined}
 */
Abbozza.newSketch = function () {
    // Check if sketch was modified, ask if it should be saved
    if (this.modified && !this.askForSave()) {
        return;
    }

    // Store current sketch
    Abbozza.storeSketch(document.location.search.substring(1));

    Abbozza.clearSketch();
    Abbozza.setContentLocation("");
    // history.pushState(null,null,"/" + Abbozza.systemPrefix + ".html");
};


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
};

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
};

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
};

/**
 * Ask if the sketch should be saved.
 * 
 * @returns {Abbozza.askForSave.result}
 */
Abbozza.askForSave = function () {
    /* var overlayDialog =
     "<table  style='margin: auto;'>" +
     "<tr><td colspan='2'>" + _("msg.drop_sketch") + "</td></tr>" +
     "<tr><td>&nbsp;</td></tr>" +
     "<tr><td style='width:50%'>" +
     "<input style='width:100%' type='button' value='" + _("MSG.YES") + "' onclick='Abbozza.closeOverlayDialog(\"YES\")'></input>" +
     "</td><td style='width:50%'>" +
     "<input style='width:100%' type='button' value='" + _("MSG.NO") + "' onclick='Abbozza.closeOverlayDialog(\"NO\")'></input>" +
     "</table>";
     Abbozza.openOverlayDialog(overlayDialog, function(answer,div) {
     if ( answer == "YES" ) {
     this.setSketchFromPath("!sketches/tutorial/" + Configuration.locale + "/tutorial.abz");
     } else {
     this.clearSketch();
     }
     });
     */

    var result = confirm(_("msg.drop_sketch"));
    return result;
};

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
};

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
        if (this.blockDevices != null)
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
};

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
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var element = Blockly.Xml.blockToDom(block);
        var xy = block.getRelativeToSurfaceXY();
        element.setAttribute('x', Blockly.RTL ? width - xy.x : xy.x);
        element.setAttribute('y', xy.y);
        xml.appendChild(element);
    }
    return xml;
};

/**
 * Show an info message.
 * 
 * @param {type} text
 * @returns {undefined}
 */
Abbozza.showInfoMessage = function (text) {
    this.showInfoMessage(text, true);
};

/**
 * Show an info message.
 * 
 * @param {type} text The displayed text.
 * @param {type} open A flag indicating, wether the info message really should 
 *                    be shown.
 * @returns {undefined}
 */
Abbozza.showInfoMessage = function (text, open) {
    if ((this.infoWin == null) && (open == true)) {
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
};

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
    };
};

/**
 * Open the task window.
 * 
 * @returns {undefined}
 */
Abbozza.openTaskWindow = function () {
    TaskWindow.show();
};

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
};


/**
 * Appends a text to the overlay message.
 * 
 * @param {type} text The text to be appended.
 * @returns {undefined}
 */
Abbozza.appendOverlayText = function (text) {
    overlay_content.innerHTML = overlay_content.innerHTML + "<br/><span>" + text + "</span>";
};

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
};

/**
 * Wait for thhe overlay to be closed by the user.
 * @returns {undefined}
 */
Abbozza.overlayWaitForClose = function () {
    this.overlay_closeable = true;
    Abbozza.appendOverlayText("");
    Abbozza.appendOverlayText(_("msg.click_to_continue"));
    overlay_content.style.backgroundColor = "#ffd0d0";
};

/**
 * A handler called if the overlay is clicked.
 * @param {type} overlay
 * @param {type} event
 * @returns {undefined}
 */
Abbozza.overlayClicked = function (overlay, event) {
    if (this.overlay_closeable)
        Abbozza.closeOverlay();
};


/**
 * A handler called if a key is pressed while the overlay is shown.
 * @returns {undefined}
 */
Abbozza.overlayKeyPressed = function () {};


/**
 * Opens the overlay for dialog
 * 
 * @param {type} text The text to be displayed
 * @returns {undefined}
 */
Abbozza.openOverlayDialog = function (view, callback) {
    overlay = document.getElementById("overlay");
    overlay_content = document.getElementById("overlay_content");
    overlay.style.display = "block";
    overlay.style.zIndex = 42;
    if ( (typeof view ) == "string" ) {
        overlay_content.innerHTML = "<div>" + view + "</div>";
    } else {
        overlay_content.appendChild(view);
    }
    overlay.callback = callback;
    this.overlay_closeable = false;
};


/**
 * Close the overlay dialog.
 * 
 * @returns {undefined}
 */
Abbozza.closeOverlayDialog = function (answer) {
    overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    overlay.style.zIndex = -1;
    this.overlay_closeable = false;
    overlay_content.style.backgroundColor = "#f0f0f0";
    if (overlay.callback != null) {
        overlay.callback.call(Abbozza, answer, overlay_content);
    }
};


/**
 * MISC
 */


/**
 * Reset the modified flags.
 * 
 * @returns {undefined}
 */
Abbozza.resetModified = function () {
    Abbozza.modified = false;
};

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
        Abbozza.modified = true;
    }

    if (event.type == "move") {
        var block = Blockly.mainWorkspace.getBlockById(event.blockId);
        if ((block) && (typeof (block.confirmed) != "undefined") && (block.confirmed == false)) {
            if (block.getParent() == null) {
                block.dispose(true);
                Abbozza.modified = true;
            }
        }
    }

    if ((event.type == "create") || (event.type == "delete")) {
        Abbozza.modified = true;
    }

    if (Abbozza.modified) {
        Abbozza.storeSketch(document.location.search.substring(1));
    }
};


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
};

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
};

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
};



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
};


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
};


/**
 * Add a plugin tool to the menu.
 * 
 * @param {type} plugin The id of the plugin.
 * @param {type} title The title of the tool.
 * @param {type} img The icon used in the menu
 * @param {function} callback The callback function, if the menu item is clicked.
 * @param {string} query The query added to the request
 * 
 * @returns {undefined} Nothing
 */
Abbozza.addPluginTool = function (plugin, title, img, callback, query = "") {
    var tools = document.querySelector("[id='tools']");
    var button = document.createElement("div");
    button.setAttribute("title", _(title));
    button.className = "toolButton";
    button.onclick = function () {
        Abbozza.callPluginTool(plugin, query, callback);
    };
    button.setAttribute("plugin", plugin);
    var image = document.createElement("img");
    image.src = img;
    button.appendChild(image);
    tools.appendChild(button);
};

/**
 * Calls the tool registered for the given plugin.
 * 
 * @param {String} plugin The id of the plugin.
 * @param {String} query The query to the plugin tool.
 * @param {function} callback The callback function executed, if the plugin is activated
 * @returns {undefined}
 */
Abbozza.callPluginTool = function (plugin, query, callback) {
    var path = "/abbozza/plugin/" + plugin;
    if (query != "") {
        path = path + "?" + query;
    }
    var status = 999;
    var response = "";

    var xhttp;

    if (window.XMLHttpRequest)
        xhttp = new XMLHttpRequest();
    else // code for IE5 and IE6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onload = function () {
        status = xhttp.status;
        if (xhttp.responseXML) {
            response = xhttp.responseXML;
        } else {
            response = xhttp.responseText;
        }
    };

    xhttp.open("GET", path, false);
    xhttp.setRequestHeader("Cache-Control", "no-cache");
    xhttp.setRequestHeader("Cache-Control", "no-store");
    xhttp.setRequestHeader("Cache-Control", "must-revalidate");
    xhttp.setRequestHeader("Cache-Control", "max-age=0");
    xhttp.send();

    if (response >= 500) {
        // 503 - unknown plugin
        Abbozza.openOverlay(__("gui.plugin_deactivated", 0) + plugin + __("gui.plugin_deactivated", 1));
        Abbozza.overlayWaitForClose();
    } else if (response >= 400) {
        // 403 - deactivated plugin
        Abbozza.openOverlay(__("gui.plugin_deactivated", 0) + plugin + __("gui.plugin_deactivated", 1));
        Abbozza.overlayWaitForClose();
    } else {
        callback.call(this, status, response);
    }
};

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
};


/**
 ** Info Menu (tasks and documentation)
 **/

/**
 * Add an entry to the Info menu.
 * 
 * @param {type} id The id of the entry.
 * @param {type} title The title of the entry.
 * @param {type} img The icon used in the menu
 * @param {function} callback The callback function, if the menu item is clicked.
 * 
 * @returns {undefined} Nothing
 */
Abbozza.addInfoMenuEntry = function (id, title, img, callback) {
    var info = document.querySelector("[id='info']");
    var button = document.createElement("div");
    button.setAttribute("title", _(title));
    button.className = "toolButton";
    button.onclick = function () {
        callback.call(Abbozza);
    };
    button.setAttribute("id", id);
    var image = document.createElement("img");
    image.src = img;
    button.appendChild(image);
    info.appendChild(button);
};

/**
 * BLOCKLY HACKS
 */


/**
 * Blockly hack to change the context menu
 * @param {type} menuOptions
 * @returns {undefined}
 */
Blockly.BlockSvg.prototype.customContextMenu = function(menuOptions) {
    var block = this;
    if (this.isDeletable()) {
        var protectOption = {
            text: _("gui.protect_block"),
            enabled: true,
            callback: function () {
                block.setDeletable(false);
            }
        };
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
        };
        menuOptions.push(copyOption);
        var unprotectOption = {
            text: _("gui.unprotect_block"),
            enabled: true,
            callback: function () {
                block.setDeletable(true);
            }
        };
        menuOptions.push(unprotectOption);
    }
    var idOption = {
        text: _("gui.block_id") + (Abbozza.getBlockId(this) != "" ? " (" + Abbozza.getBlockId(this) + ")" : ""),
        enabled: true,
        callback: function () {
            Abbozza.setBlockId(block);
        }
    };
    menuOptions.push(idOption);
    
    if ( block.addSystemContextMenuItems ) {
        block.addSystemContextMenuItems(menuOptions);
    }
};




/**
 * Methods for setting sketches.
 */

/**
 * Set the sketch for a given path. 
 * First it is checked, if a sketch for the path was stored in the browser
 * memory. If not, it is queried. If it starts with "!", it is directly loaded
 * from abbozzas filesystem. Otherwise the load handler of the serveris used.
 * 
 * @param {String} path The path of the sketch to be restored.
 * @returns {undefined}
 */
Abbozza.setSketchFromPath = function (path) {
    // Check if a sketch was stored in browser memory with the path as key.
    // console.log("set sketch from path " + path);
    var originalPath = path;
    path = Abbozza.constructLocation(path);

    var xmlSketch = Abbozza.retreiveSketch(path);
    if (xmlSketch != null) {
        Abbozza.setSketch(xmlSketch);
        Abbozza.setContentLocation(path);
        return;
    }

    // If no sketch was stored for session, load it
    var sketchPath = "/abbozza/load?" + path;

    Connection.getXML(sketchPath,
            function (response, xhttp) {
                // Check if a sketch is in the session storage
                Abbozza.setSketch(response, parseInt(document.location.hash.substr(1)));
                var location = xhttp.getResponseHeader("Content-Location");
                Abbozza.setContentLocation(location);
            },
            function (response) {
                var args = [];
                if ( path.startsWith("jar:") && !originalPath.startsWith("/") ) {
                    Abbozza.setSketchFromPath("/" + originalPath);                    
                } else {
                    args.push(sketchPath);
                    Abbozza.openOverlay(_("msg.invalid_sketch", args));
                    Abbozza.overlayWaitForClose();
                    Abbozza.clearSketch();
                }
            }
    );
};


/**
 * This operation builds a new empty sketch or retreives the stored temporary
 * sketch.
 * 
 * @returns {undefined}
 */
Abbozza.clearSketch = function () {
    // if (this.modified && !this.askForSave()) {
    //   return;
    // }

    Blockly.Events.disable();

    TaskWindow.resetContent();
    TaskWindow.setSize(600, 400);

    Abbozza.sketchDescription = "";
    Abbozza.sketchApplyOptions = false;
    Abbozza.sketchProtected = false;

    this.clear();

    // Check if temporary sketch was stored
    var xmlSketch = Abbozza.retreiveSketch("abbozza_temp_sketch");
    Abbozza.clearStoredSketch("abbozza_temp_sketch");
    if (xmlSketch != null) {
        this.setSketch(xmlSketch);
        Abbozza.resetModified();
        Blockly.Events.enable();
        return;
    } else {
        if ((Configuration.getParameter("option.devices") == "true") && this.devicesAllowed) {
            Blockly.Xml.domToWorkspace(document.getElementById('startBlocks'), Blockly.mainWorkspace);
        } else {
            Blockly.Xml.domToWorkspace(document.getElementById('startBlocksWoDevices'), Blockly.mainWorkspace);
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
        this.blockMain.moveBy(100, 20);
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

    this.blockLogo = null;
    this.blockConf = null;

    Abbozza.resetModified();

    Blockly.Events.enable();

};



/**
 * Set the workspace to the given sketch.
 * 
 * @param {type} sketch The dom containing the blocks
 * @param {type} page The page to be displayed in the task window
 * @returns {undefined}
 */
Abbozza.setSketch = function (sketch, page = - 1) {
    TaskWindow.hide();

    Blockly.Events.disable();

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

        var overrideOptions = (window.sessionStorage.getItem("abbozza.overrideOptions") == "true");
        if (Abbozza.sketchApplyOptions && !overrideOptions) {
            var options = opts[0].textContent;
            Configuration.apply(options);
        }
        window.sessionStorage.setItem("abbozza.overrideOptions", "false");
    } else {
        Abbozza.sketchApplyOptions = false;
        Abbozza.sketchProtected = false;
    }

    var task = sketch.getElementsByTagName("task");
    var taskWidth;
    var taskHeight;
    if (task[0]) {
        var curpage = -1;
        if (task[0].hasAttribute("curpage")) {
            curpage = parseInt(task[0].getAttribute("curpage"));
        }
        if ((page < 0) && (curpage >= 0)) {
            page = curpage + 1;
        }
        TaskWindow.setContent(task[0].textContent, true);
        taskWidth = task[0].getAttribute("width");
        taskHeight = task[0].getAttribute("height");
        TaskWindow.mainSketch = task[0].getAttribute("main");
        TaskWindow.prevSketch = task[0].getAttribute("prev");
        TaskWindow.nextSketch = task[0].getAttribute("next");
    } else {
        TaskWindow.resetContent();
        taskWidth = 600;
        taskHeight = 400;
    }
    TaskWindow.setSize(taskWidth, taskHeight);

    Abbozza.setBlocks(sketch.firstChild);

    if ( Abbozza.worldFromDom ) {
        var worlds = sketch.getElementsByTagName("world");
        for ( var idx =0; idx < worlds.length; idx++ ) {
            Abbozza.worldFromDom(worlds[idx]);
        }        
    }
    

    if (Abbozza.sketchProtected) {
        var blocks = Blockly.mainWorkspace.getAllBlocks();
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].setDeletable(false);
        }
    }

    // Check if TaskWindow contains something
    if (!TaskWindow.isCurrentPageEmpty()) {
        TaskWindow.show();
        if (page > 0)
            TaskWindow.setPage_(page - 1);
    }

    Abbozza.resetModified();
    Blockly.Events.enable();

};


/**
 * These methods allow to store and retreive sketechs form browser storage.
 */

/**
 * Store the current sketch temporarily in the browser stroage.
 * It is stored with the key "abbozza_temp_sketch".
 * 
 * @returns {undefined}
 */
//Abbozza.storeTempSketch = function () {
//    // Get current sketch
//    var xml = Abbozza.workspaceToDom(Blockly.mainWorkspace);
//
//    var desc = document.createElement("description");
//    desc.textContent = Abbozza.sketchDescription;
//    xml.appendChild(desc);
//
//    var task = document.createElement("task");
//    task.textContent = TaskWindow.getContent(); // Abbozza.taskContent;
//    task.setAttribute("width", TaskWindow.getWidth());
//    task.setAttribute("height", TaskWindow.getHeight());
//    xml.appendChild(task);
//
//    sessionStorage.setItem("abbozza_temp_sketch", Blockly.Xml.domToText(xml));
//};


/**
 * Delete the temporary sketch.
 * 
 * @returns {undefined}
 */
// Abbozza.clearTempSketch = function () {
//     sessionStorage.removeItem("abbozza_temp_sketch");
// }




/**
 * Stores the current sketch in the session storage.
 * 
 * @param {String} key The key under which the sketch should be stored.
 * @returns {undefined}
 */
Abbozza.storeSketch = function (key) {
    // Remove sequences of /
    while (key.indexOf("//") >= 0) {
        key = key.replace("//", "/");
    }

    // Get the current sketch
    var xml = Abbozza.workspaceToDom(Blockly.mainWorkspace);

    var desc = document.createElement("description");
    desc.textContent = Abbozza.sketchDescription;
    xml.appendChild(desc);

    var task = TaskWindow.getHTML();

    xml.appendChild(task);

    var tasks = xml.getElementsByTagName("task");
    if (tasks[0]) {
        tasks[0].setAttribute("curpage", TaskWindow.currentPage_);
    }

    sessionStorage.setItem(key, Blockly.Xml.domToText(xml));
    // console.log("stored sketch : " + key);
};

/**
 * Rerieve a sketch from the session storage.
 * 
 * @param {String} key The key under which the sketch should be stored.
 * 
 * @returns {undefined}
 */
Abbozza.retreiveSketch = function (key) {
    // Remove sequences of /
    while (key.indexOf("//") >= 0) {
        key = key.replace("//", "/");
    }

    var item = sessionStorage.getItem(key);
    var sketch = null;
    if (item != null) {
        console.log("retreive sketch : " + key);
        var parser = new DOMParser();
        sketch = parser.parseFromString(item, "text/xml");
    }
    return sketch;
};


/**
 * Delete the temporary sketch.
 * 
 * @param {String} key The key of the sketch to be cleared
 * 
 * @returns {undefined}
 */
Abbozza.clearStoredSketch = function (key) {
    // Remove sequences of /
    while (key.indexOf("//") >= 0) {
        key = key.replace("//", "/");
    }

    sessionStorage.removeItem(key);
};






/**
 * DEPRECATED STUFF
 */

/**
 * 
 * @param {type} text
 * @returns {undefined}
 */
Abbozza.showDeprecatedMsg = function (text) {
    var err = new Error(text + " deprecated");
    console.log(err.stack);
};


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
};

/**
 * @deprecated ErrorMgr is responsible for errors.
 *
 * @param {type} block
 * @param {type} text
 * @returns {undefined}  */
Abbozza.addError = function (block, text) {
    e = new Error("Abbozza.addError deprecated");
    console.log(e.stack);
    ErrorMgr.addError(block, text);
};

/**
 * @deprecated ErrorMgr is responsible for errors.
 *
 * @returns {Boolean}
 */
Abbozza.hasError = function () {
    e = new Error("Abbozza.hasError deprecated");
    console.log(e.stack);
    return ErrorMgr.hasErrors();
};

/**
 * @deprecated ErrorMgr is responsible for errors.
 *
 * @param {type} block
 * @returns {undefined}
 */
Abbozza.delError = function (block) {
    e = new Error("Abbozza.delError deprecated");
    console.log(e.stack);
    return ErrorMgr.clearBlock(block);
};

/**
 * @deprecated ErrorMgr is responsible for errors.
 * 
 * @param {type} block
 * @param {type} text
 * @returns {undefined}
 */
Abbozza.showError = function (block, text) {
    e = new Error("Abbozza.showError deprecated");
    console.log(e.stack);
};


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
};

/**
 * DEPRECATED
 * Info-Button: Show the info page.
 * 
 * @returns {undefined}
 */
Abbozza.showInfo = function () {
    Connection.getText("/abbozza/info");
};


Abbozza.onUnload = function (event) {
    if (!Abbozza.reloadForced) {
        Abbozza.storeSketch(document.location.search.substring(1));
    } else {
        Abbozza.clearStoredSketch(document.location.search.substring(1));
    }
    return null;
}


Abbozza.getContentBase = function() {
    return "/";
}

Abbozza.setContentLocation = function (location) {
    var abjPath = "";
    var taskPath = "";

    var loc;
    if ((location == null) || (location == "")) {
        loc = Abbozza.getContentBase() + Abbozza.systemPrefix + ".html";
        history.pushState(null, null, loc);
        // console.log("content-location : " + location);
        abjPath = "";
        taskPath = "";
        // console.log("abjPath : " + abjPath);
        // console.log("taskPath : " + taskPath);    
        return;
    }

    loc = Abbozza.getContentBase() + Abbozza.systemPrefix + ".html?" + location;

    history.pushState(null, null, loc);
    // console.log("content-location : " + location);

    // Split into abjPath and taskPath
    if (location.startsWith("jar:")) {
        abjPath = location.slice(4, location.lastIndexOf("!"));
        taskPath = location.slice(location.lastIndexOf("!") + 1);
    } else {
        taskPath = location;
        abjPath = "";
    }
    window.sessionStorage.setItem("abzAbjPath", abjPath);
    window.sessionStorage.setItem("abzTaskPath", taskPath);
    // console.log("abjPath : " + abjPath);
    // console.log("taskPath : " + taskPath);    
}



Abbozza.getAbjPath = function () {
    return window.sessionStorage.getItem("abzAbjPath");
}


Abbozza.getTaskPath = function () {
    return window.sessionStorage.getItem("abzTaskPath");
}

/**
 * This operation constructs the complete path from teh given path fragment,
 * the current abjPath and the current taskPath.
 * 
 * @param {type} path
 * @returns {String}
 */
Abbozza.constructLocation = function (path) {
    var location = "";
    var abzPath = window.sessionStorage.getItem("abzAbjPath");
    var taskPath = window.sessionStorage.getItem("abzTaskPath");

    // If the path fragment is absolute and refers to a file aor a jar archive, 
    // simply return it.
    if (path.startsWith("file:") || path.startsWith("jar:")) {
        return path;
    }

    // If the path framgent starts with "abj:" it opens a new abj
    if (path.startsWith("abj:")) {
        // The abj path has the following form:
        // abj:<abj-path>!<task-path>
        // <abj-path> is the path to the new abj, relative to abjPath
        // <task-Path> is the path inside the new abj
        var newAbj = path.slice(4, path.indexOf("!"));
        var intPath = path.slice(path.indexOf("!") + 1);
        var abjUrl = null;
        if (abzPath != "") {
            abjUrl = new URL(newAbj, abzPath);
        } else {
            abjUrl = new URL(newAbj, taskPath);
        }
        return "jar:" + abjUrl.toString() + "!" + intPath;
    }


    if (abzPath == "") {
        var url = new URL(path, taskPath);
        location = url.toString();
        return location;
    } else {
        if (path.startsWith("/")) {
            location = path;
        } else {
            location = taskPath.slice(0, taskPath.lastIndexOf("/")) + "/" + path;
        }
        return "jar:" + abzPath + "!" + location;
    }
}