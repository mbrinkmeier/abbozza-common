/* 
 * Copyright 2018 mbrin.
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

/*
 * The static desktop object.
 */
var Desktop = {};

/**
 * This function attaches the desktop to the body element.
 * 
 * @returns {undefined}
 */
Desktop.init = function (rootPath) {
    this.rootPath = rootPath;
    this.dragging = false;
    this.draggedFrame = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.frameAtFront = null;
    this.frontLayer = 30;
    this.backLayer = 10;

    this.body = document.getElementsByTagName("BODY")[0];

    this.header = document.createElement("DIV");
    this.header.className = "abzHeader";
    this.body.appendChild(this.header);

    this.footer = document.createElement("DIV");
    this.footer.className = "abzFooter";
    this.body.appendChild(this.footer);
    
    this.sceneButton = document.createElement("DIV");
    this.sceneButton.className = "sceneButton";
    this.footer.appendChild(this.sceneButton);
    this.sceneButton.title = "Scenes";
    this.sceneButton.style.backgroundImage = "url('" + this.rootPath + "img/scenes.png')";

    this.iconList = document.createElement("DIV");
    this.iconList.className = "iconList";
    this.footer.appendChild(this.iconList);

    this.desktop = document.createElement("DIV");
    this.desktop.className = "abzDesktop";
    this.body.appendChild(this.desktop);

    this.sceneList = document.createElement("DIV");
    this.sceneList.className = "abzSceneList";
    this.desktop.appendChild(this.sceneList);
    this.sceneList.onchange = Desktop.setScene;
    this.addScene("Hide all",  this.rootPath + "img/hide.png", Desktop.hideAllFrames );
    this.addScene("Cascade", this.rootPath + "img/cascade.png", Desktop.cascadeFrames );
    this.sceneButton.onclick = function(event) {
        if ( Desktop.sceneList.style.visibility == "hidden" ) {
            Desktop.sceneList.style.visibility = "visible";            
        } else {
            Desktop.sceneList.style.visibility = "hidden";
        }
    };

    this.desktop.ondrop = Desktop.onDrop;
    this.desktop.ondragover = Desktop.allowDrop;
    
    this.frameDragView = document.createElement("DIV");
    this.frameDragView.className = "frameDragView";
    this.frameDragView.style.left = "0px";
    this.frameDragView.style.top = "0px";
    this.frameDragView.style.width = "50%";
    this.frameDragView.style.height = "100%";
    this.frameDragView.style.zIndex = "20";
    this.desktop.appendChild(this.frameDragView);
}


Desktop.addFrame = function (frame) {
    this.iconList.appendChild(frame.icon);
    this.desktop.appendChild(frame.div);
    frame.desktop = this;
    frame.show();
    frame.bringToFront();
}


Desktop.onDrop = function (event) {
}

Desktop.allowDrop = function (event) {
    event.preventDefault();
}

Desktop.setSize = function (w, h) {
    if (typeof w == "number") {
        this.desktop.width = w + "px";
    } else {
        this.desktop.width = w;
    }

    if (typeof h == "number") {
        this.desktop.height = h + "px";
    } else {
        this.desktop.height = h;
    }
}

Desktop.openFrame = function (event) {
    frame = Desktop.frameList[Desktop.frameList.selectedIndex].frame;
    if (frame != null) {
        frame.show();
        frame.bringToFront();
        Desktop.frameList.selectedIndex = 0;
    }
};

Desktop.drag = function (event) {
    event.preventDefault();

    if (Desktop.draggedFrame != null) {
        var frame = Desktop.draggedFrame;
        frame.currentX = event.clientX - Desktop.dragStartX;
        frame.currentY = event.clientY - Desktop.dragStartY;

        frame.xOffset = frame.currentX;
        frame.yOffset = frame.currentY;

        var ending = false;
        if (frame.currentX < 0) {
            frame.currentX = 0;
        }
        if (frame.currentY < 0) {
            frame.currentY = 0;
        }
        if ( frame.currentX > Desktop.desktop.offsetWidth - 20 ) {
            frame.currentX = Desktop.desktop.offsetWidth - 20;
        }
        if ( frame.currentY > Desktop.desktop.offsetHeight - 20 ) {
            frame.currentY = Desktop.desktop.offsetHeight - 20;
        }

        // Check position for automatic resize and position snap
        var pointerPosX = event.clientX - Desktop.desktop.offsetLeft;
        var pointerPosY = event.clientY - Desktop.desktop.offsetTop;
        var xRatio = 1.0 * pointerPosX / Desktop.desktop.offsetWidth;
        var yRatio = 1.0 * pointerPosY / Desktop.desktop.offsetHeight;
        
        var top = (pointerPosY < 12);
        var bottom = (pointerPosY > Desktop.desktop.offsetHeight - 12);
        var left = (pointerPosX < 12);
        var right = (pointerPosX > Desktop.desktop.offsetWidth - 12);
        
        if ( top || bottom || left || right ) {
            
            Desktop.frameDragView.style.visibility = "visible";
            Desktop.frameDragView.style.visibility = Desktop.frontLayer+1;
            
            
            if ( top || bottom ) {
                Desktop.frameDragView.style.width = "100%";
                Desktop.frameDragView.style.left = "0px";
                Desktop.frameDragView.style.height = "100%";
                Desktop.frameDragView.style.top = "0px";
            }

            if ( left ) {
                Desktop.frameDragView.style.width = "50%";
                Desktop.frameDragView.style.left = "0px";
                if ( yRatio <= 0.25 ) {
                    Desktop.frameDragView.style.height = "50%";
                    Desktop.frameDragView.style.top = "0px";
                } else if ( yRatio >= 0.75 ) {
                    Desktop.frameDragView.style.height = "50%";
                    Desktop.frameDragView.style.top = "50%";                    
                } else {
                    Desktop.frameDragView.style.height = "100%";
                    Desktop.frameDragView.style.top = "0%";                                        
                }
            }
            
            if ( right ) {
                Desktop.frameDragView.style.width = "50%";
                Desktop.frameDragView.style.left = "50%";
                if ( yRatio <= 0.25 ) {
                    Desktop.frameDragView.style.height = "50%";
                    Desktop.frameDragView.style.top = "0px";
                } else if ( yRatio >= 0.75 ) {
                    Desktop.frameDragView.style.height = "50%";
                    Desktop.frameDragView.style.top = "50%";                    
                } else {
                    Desktop.frameDragView.style.height = "100%";
                    Desktop.frameDragView.style.top = "0%";                                        
                }                
            }
        } else {
            Desktop.frameDragView.style.visibility = "hidden";            
        }  
        
        frame.setPosition(frame.currentX, frame.currentY);
        
        if  ( ending ) {
            Desktop.dragEnd(frame);
        }
    }
};


