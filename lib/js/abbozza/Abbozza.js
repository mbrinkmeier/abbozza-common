/**
 * @license 
 * abbozza!
 * 
 * File: Abbozza.js
 * 
 * The core object of the abbozza! client
 * 
 * Copyright 2015 Michael Brinkmeier
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
    systemPrefix : "arduino",
    pathPrefix : "",
    missingBlocks : [],
    devicesAllowed : false,
    
    sketchDescription: "",
    sketchApplyOptions: false,
    sketchProtected: false,
    
    // VAR_SYMBOL: 0,
    // PAR_SYMBOL: 1,
    // FUN_SYMBOL: 2,

    infoWin: null,
    board: Board,
    serialRate: 115200
};

// Original mutator icon
// Blockly.Mutator.prototype.png_ = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAANyAAADcgBffIlqAAAAAd0SU1FB98DGhULOIajyb8AAAHMSURBVDjLnZS9SiRBFIXP/CQ9iIHgPoGBTo8vIAaivoKaKJr6DLuxYqKYKIqRgSCMrblmIxqsICgOmAriziIiRXWjYPdnUDvT2+PMsOyBoop7qk71vedWS5KAkrWsGUMjSYjpgSQhNoZGFLEKeGoKGMNttUpULkOhAFL3USiA70MQEBnDDeDJWtaqVaJeB7uNICAKQ1ZkDI1yufOm+XnY2YHl5c6874MxPClJiDulkMvBxYWrw/095POdU0sS4hxALqcWtreloSGpVJLGxtL49bX0+Ci9vUkzM2kcXGFbypUKxHHLBXZ3YW4ONjfh4yN1aGIiPQOQEenrg6MjR+zvZz99Y8PFT09hYCArktdfsFY6PHTr83NlUKu5+eREennJchmR/n5pYcGtJyezG6em3Dw7Kw0OZrlMOr6f1gTg4ACWlmBvz9WoifHxbDpf3Flfd+54njQ9ncYvL6WHB+n9XVpcbHOnW59IUKu5m+p11zftfLHo+qRorZ6Hh/Xt7k5fsLUl1evS1dWfG9swMiJZq9+KIlaD4P/eztkZNgz5LsAzhpvjY6JK5d9e8eioE3h95SdQbDrkhSErxvArjkl6/U/imMQYnsKQH02BT7vbZZfVOiWhAAAAAElFTkSuQmCC';

// Adapted mutator icon
Blockly.Mutator.prototype.png_ = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAANyAAADcgBffIlqAAAAAd0SU1FB98DGhULOIajyb8AAAHMSURBVDjLnZS9SiRBFIXP/CQ9iIHgPoGBTo8vIAaivoKaKJr6DLuxYqKYKIqRgSCMrblmIxqsICgOmAriziIiRXWjYPdnUDvT2+PMsOyBoop7qk71vedWS5KAkrWsGUMjSYjpgSQhNoZGFLEKeGoKGMNttUpULkOhAFL3USiA70MQEBnDDeDJWtaqVaJeB7uNICAKQ1ZkDI1yufOm+XnY2YHl5c6874MxPClJiDulkMvBxYWrw/095POdU0sS4hxALqcWtreloSGpVJLGxtL49bX0+Ci9vUkzM2kcXGFbypUKxHHLBXZ3YW4ONjfh4yN1aGIiPQOQEenrg6MjR+zvZz99Y8PFT09hYCArktdfsFY6PHTr83NlUKu5+eREennJchmR/n5pYcGtJyezG6em3Dw7Kw0OZrlMOr6f1gTg4ACWlmBvz9WoifHxbDpf3Flfd+54njQ9ncYvL6WHB+n9XVpcbHOnW59IUKu5m+p11zftfLHo+qRorZ6Hh/Xt7k5fsLUl1evS1dWfG9swMiJZq9+KIlaD4P/eztkZNgz5LsAzhpvjY6JK5d9e8eioE3h95SdQbDrkhSErxvArjkl6/U/imMQYnsKQH02BT7vbZZfVOiWhAAAAAElFTkSuQmCC';


/**
 * Initialization of Abbozza
 */
Abbozza.init = function (systemPrefix) {
    
    this.systemPrefix = systemPrefix;
    if ( this.systemPrefix == "arduino") {
        this.pathPrefix = "arduino/";
        this.devicesAllowed = true;
    } else {
        this.pathPrefix = this.systemPrefix+"/";        
    }

    window.name = "abbozzaWorkspace";

    // Check APIs
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    /**
     * Disable context menu of browser
     */
    document.oncontextmenu = function(event) { return false; }
    
    /**
     * Adding String.prototype.startsWith for JavaFX WebEngine
     */
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
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
                    Abbozza.setSketch(response,window.location.hash.substr(1));
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


};

