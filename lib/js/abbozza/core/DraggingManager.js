/* global DraggingManager */

/**
 * @license
 * abbozza!
 *
 * Copyright 2015-2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
 * @fileoverview DraggingManager is a simple tool to handle dragging of elements.
 * 
 * Only one lement can be dragged at a time.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 * 
 * NOT SYSTEM SPECIFIC
 */

DraggingManager = {
    draggingClient_: null,  // the dragged client
    ondrag_ : null,         // the "ondrag" event handler
    ondragend_ : null,      // the "dragend" event handler
    parent_ : null          // the parent in which the dragging takes place
};

/**
 * Starts the dragging for the given client by specifying the darg and dragend
 * handlers. The optional parent is the element in which the client can be
 * dragged. By default its the whole document.
 * 
 * @param {type} client The Element to be dragged.
 * @param {type} ondrag The handler for drag events while the client is dragged.
 * @param {type} ondragend The handler for the end of the dragging process.
 * @param {type} opt_parent The (optional) element in which teh dragging takes 
 *                          place. (defaul: document)
 */
DraggingManager.start = function(client,ondrag,ondragend,opt_parent) {
    if (opt_parent) 
        DraggingManager.parent_ = opt_parent;
    else 
        DraggingManager.parent_ = document;
    DraggingManager.client_ = client;
    DraggingManager.ondrag_ = ondrag;
    DraggingManager.ondragend_ = ondragend;
    
    // add envent handlers to the parent.
    DraggingManager.parent_.addEventListener("mousemove",DraggingManager.onmousemove,false);
    DraggingManager.parent_.addEventListener("mouseup",DraggingManager.onmouseup,false);
    document.addEventListener("mouseleave",DraggingManager.onmouseup,false);
};

/**
 * Stops the dragging of the current client.
* 
 * @returns {undefined}
 */
DraggingManager.stop = function() {
    DraggingManager.client_ = null;
    DraggingManager.ondrag_ = null;
    DraggingManager.ondragend_ = null;

    // Remove the event handlers
    DraggingManager.parent_.removeEventListener("mousemove",DraggingManager.onmousemove);
    DraggingManager.parent_.removeEventListener("mouseup",DraggingManager.onmouseup);    
    document.removeEventListener("mouseleave",DraggingManager.onmouseup);
};


/**
 * The "mousemove" event handler for the parent, calling the specified "ondrag"
 * event handler of the client. The "drag" handler is called with the client as
 *  "this".
 * 
 * @param {type} event The event 
 */
DraggingManager.onmousemove = function(event) {   
    if ( DraggingManager.client_ == null ) return;
    
    // if ( event.buttons == 1) {   
        if ( DraggingManager.ondrag_ != null ) {
            DraggingManager.ondrag_.call(DraggingManager.client_,event);
        }
    // } else if (event.buttons == 0) {
    //    if ( DraggingManager.ondragend_ != null ) {
    //        DraggingManager.ondragend_.call(DraggingManager.client_,event);
    //    }
    // }
};


/**
 * The "mouseup" event handler for the parent, calling the specified "ondragend"
 * event handler of the client.  The "dragend" handler is called with the 
 * client as "this".
 * 
 * @param {type} event
 */
DraggingManager.onmouseup = function(event) {

    console.log("hier");
    if ( DraggingManager.client_ == null ) return;
    
    
    // if (event.buttons == 0) {
        if ( DraggingManager.ondragend_ != null ) {
            DraggingManager.ondragend_.call(DraggingManager.client_,event);
        }
        DraggingManager.stop();
    // }
};