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
 * @fileoverview ... 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

EditorOverlay = function () {
    this.taskOverlay_ = null;
    
    this.overlay_ = document.createElementNS(Blockly.HTML_NS, 'DIV');
    this.overlay_.className = "editorOverlay";
    this.overlay_.id = "editorOverlay";
    
    /*
    this.overlayTitle_ = document.createElementNS(Blockly.HTML_NS, 'textarea');
    this.overlayTitle_.className = "editorTitle";
    this.overlayTitle_.value = "";
    this.overlayTitle_.readOnly = false;
    this.overlay_.appendChild(this.overlayTitle_);
    */
   
    this.overlayContent_ = document.createElementNS(Blockly.HTML_NS, 'textarea');
    this.overlayContent_.className = "editorContent";
    this.overlayContent_.value = "";
    this.overlay_.appendChild(this.overlayContent_);

    this.overlayButtons_ = document.createElementNS(Blockly.HTML_NS, 'div');
    this.overlayButtons_.className = "editorButtons";
    this.overlay_.appendChild(this.overlayButtons_);
    
    this.overlayCancel_ = document.createElementNS(Blockly.HTML_NS, 'span');
    this.overlayCancel_.className = "editorButton";
    this.overlayCancel_.textContent = _("gui.cancel");
    var overlay = this;
    this.overlayCancel_.onclick = function(event) { overlay.hide(event); };
    this.overlayButtons_.appendChild(this.overlayCancel_);

    this.overlayOK_ = document.createElementNS(Blockly.HTML_NS, 'span');
    this.overlayOK_.className = "editorButton";
    this.overlayOK_.textContent = _("gui.save");
    this.overlayOK_.onclick = function(event) { overlay.closeAndSave(event); };
    this.overlayButtons_.appendChild(this.overlayOK_);
}


EditorOverlay.prototype.show = function(taskOverlay) {
    this.taskOverlay_ = taskOverlay;
    // this.overlayTitle_.value = this.taskOverlay_.getTitle();
    this.overlayContent_.value = this.taskOverlay_.getContent();
    this.overlay_.display = "block";
    document.getElementsByTagName("body")[0].appendChild(this.overlay_);
}

EditorOverlay.prototype.hide = function(event) {
    this.overlay_.display = "none";
    document.getElementsByTagName("body")[0].removeChild(this.overlay_);
}

EditorOverlay.prototype.closeAndSave = function(event) {
    this.overlay_.display = "none";
    document.getElementsByTagName("body")[0].removeChild(this.overlay_);
    // this.taskOverlay_.setTitle(this.overlayTitle_.value);
    this.taskOverlay_.setContent(this.overlayContent_.value);
}