/**
 * The main operations
 */

Abbozza.clearTempSketch = function() {
    localStorage.removeItem("abbozza_temp_sketch");
}

Abbozza.storeTempSketch = function() {
    // Get current sketch
    var xml = Abbozza.workspaceToDom(Blockly.mainWorkspace);
    // document.forms["reload_form"].sketch_input.value = Blockly.Xml.domToText(xml);
    
    var desc = document.createElement("description");
    desc.textContent = Abbozza.sketchDescription;
    xml.appendChild(desc);

    // var opts = document.createElement("options");
    // xml.appendChild(opts);
    // opts.setAttribute("apply", Abbozza.sketchApplyOptions ? "yes" : "no");
    // opts.setAttribute("protected", Abbozza.sketchProtected ? "yes" : "no");
    // opts.textContent = Configuration.getOptionString();
    
    var task = document.createElement("task");
    task.textContent = TaskWindow.getContent(); // Abbozza.taskContent;
    task.setAttribute("width",TaskWindow.getWidth());
    task.setAttribute("height",TaskWindow.getHeight());
    xml.appendChild(task);


    localStorage.setItem("abbozza_temp_sketch",Blockly.Xml.domToText(xml));
    
    // Connection.sendXML("/", Blockly.Xml.domToText(xml),
    //         function (response) {
    //         },
    //         function (response) {}
    // );    
}


/**
 * This operation builds a new sketch.
 */
Abbozza.newSketch = function () {
    if (this.modified && !this.askForSave())
        return;

    TaskWindow.setContent("",true);
    TaskWindow.setSize(600,400);
    // Abbozza.taskContent = "";
    Abbozza.sketchDescription = "";
    Abbozza.sketchApplyOptions = false;
    Abbozza.sketchProtected =false;

    this.clear();
    // Blockly.Block.obtain(Blockly.mainWorkspace,'base_setup');
    
    var sketch = localStorage.getItem("abbozza_temp_sketch");
    Abbozza.clearTempSketch();
    if ( sketch != null  ) {
        // var xmlSketch = Blockly.Xml.textToDom(sketch);
        var parser = new DOMParser();
        var xmlSketch = parser.parseFromString(sketch,"text/xml");
        this.setSketch(xmlSketch);
        this.clearTempSketch();
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

    if ( this.blockMain == null ) {
        this.blockMain = Blockly.mainWorkspace.newBlock("main");
        this.blockMain.setPreviousStatement(false);
        this.blockMain.setSymbolDB(this.globalSymbols);
        this.blockMain.initSvg();
        this.blockMain.moveBy(20,20);
   }
    
    if ( this.devicesAllowed && (this.blockDevices == null) && (Configuration.getParameter("option.devices") == "true")) {
        this.blockDevices = Blockly.mainWorkspace.newBlock("devices");
        this.blockDevices.initSvg();
        this.blockDevices.moveBy(500,20);
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

    var ww = Blockly.mainWorkspace.getWidth();

    this.blockLogo = null;
    this.blockConf = null;

    this.modified = false;
}



Abbozza.setSketch = function (sketch, page) {
    TaskWindow.hide();
    this.modified = false;
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
        TaskWindow.setContent(task[0].textContent,true);
        TaskWindow.setSize(task[0].getAttribute("width"),task[0].getAttribute("height"));
        // Abbozza.taskContent = task[0].textContent;
    } else {
        TaskWindow.setContent("",true);
        TaskWindow.setSize(600,400);
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
    if (TaskWindow.getContent() != "") {
        TaskWindow.show();
        if ( page ) TaskWindow.setPage_(parseInt(page)-1);
    }
}

Abbozza.showInfo = function () {
    Connection.getText("/abbozza/info");
}

Abbozza.selectBoard = function () {
    Board.load(true);
}

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

Abbozza.loadSketch = function () {
    if (this.modified && !this.askForSave())
        return;

    var xml = document.createElement("abbozza");
    var sketch = Connection.getXML("/abbozza/load",
            function (sketch) {
                Abbozza.newSketch();
                Abbozza.setSketch(sketch);
            },
            function (response) {
                // console.log("error: " + response);
            }
    );
}

Abbozza.saveSketch = function () {
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
    task.setAttribute("width",TaskWindow.getWidth());
    task.setAttribute("height",TaskWindow.getHeight());

    xml.appendChild(task);

    opts.textContent = Configuration.getOptionString();

    Connection.sendXML("/abbozza/save", Blockly.Xml.domToText(xml),
            function (response) {
                this.modified = false;
            },
            function (response) {
                // console.log(": " + response);
            }
    );
}

Abbozza.generateSketch = function () {
    Abbozza.openOverlay(_("msg.generate_sketch"));
    var code = this.Generator.workspaceToCode();
    if (!ErrorMgr.hasErrors()) {
        Abbozza.appendOverlayText(_("msg.code_generated"));
        // var content = document.createTextNode(code);
        Abbozza.appendOverlayText(_("msg.compiling"));
        Connection.sendText("/abbozza/check", code,
                function (response) {
                    Abbozza.appendOverlayText(_("msg.done_compiling"));
                    Abbozza.closeOverlay();
                },
                function (response) {
                    Abbozza.appendOverlayText("<br/>" + _("msg.error_compiling") + "<br/>");
                    response = response.replace(/\n/g,"<br/>");
                    Abbozza.appendOverlayText("<pre id='overlay_err'>" + response + "</pre>");
                    Abbozza.overlayWaitForClose();
                }
        );
    } else {
        Abbozza.closeOverlay();
    }
}

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
                                Abbozza.appendOverlayText("<br/>" + _("msg.error_compiling") + "<br/>");
                                Abbozza.appendOverlayText(response);
                                Abbozza.overlayWaitForClose();
                            }
                    );
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
                    response = response.replace(/\n/g,"<br/>");
                    Abbozza.appendOverlayText("<pre id='overlay_err'>" + response + "</pre>");
                    Abbozza.overlayWaitForClose();
                    Connection.getText("/abbozza/monitor_resume");
                });
    } else {
        Abbozza.closeOverlay();
    }
}