Desktop.dragEnd = function (event) {
    Desktop.dragging = false;
    var frame = Desktop.draggedFrame;
    Desktop.draggedFrame = null;
    document.removeEventListener("mousemove", Desktop.drag, false);
    document.removeEventListener("mouseup", Desktop.dragEnd, false);
    
    if ( Desktop.frameDragView.style.visibility == "visible" ) {
        Desktop.frameDragView.style.visibility = "hidden";
        var x = Desktop.frameDragView.style.left;
        var y = Desktop.frameDragView.style.top;
        var w = Desktop.frameDragView.style.width;
        var h = Desktop.frameDragView.style.height;
        frame.setPosition(x,y);
        frame.setSize(w,h);    
    }
};


Desktop.dragFrame = function (frame,event) {
    if (Desktop.dragging == false) {
        Desktop.dragging = true;
        Desktop.draggedFrame = frame;

        frame.bringToFront();
        // Desktop.desktop.appendChild(frame.div);
        Desktop.dragStartX = event.clientX - frame.div.offsetLeft;
        Desktop.dragStartY = event.clientY - frame.div.offsetTop;
        frame.xOffset = 0;
        frame.yOffset = 0;
        document.addEventListener("mousemove", Desktop.drag, false);
        document.addEventListener("mouseup", Desktop.dragEnd, false);
    }
};


Desktop.resizing = function (event) {
    event.preventDefault();

    if (Desktop.resizedFrame != null) {
        var frame = Desktop.resizedFrame;
        frame.currentX = event.clientX - Desktop.dragStartX;
        frame.currentY = event.clientY - Desktop.dragStartY;
        
        var w = frame.startWidth + frame.currentX;
        var h = frame.startHeight + frame.currentY;
       
        frame.setSize(w,h);
    }
};


Desktop.resizeEnd = function(event) {
    Desktop.resizedFrame.maximized = false;
    Desktop.dragging = false;
    Desktop.resizedFrame = null;
    document.removeEventListener("mousemove", Desktop.resizing, false);
    document.removeEventListener("mouseup", Desktop.resizeEnd, false);
    console.log("resizeEnd");
};


Desktop.resizeFrame = function(frame,event) {
    if (Desktop.dragging == false) {
        Desktop.dragging = true;
        Desktop.resizedFrame = frame;
        frame.bringToFront();
        // Desktop.desktop.appendChild(frame.div);
        Desktop.dragStartX = event.clientX;
        Desktop.dragStartY = event.clientY;
        frame.startWidth = frame.div.offsetWidth;
        frame.startHeight = frame.div.offsetHeight;
        // frame.maximized = false;
        document.addEventListener("mousemove", Desktop.resizing, false);
        document.addEventListener("mouseup", Desktop.resizeEnd, false);
    }    
}


Desktop.setScene = function (event) {
    var scene = Desktop.sceneList[Desktop.sceneList.selectedIndex].sceneFunc;
    if (scene != null) {
        Desktop.sceneList.selectedIndex = 0;
        scene.call(Desktop);
    }
};


Desktop.addScene = function(text,icon,sceneFunc) {
    var sceneOption = document.createElement("SPAN");
    sceneOption.scene = null;
    if ( icon ) {
        sceneOption.style.backgroundImage = "url(" + icon + ")";
    } else {
        sceneOption.textContent = text;
    }
    sceneOption.setAttribute("title",text);
    sceneOption.sceneFunc = sceneFunc;
    sceneOption.onclick = function(event) {
        Desktop.sceneList.style.visibility = "hidden";
        sceneFunc.call(Desktop); 
    };
    this.sceneList.appendChild(sceneOption);    
}


Desktop.hideAllFrames = function() {
    for ( var i = 0; i < Desktop.desktop.children.length; i++ ) {
        var child = Desktop.desktop.children[i];
        if ( child.frame && child.frame.hide ) child.frame.hide();
    }
}

Desktop.cascadeFrames = function() {
    var ypos = 0;
    var xpos = 0;
    var height = Desktop.desktop.offsetHeight-2;
    var width = Desktop.desktop.offsetWidth-2   ;
    for ( var i = 0; i < Desktop.desktop.children.length; i++ ) {
        var child = Desktop.desktop.children[i];
        if ( child.frame ) { 
            var frame = child.frame;
            frame.show();
            frame.setSize(width,height);
            frame.setPosition(xpos,ypos);
            xpos = xpos + 32;
            ypos = ypos + 32;
            height = height - 32;
            width = width - 32;
        }
    }
}

