/* 
 * Copyright 2018 Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


Frame = function (title, icon = null, closeable = false, id = null) {
    var frame = this;
    this.iconSrc = icon;
    this.title = title;
    this.initialX = 0;
    this.initialY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.minWidth = 200;
    this.minHeight = 70;

    this.div = document.createElement("DIV");
    this.div.className = "abzFrame";
    this.div.frame = this;

    this.titleBar = document.createElement("DIV");
    this.titleBar.className = "titleBar";
    this.titleBar.frame = this;
    this.div.appendChild(this.titleBar);

    this.titleLeft = document.createElement("DIV");
    this.titleLeft.className = "titleLeft";
    this.titleBar.appendChild(this.titleLeft);
    
    this.titleIcon = null;
    if (this.iconSrc != null) {
        this.titleIcon = document.createElement("IMG");
        this.titleIcon.src = this.iconSrc;
        this.titleLeft.appendChild(this.titleIcon);
    }

    this.titleText = document.createElement("DIV");
    this.titleText.className = "titleText";
    this.titleText.textContent = title;
    this.titleLeft.appendChild(this.titleText);
    
    
    this.titleRight = document.createElement("DIV");
    this.titleRight.className = "titleRight";
    this.titleBar.appendChild(this.titleRight);
    
    this.titleBar.addEventListener("mousedown",
            function (event) {
                Desktop.dragFrame(frame,event);
            }
    , false);
   
    if ( closeable ) {
        this.closeButton = document.createElement("SPAN");
        this.closeButton.className = "titleButton";
        this.titleRight.appendChild(this.closeButton);
        this.closeButton.innerHTML = "<svg viewBox='0 0 20 20'><path d='M3,3 L17,17 M17,3 L3,17' stroke='black' stroke-width='1px'></svg>";
    } else {
        this.closeButton = null;
    }
    
    this.minButton = document.createElement("SPAN");
    this.minButton.className = "titleButton";
    this.titleRight.appendChild(this.minButton);
    this.minButton.innerHTML = "<svg viewBox='0 0 20 20'><path stroke='black' stroke-width='1px' d='M3,17 L17,17'></svg>";
    this.minButton.onclick = this.minimize;
    this.minButton.frame = this;

    this.maxButton = document.createElement("SPAN");
    this.maxButton.className = "titleButton";
    this.titleRight.appendChild(this.maxButton);
    this.maxButton.innerHTML = "<svg viewBox='0 0 20 20'><rect stroke='black' stroke-width='1px' fill='none' x='3' y='3' width='14' height='14'></svg>";
    this.maxButton.onclick = this.maximize;
    this.maxButton.frame = this;

    this.icon = document.createElement("SPAN");
    this.icon.className = "abzFrameIcon";
    if (this.iconSrc != null) {
        this.icon.innerHTML = "<IMG src='" + this.iconSrc + "'/>";
    } else {
        this.icon.textContent = title;
    }
    this.icon.frame = this;
    // this.icon.style.visibility = "hidden";
    this.icon.onclick = function (event) {
        frame.toggleShow();
        frame.bringToFront();
    };

    this.content = document.createElement("DIV");
    this.content.className = "content";
    this.div.appendChild(this.content);

    this.resizeHandle = document.createElement("SPAN");
    this.resizeHandle.className = "resizeHandle";
    this.resizeHandle.innerHTML = "<svg viewBox='0 0 19 19'><path stroke='#909090' stroke-width='1px' d='M19,0 L0,19 M19,4 L4,19 M19,8 L8,19 M19,12 L12,19 M19,16 L 16,19'></svg>";
    this.div.appendChild(this.resizeHandle);
    this.resizeHandle.addEventListener("mousedown",
            function (event) {
                Desktop.resizeFrame(frame,event);
            }
    , false);

    this.div.style.visibility = "hidden";

    this.maximized = false;

    Desktop.addFrame(this, id);
}


Frame.prototype.setContent = function (contentDiv) {
    this.content.appendChild(contentDiv);
    contentDiv.style.visibility = "inherit";
}


Frame.prototype.toggleShow = function () {
    if (this.div.style.visibility == "hidden") {
        this.show();
    } else {
        this.hide();
    }
}

Frame.prototype.show = function () {
    this.onShow();
    this.div.style.visibility = "visible";
    this.content.style.visibility = "visible";
    this.bringToFront();
}

Frame.prototype.hide = function () {
    this.onHide();
    this.div.style.visibility = "hidden";
    this.content.style.visibility = "hidden";
    this.div.style.zIndex = 0;
}

// These operations provide hooks which will be called right
// BEFORE the frame is shown or hidden.

Frame.prototype.onShow = function() {};
Frame.prototype.onHide = function() {};

Frame.prototype.bringToFront = function () {
    if ( Desktop.frameAtFront != null ) {
        Desktop.frameAtFront.div.style.zIndex = Desktop.backLayer;
    }
    this.div.style.zIndex = Desktop.frontLayer;
    Desktop.frameAtFront = this;
}


Frame.prototype.isVisible = function() {
    return (this.div.style.visibility == "visible");
}

/**
 * Sets the size of the frame
 * 
 * @param {string} w The width as length measure with unit
 * @param {string} h The height as length measure with unit
 * @returns {undefined}
 */