Abbozza.serialMonitor = function () {
    console.log("monitor clicked");
    Connection.getText("/abbozza/monitor",
            function (text) {
                console.log("monitor success");
                console.log(text);
            },
            function (text) {
                console.log("monitor failure");
                console.log(text);
                // alert(_("msg.no_board"));
            });
}

/**
 * Misc operations
 */

Abbozza.askForSave = function () {
    var result = confirm(_("msg.drop_sketch"));
    return result;
}

Abbozza.changeSelection = function (event) {
    if (Blockly.selected == null)
        return;
    var block = Blockly.selected.getRootBlock();
    if (block.symbols && Abbozza.varWin) {
        Abbozza.varWin.setText(block.symbols.toString());
    }
};

Abbozza.createEditor_ = function () {
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

Abbozza.clear = function () {
    ErrorMgr.clearErrors();
    TaskWindow.hide();
    
    if (this.varWin) this.varWin.dispose();
    
    Blockly.mainWorkspace.clear();

    // Clear symbols
    var symbols;
    this.globalSymbols = new SymbolDB();
    Blockly.mainWorkspace.symbols = this.globalSymbols;
}

Abbozza.setBlocks = function (xml) {
    this.clear();

    this.missingBlocks = [];
    
    Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);

    if ( this.missingBlocks.length > 0 ) {
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

    if ( this.blockMain == null ) {
        this.blockMain = Blockly.mainWorkspace.newBlock("main");
        this.blockMain.setPreviousStatement(false);
        this.blockMain.setSymbolDB(this.globalSymbols);
        this.blockMain.initSvg();
        this.blockDevices.moveBy(20,20);
    }
    
    if ( this.devicesAllowed && (this.blockDevices == null) && (Configuration.getParameter("option.devices") == "true")) {
        this.blockDevices = Blockly.mainWorkspace.newBlock("devices");        
        this.blockDevices.initSvg();
        this.blockDevices.moveBy(500,20);
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

Abbozza.workspaceToDom = function (workspace) {
    var width; // Not used in LTR.
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

Abbozza.showDeprecatedMsg = function (text) {
    var err = new Error(text + " deprecated");
    console.log(err.stack);
}


Abbozza.hideError = function () {
    e = new Error("Abbozza.hideError deprecated");
    console.log(e.stack);
    if (this.error != null) {
        this.error.setVisible(false);
        this.error.dispose();
    }
}

Abbozza.addError = function (block, text) {
    e = new Error("Abbozza.addError deprecated");
    console.log(e.stack);
    ErrorMgr.addError(block, text);
}

Abbozza.hasError = function () {
    e = new Error("Abbozza.hasError deprecated");
    console.log(e.stack);
    return ErrorMgr.hasErrors();
}

Abbozza.delError = function (block) {
    e = new Error("Abbozza.delError deprecated");
    console.log(e.stack);
    return ErrorMgr.clearBlock(block);
}

Abbozza.showError = function (block, text) {
    e = new Error("Abbozza.showError deprecated");
    console.log(e.stack);
    this.hideError();
    Abbozza.Generator.ERROR = true;
    Abbozza.Generator.ERROR_TEXT = text;
    this.error = new AbbozzaError(block, text);
}


Abbozza.showInfoMessage = function (text) {
    this.showInfoMessage(text, true);
}

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


Abbozza.addDisposeHandler = function (block) {
    if (!block.onDispose)
        return;
    block.oldDispose_ = block.dispose;
    block.dispose = function (healStack, animate, opt_dontRemoveFromWorkspace) {
        block.onDispose();
        block.oldDispose_(healStack, animate, opt_dontRemoveFromWorkspace);
    }
}


Abbozza.openTaskWindow = function() {
    TaskWindow.show();
}


Abbozza.openOverlay = function (text) {
    overlay = document.getElementById("overlay");
    overlay_content = document.getElementById("overlay_content");
    overlay.style.display = "block";
    overlay.style.zIndex = 42;
    overlay_content.innerHTML = "<span>" + text + "</span>";
    this.overlay_closeable = false;
}

Abbozza.appendOverlayText = function (text) {
    overlay_content.innerHTML = overlay_content.innerHTML + "<br/><span>" + text + "</span>";

}

Abbozza.closeOverlay = function () {
    overlay = document.getElementById("overlay");
    overlay.style.display = "none";
    overlay.style.zIndex = -1;
    this.overlay_closeable = false;
    overlay_content.style.backgroundColor = "#f0f0f0";
}

Abbozza.overlayWaitForClose = function () {
    this.overlay_closeable = true;
    Abbozza.appendOverlayText("");
    Abbozza.appendOverlayText(_("msg.click_to_continue"));
    overlay_content.style.backgroundColor = "#ffd0d0";
}

Abbozza.overlayClicked = function (overlay, event) {
    if (this.overlay_closeable)
        Abbozza.closeOverlay();
}

Abbozza.overlayKeyPressed = function () {}



Blockly.BlockSvg.prototype.customContextMenu = function (menuOptions) {
    var block = this;
    if (this.isDeletable() ) {
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
        text: _("gui.block_id") + (Abbozza.getBlockId(this)!="" ? " (" + Abbozza.getBlockId(this) + ")" : ""),
        enabled: true,
        callback: function () {
            Abbozza.setBlockId(block);
        }
    }
    menuOptions.push(idOption);
}

Abbozza.getBlockId = function(block) {
    return block.data;
}

Abbozza.setBlockId = function(block) {
    var id = Abbozza.getBlockId(block);
    id = prompt(_("gui.ask_for_id"),id);
    if ( id != null ) {
        block.data = id;
    }
}

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
 * Plugintools
 */

Abbozza.tools = null;

Abbozza.registerPluginTool = function(plugin,id,img,callback) {
    if ( Abbozza.tools == null ) {
        Abbozza.tools = [];
    }
    Abbozza.tools.push( [plugin,id,img,callback] );
}

Abbozza.buildToolsMenu = function() {
    if (Abbozza.tools == null) return;
    for (var i = 0; i < Abbozza.tools.length ; i++ ) {
        Abbozza.addPluginTool(Abbozza.tools[i][0],Abbozza.tools[i][1],Abbozza.tools[i][2],Abbozza.tools[i][3]);
    }
}


Abbozza.addPluginTool = function(plugin,title,img,callback) {
    var tools = document.querySelector("[id='tools']");
    var button = document.createElement("div");
    button.setAttribute("title",_(title));
    button.className = "toolButton";
    button.onclick = function() { Abbozza.callPluginTool(plugin, callback); }
    button.setAttribute("plugin",plugin);
    var image = document.createElement("img");
    image.src = img;
    button.appendChild(image);
    tools.appendChild(button);
}

Abbozza.callPluginTool = function(plugin, callback) {
    if ( Abbozza.isPluginActivated(plugin) ) {
        callback.call(this);
    } else {
        Abbozza.openOverlay(__("gui.plugin_deactivated",0) + plugin + __("gui.plugin_deactivated",1));
        Abbozza.overlayWaitForClose();
    }
}


Abbozza.isPluginActivated = function(plugin) {
    var path = "/abbozza/plugin/" + plugin;
    var result;
    Connection.getTextSynced(path,
       function() { result = true; },
       function() { result = false; }
    );
    return result;
}