Frame.prototype.setSize = function (w, h) {
    if ( w == null ) w = this.div.style.width;
    if ( h == null ) w = this.div.style.height;
    
    if (w < this.minWidth)
        w = this.minWidth;
    if (h < this.minHeight)
        h = this.minHeight;

    if (typeof w == "number") {
        this.div.style.width = w + "px";
    } else {
        this.div.style.width = w;
    }
    if (typeof h == "number") {
        this.div.style.height = h + "px";
    } else {
        this.div.style.height = h;
    }
    var event = new CustomEvent("frame_resize", {
        detail: {
            frame: this
        }
    });
    this.div.dispatchEvent(event);
}

/**
 * Sets the position of the top left corner of the frame
 *  
 * @param {string} x The x-coordinate as length measure with unit
 * @param {string} y The y-coordinate as length measure with unit
 * @returns {undefined}
 */
Frame.prototype.setPosition = function (x, y) {
    if ( x == null ) x = this.div.style.left;
    if ( y == null ) y = this.div.style.height;
    
    if (typeof x == "number") {
        this.div.style.left = x + "px";
    } else {
        this.div.style.left = x;
    }
    if (typeof y == "number") {
        this.div.style.top = y + "px";
    } else {
        this.div.style.top = y;
    }
}


Frame.prototype.setMinSize = function (mw, mh) {
    this.minWidth = mw;
    this.minHeight = mh;
}



Frame.prototype.onDragEnd = function (event) {
    var frame = this.frame;
    var rect = this.getBoundingClientRect();
    var x = this.offsetLeft + event.offsetX;
    var y = this.offsetTop + event.offsetY;
    frame.setPosition(x, y);
    frame.bringToFront();
}


Frame.prototype.maximize = function (event) {
    event.stopPropagation();
    if ( Abbozza.lastFrame == this.frame ) console.log("gleicher");
    Abbozza.lastFrame = this.frame;
    var frame = this.frame;
    if ( frame.maximized == false ) {
        frame.oldWidth = frame.div.style.width;
        frame.oldHeight = frame.div.style.height;
        frame.oldX = frame.div.style.left;
        frame.oldY = frame.div.style.top;
        var w = frame.desktop.desktop.offsetWidth - 2;
        var h = frame.desktop.desktop.offsetHeight - 2;
        frame.setPosition(0, 0);
        frame.setSize(w, h);
        frame.maximized = true;
        frame.bringToFront();
    } else {
        frame.maximized = false;
        frame.setPosition(frame.oldX, frame.oldY);
        frame.setSize(frame.oldWidth, frame.oldHeight);
    }
}

Frame.prototype.minimize = function (event) {
    event.stopPropagation();
    var frame = this.frame;
    frame.maximized = false;
    frame.hide();
}


Frame.prototype.dragEnd = function (event) {

    var frame = this.frame;
    frame.initialX = frame.currentX;
    frame.initialY = frame.currentY;

    frame.active = false;
}

Frame.prototype.drag = function (event) {
    var frame = this.frame;
    if (frame.active) {

        event.preventDefault();

        if (event.type === "touchmove") {
            frame.currentX = event.touches[0].clientX - frame.initialX;
            frame.currentY = event.touches[0].clientY - frame.initialY;
        } else {
            frame.currentX = event.clientX - frame.initialX;
            frame.currentY = event.clientY - frame.initialY;
        }

        frame.xOffset = frame.currentX;
        frame.yOffset = frame.currentY;

        frame.setPosition(frame.currentX, frame.currentY);
    }
}

/**
 * Add a button to the title bar of the frame.
 * 
 * @param {type} html The element to be used as button
 * @param {type} clickHandler the function to be called if the button is clicked
 * @param {type} tooltip An optinal tooltip for the button.
 * 
 * @returns {Frame.prototype.addTitleButton.button|createElement.el}
 */
Frame.prototype.addTitleButton = function(html,clickHandler, tooltip = null) {
    var button = document.createElement("SPAN");
    button.className = "titleButton";
    button.innerHTML = html;
    button.onclick = clickHandler
    if ( tooltip != null ) {
        button.title = tooltip;
    }
    this.titleRight.insertBefore(button,this.minButton);
    return button;
}


Frame.prototype.getLayoutXML = function(id) {
    var layout = document.createElement("frame");
    layout.id = id;
    var px = Math.round(100 * this.div.offsetLeft / Desktop.desktop.offsetWidth);
    var py = Math.round(100 * this.div.offsetTop / Desktop.desktop.offsetHeight);
    var pw = Math.round(100 * this.div.offsetWidth / Desktop.desktop.offsetWidth);
    var ph = Math.round(100 * this.div.offsetHeight / Desktop.desktop.offsetHeight);
    layout.setAttribute( "x" , px + "%" );
    layout.setAttribute( "y" , py + "%" );
    layout.setAttribute( "width" , pw + "%" );
    layout.setAttribute( "height" , ph + "%" );
    layout.setAttribute( "visibility" , this.div.style.visibility )
    return layout;
}


Frame.prototype.restoreLayoutXML = function(element) {
    var x = element.getAttribute("x");
    var y = element.getAttribute("y");
    var width = element.getAttribute("width");
    var height = element.getAttribute("height");
    
    this.setPosition(x,y);
    this.setSize(width,height);
    
    if ( element.getAttribute("visibility") == "hidden" ) {
        this.hide();
    }
}
