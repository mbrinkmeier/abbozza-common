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
 * @fileoverview This class is the internal "Task Window".
 * 
 * Its contents can be edited in the GUI. It displays HTML and can execute
 * JavaScript. It provides two perspectives on the content. The content 
 * perspective displays the content as rendered HTML and allows navigation 
 * through a series of pages. The editor perspective allows the editing of the
 * HTML code, including the definition of multiple pages by <page>-tags.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 * 
 * NOT SYSTEM SPECIFIC
 */


/* global TaskWindow */
TaskWindow = {
    pages_ : new Array(), // This array contains all <page>-elements
    currentPage_ : 0,    // The currently displayed page
    resizable : true,
    editable: true,
    closable: true,
    ckeditor : null
}

/**
 * Initialization of the TaskWindow
 */
TaskWindow.init = function () {
    
    // TaskWindow.overlay_ is the outer div
    TaskWindow.overlay_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.overlay_.className = "taskOverlay";
    TaskWindow.overlay_.id = "taskOverlay";
    TaskWindow.overlay_.style.display = "none";
    TaskWindow.overlay_.onmousedown = TaskWindow.onmousedown_;
    TaskWindow.overlay_.onmouseover = TaskWindow.onmouseover_;
    TaskWindow.minWidth = 300;
    TaskWindow.minHeight = 200;
    
    // Add a close button, if required
    if ( TaskWindow.closable ) {
      TaskWindow.closeButton_ = document.createElementNS(Blockly.HTML_NS, 'div');
      TaskWindow.closeButton_.className = "taskOverlayButton";
      TaskWindow.closeButton_.innerHTML = '<img src="img/iwin_close.png" width="16px"/>';
      TaskWindow.closeButton_.onclick = TaskWindow.closeClicked_;
      TaskWindow.overlay_.appendChild(TaskWindow.closeButton_);
    }
    
    // Add an edit button, if required
    if ( TaskWindow.editable ) {
      TaskWindow.editButton_ = document.createElementNS(Blockly.HTML_NS, 'div');
      TaskWindow.editButton_.className = "taskOverlayButton";
      TaskWindow.editButton_.innerHTML = '<img src="img/iwin_edit.png" width="16px"/>';
      TaskWindow.editButton_.onclick = TaskWindow.editClicked_;
      TaskWindow.overlay_.appendChild(TaskWindow.editButton_);
    }
    
    // TaskWindow.page_wrapper_ is the inner div surrounding the content
    TaskWindow.page_wrapper_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.page_wrapper_.className = "taskOverlayPage";
    TaskWindow.page_wrapper_.innerHTML = '';
    TaskWindow.page_wrapper_.style.display = "block";
    TaskWindow.overlay_.appendChild(TaskWindow.page_wrapper_);
    
    // This div contins the current page and the editor
    TaskWindow.page_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.page_.className = "taskOverlayEditorWrapper";
    TaskWindow.page_wrapper_.appendChild(TaskWindow.page_);

    // TaskWndow.nav_ ist the navigation bar at the bottom 
    TaskWindow.nav_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.nav_.className = "taskOverlayNav";
    TaskWindow.nav_.value = '';
    TaskWindow.nav_.style.display = "none";
    TaskWindow.overlay_.appendChild(TaskWindow.nav_);    
    
    // TaskWindow.nav_prev_ is the "to previous" arrow
    TaskWindow.nav_.prev_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.prev_.innerHTML = "&larr;";
    TaskWindow.nav_.prev_.className = "taskOverlayNavButton";
    TaskWindow.nav_.prev_.onclick = TaskWindow.prevPage_;
    TaskWindow.nav_.appendChild(TaskWindow.nav_.prev_);
    
    // TaskWindow.nav_pageno_ is the number of the current page
    TaskWindow.nav_.pageno_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.pageno_.textContent = (TaskWindow.currentPage_ + 1) + " / " + TaskWindow.pages_.length;
    TaskWindow.nav_.pageno_.className = "taskOverlayNavButton";
    TaskWindow.nav_.appendChild(TaskWindow.nav_.pageno_);
    
    // TaskWindow.nav_next_ is the "to next" arrow    
    TaskWindow.nav_.next_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.next_.innerHTML = "&rarr;";
    TaskWindow.nav_.next_.onclick = TaskWindow.nextPage_;
    TaskWindow.nav_.next_.className = "taskOverlayNavButton";
    TaskWindow.nav_.appendChild(TaskWindow.nav_.next_)

    // TaskWindow.content_ is a container for the displayed content
    TaskWindow.content_ = document.createElementNS(Blockly.HTML_NS, 'pages');
    TaskWindow.content_.className = "taskOverlayContent";
    TaskWindow.content_.style.display = "none";
    TaskWindow.setContent('',true);
    TaskWindow.editing_ = false;    
    // TaskWindow.overlay_.appendChild(TaskWindow.content_);


    // TaskWindow.editor_ ist the editor
    // TaskWindow.editor_wrapper_ = document.createElementNS(Blockly.HTML_NS, 'div');
    // TaskWindow.editor_wrapper_.className = "taskOverlayEditorWrapper";
    // TaskWindow.editor_ = document.createElementNS(Blockly.HTML_NS, 'textarea');
    // TaskWindow.editor_.className = "taskOverlayEditor";
    // TaskWindow.editor_.value = '';
    // TaskWindow.editor_.style.display = "none";
    // TaskWindow.editor_.oninput = TaskWindow.editorChange_;
    // TaskWindow.editor_wrapper_.appendChild(TaskWindow.editor_);
    // TaskWindow.overlay_.appendChild(TaskWindow.editor_wrapper_);
;
}


/**
 * Displays the TaskWindow
 */
TaskWindow.show = function() {
    TaskWindow.setEditable((Configuration.getParameter("tasksEditable") == "true"));
    TaskWindow.overlay_.style.top = "60px";
    TaskWindow.overlay_.style.right = "20px";
    TaskWindow.overlay_.style.display = "block";
    TaskWindow.showContent(false);
    document.getElementsByTagName("body")[0].appendChild(TaskWindow.overlay_);
}

/**
 * Hides the TaskWindow
 */
TaskWindow.hide = function() {
    TaskWindow.overlay_.style.display = "none";
    TaskWindow.page_wrapper_.style.display = "block";
    TaskWindow.editing_ = false;
    if (document.getElementsByClassName("taskOverlay").length > 0) {
       document.getElementsByTagName("body")[0].removeChild(TaskWindow.overlay_);
    }
}

/**
 * Switches to the editor perspective.
 */
TaskWindow.showEditor = function () {
    if ( !TaskWindow.editable ) return;
    // TaskWindow.nav_.style.display = "none";
    TaskWindow.editing_ = true;
    var height = TaskWindow.page_.offsetHeight;
    
    // Insert ckeditor
    TaskWindow.ckeditor = CKEDITOR.replace( TaskWindow.page_ );
    // TaskWindow.ckeditor.setData(TaskWindow.getContent());
    // TaskWindow.ckeditor.on("change",TaskWindow.editorChange_)   
}

/*
 * Switches to the content perspective
 */
TaskWindow.showContent = function(getContentFromEditor) {
   
    if ( TaskWindow.ckeditor != null ) {
       // var content = TaskWindow.ckeditor.getData(false);
       // if (getContentFromEditor) TaskWindow.setContent(content, false);
       TaskWindow.ckeditor.destroy();
       TaskWindow.ckeditor = null;
    }
   
   if (TaskWindow.pages_.length > 1) {
      TaskWindow.nav_.style.display = "block";
   } else {
      TaskWindow.nav_.style.display = "none";
   }

   // TaskWindow.editor_.value = "";
   TaskWindow.editing_ = false;
}

/**
 * Checks if the TaskWindow is currently visible
 * 
 * @returns {Boolean} true is TaskWindow is vbisible, false otherwise.
 */
TaskWindow.isVisible = function () {
    return (TaskWindow.overlay_.style.display == "block");
}

/**
 * Set the content of the TaskWindow. It is given as an HTML-string (not a
 * DOM). Setting flag to true resets the displayed page number to 0.
 * 
 * @param {type} html The HTML string
 * @param {type} reset If true, the displayed page is reset to page number 0
 */
TaskWindow.setContent = function(html, reset) {

    // Throw away old content
    TaskWindow.pages_ = new Array();
    if (reset) TaskWindow.currentPage_ = 0;

    // Create new dom
    var dom = document.createElementNS(Blockly.HTML_NS, 'pages');
    dom.innerHTML = html;

    // Retreive all pages from dom
    TaskWindow.pages_ = new Array();
    var list = dom.getElementsByTagName('page');
    for ( var i = 0; i < list.length; i++ ) {
        TaskWindow.pages_.push(list[i]);
    }
    
    // If no pages were found, use the whole content as page.
    if (TaskWindow.pages_.length == 0) {
        var parent = TaskWindow.content_.getElementsByTagName('pages');
        if ( !parent ) parent = dom;
        // If no page is given, the whole thing is the page
        var page = document.createElementNS(Blockly.HTML_NS, "page");
        TaskWindow.pages_ = new Array();
        TaskWindow.pages_.push(page);
    }
    
    // Now TaskWindow.pages_ contains the doms of the single pages
    
    // Go to the current page
    if ( (TaskWindow.currentPage_ < TaskWindow.pages_.length) && !reset) {
        TaskWindow.setPage_(TaskWindow.currentPage_,false);
    } else {
        TaskWindow.setPage_(0,false);
    }
    
}

/**
 * Sets the current displayed page.
 * 
 * @param {type} page The number of the page to be displayed.
 */
TaskWindow.setPage_ = function ( page, storePage ) {
    // If page is out of scope, do nothing
    if ((page >= TaskWindow.pages_.length) || (page < 0)) return;
    
    // Toggle nav bar
    if (TaskWindow.pages_.length > 1) {
      TaskWindow.nav_.style.display = "block";
    } else {
      TaskWindow.nav_.style.display = "none";
    }

    // Show selected page
    if ( TaskWindow.editing_ ) {
      if ( TaskWindow.ckeditor != null ) {
        var content = TaskWindow.ckeditor.getData(false);
        // Store content in
        TaskWindow.pages_[TaskWindow.currentPage_].innerHTML = content;
        TaskWindow.ckeditor.destroy();
        TaskWindow.ckeditor = null;
      }
      TaskWindow.currentPage_ = page;
      TaskWindow.page_.innerHTML = TaskWindow.pages_[TaskWindow.currentPage_].innerHTML;
      TaskWindow.nav_.pageno_.textContent = (TaskWindow.currentPage_ + 1) + " / " + TaskWindow.pages_.length;

      TaskWindow.ckeditor = CKEDITOR.replace( TaskWindow.page_ );
    } else {
      // If storePage is set, store the old page
      if ( storePage ) {
         TaskWindow.pages_[TaskWindow.currentPage_].innerHTML =  TaskWindow.page_.innerHTML;
      }
      TaskWindow.currentPage_ = page;
      TaskWindow.page_.innerHTML = TaskWindow.pages_[TaskWindow.currentPage_].innerHTML;
      TaskWindow.nav_.pageno_.textContent = (TaskWindow.currentPage_ + 1) + " / " + TaskWindow.pages_.length;
    }
}

/**
 * Skips to the prvious page if possible.
 */
TaskWindow.prevPage_ = function() {
    if (TaskWindow.currentPage_ > 0) {
        TaskWindow.setPage_(TaskWindow.currentPage_ - 1, true);
    }
}

/**
 * Skips to the next page if possible.
 */
TaskWindow.nextPage_ = function() {
    if (TaskWindow.currentPage_ < TaskWindow.pages_.length - 1) {
        TaskWindow.setPage_(TaskWindow.currentPage_ + 1, true);
    }
}

/**
 * Insert a new empty page after the current one.
 * 
 * @returns {undefined}
 */
TaskWindow.insertPage = function() {
   var page = document.createElementNS(Blockly.HTML_NS, "page");
   TaskWindow.pages_.push(null);
   for ( var i = TaskWindow.pages_.length-1 ; i > TaskWindow.currentPage_+1 ; i-- ) {
       TaskWindow.pages_[i] = TaskWindow.pages_[i-1] 
   }
   TaskWindow.pages_[TaskWindow.currentPage_ + 1] = page;
   
   TaskWindow.nextPage_();
   console.log(TaskWindow.pages_);
}


/**
 * Deletes the current page.
 * 
 * @returns {undefined}
 */
TaskWindow.deletePage = function() {
   if ( !confirm(_("gui.delete_page"))) return;

   // End editing
   if ( TaskWindow.ckeditor && TaskWindow.editing_ ) {
      TaskWindow.ckeditor.destroy();
      TaskWindow.ckeditor = null;       
   }
   
   for ( var i = TaskWindow.currentPage_ ; i < TaskWindow.pages_.length-1 ; i++ ) {
       TaskWindow.pages_[i] = TaskWindow.pages_[i+1];
   }
   TaskWindow.pages_.pop();
   
   if ( TaskWindow.pages_.length == 0 ) {
      var page = document.createElementNS(Blockly.HTML_NS, "page");
      TaskWindow.pages_ = new Array();
      TaskWindow.pages_.push(page);
      TaskWindow.setPage_(0);
   } else {
      TaskWindow.setPage_(TaskWindow.currentPage_, false);
   }
   TaskWindow.nav_.pageno_.textContent = (TaskWindow.currentPage_ + 1) + " / " + TaskWindow.pages_.length;
   
   // Restart editor
   if ( TaskWindow.editing_ ) {
      TaskWindow.ckeditor = CKEDITOR.replace( TaskWindow.page_ );       
   }
}

/**
 * Returns the content of the TaskWindow as an HTML-string.
 * 
 * @returns {document@call;createElementNS.innerHTML|String|type} 
 *      The content as HTML-string
 */
TaskWindow.getContent = function() {
   // First retrieve the current page
   TaskWindow.pages_[TaskWindow.currentPage_].innerHTML = TaskWindow.page_.innerHTML;
   TaskWindow.content_ = document.createElementNS(Blockly.HTML_NS, 'pages');
    for ( var i = 0; i < TaskWindow.pages_.length; i++) {
        var page = document.createElementNS(Blockly.HTML_NS, 'page');
        page.innerHTML = TaskWindow.pages_[i].innerHTML;
        TaskWindow.content_.appendChild(page);
    }
    return TaskWindow.content_.innerHTML;
}


/**
 * Checks if the current page is empty.
 * 
 * @returns {undefined}
 */
TaskWindow.isCurrentPageEmpty = function() {
    return ( TaskWindow.pages_[TaskWindow.currentPage_].innerHTML == "" );
}


/**
 * Set the size of the TaskWindow
 * 
 * @param {type} The new width
 * @param {type} The new height
 */
TaskWindow.setSize = function(width, height) {
    width = (width > TaskWindow.minWidth) ? width : TaskWindow.minWidth;
    height = (height > TaskWindow.minHeight) ? height : TaskWindow.minHeight;
    var bottom = TaskWindow.overlay_.offsetTop + height;
    
    if ( height > window.innerHeight) {
        height = 8 * window.innerHeight / 10;
    }
    
    TaskWindow.overlay_.style.width = width + "px";
    TaskWindow.overlay_.style.height = height + "px";
}

/**
 * Returns the width of the TaskWindow.
 * 
 * @returns {document@call;createElementNS.offsetWidth|TaskWindow.overlay_.offsetWidth}
 *  The width
 */
TaskWindow.getWidth = function() {
    return TaskWindow.overlay_.offsetWidth;
}

/**
 * Returns the height of the TaskWindow.
 * @returns {document@call;createElementNS.offsetHeight|TaskWindow.overlay_.offsetHeight}
 *  The height
 */
TaskWindow.getHeight = function() {
    return TaskWindow.overlay_.offsetHeight;
}

/**
 * Handles the event if the Close-button of the TaskWindow is clicked.
 * 
 * @param {type} event The event causing the handlers activation
 */
TaskWindow.closeClicked_ = function(event) {
    if ( !TaskWindow.closable ) return;
    if (TaskWindow.editing_) {
        TaskWindow.showContent(true);
    }
    TaskWindow.hide();
    event.stopPropagation();
}

/**
 * Handles the event, if the edit-button of the TaskWindow is clicked.
 * 
 * @param {type} event The event causing the handlers activation.
 */
TaskWindow.editClicked_ = function(event) {
    if (TaskWindow.editing_ == false) {
        TaskWindow.showEditor();
    } else {
        TaskWindow.showContent(true);
    }
    event.stopPropagation();
}

/**
 * Handles the event, if the mouse is over the TaskWindow.
 * 
 * @param {type} event
 */
TaskWindow.onmouseover_ = function(event) {
    var relX = event.clientX + window.pageXOffset;
    var relY = event.clientY + window.pageYOffset;
    if ( event.srcElement ) {
        relX = relX - event.srcElement.offsetLeft;
        relY = relY - event.srcElement.offsetTop;
    }
    if ( !TaskWindow.resizable ) return;
    
    if ((relY < 34) && (relX < TaskWindow.overlay_.offsetWidth - 100)) {
        TaskWindow.overlay_.style.cursor = "move";
    } else if ((relX < 10) && (relY > 34)) {
        TaskWindow.overlay_.style.cursor = "w-resize";
    } else if ((relX > TaskWindow.overlay_.offsetWidth - 10) && (relY > 34)) {
        TaskWindow.overlay_.style.cursor = "e-resize";
    } else if (relY > TaskWindow.overlay_.offsetHeight - 10) {
        TaskWindow.overlay_.style.cursor = "s-resize";
    } else {
        TaskWindow.overlay_.style.cursor = "pointer";
    }
}


/**
 * Handles the event if the mouse is pressed inside the TaskWindow.
 * 
 * @param {type} event
 */
TaskWindow.onmousedown_ = function(event) {
    if ( !TaskWindow.resizable ) return;
    TaskWindow.relX = event.clientX + window.pageXOffset - TaskWindow.overlay_.offsetLeft;
    TaskWindow.relY = event.clientY + window.pageYOffset - TaskWindow.overlay_.offsetTop;
    if ((TaskWindow.relY < 34) && (TaskWindow.relX < TaskWindow.overlay_.offsetWidth - 100)) {
        // dragging
        DraggingManager.start(TaskWindow.overlay_, TaskWindow.ondrag_, TaskWindow.ondragend_);
    } else if ((TaskWindow.relX < 10) && (TaskWindow.relY > 34)) {
        // resize left
        DraggingManager.start(TaskWindow.overlay_, TaskWindow.resizeleft_, TaskWindow.resizeleft_);
    } else if ((TaskWindow.relX > TaskWindow.overlay_.offsetWidth - 10) && (TaskWindow.relY > 34)) {
        // resize right
        DraggingManager.start(TaskWindow.overlay_, TaskWindow.resizeright_, TaskWindow.resizeright_);
    } else if (TaskWindow.relY > TaskWindow.overlay_.offsetHeight - 10) {
        // resize bottom
        DraggingManager.start(TaskWindow.overlay_, TaskWindow.resizebottom_, TaskWindow.resizebottom_);
    } else {
        // TaskWindow.setPage_(TaskWindow.currentPage_+1);
    }
    event.stopPropagation();
}

/**
 * Handles the dragging for movement (top border)
 * 
 * @param {type} event
 */
TaskWindow.ondrag_ = function(event) {
    var newLeft = event.clientX + window.pageXOffset - TaskWindow.relX;
    var newRight = window.innerWidth - (newLeft + this.offsetWidth);
    var newTop = event.clientY + window.pageYOffset - TaskWindow.relY;
    if ( (newLeft >= 0) && (newRight >= 0) && 
         (newTop >= 0) && (newTop + this.offsetHeight < window.innerHeight)) {
        this.style.right = newRight + "px";
        this.style.top = newTop + "px";
    }
}

/**
 * Stops the dragging for movement
 * 
 * @param {type} event
 */
TaskWindow.ondragend_ = function(event) {}


/**
 * Handles the dragging for horizontal resizing (left border)
 * 
 * @param {type} event
 */
TaskWindow.resizeleft_ = function(event) {
    var newLeft = event.clientX + window.pageXOffset - TaskWindow.relX;
    var oldLeft = this.offsetLeft;
    var newWidth = this.offsetWidth + (oldLeft - newLeft);
    this.style.width = newWidth + "px";
    var width = this.offsetWidth - 23;
    TaskWindow.page_.style.width = width + "px";
}

/**
 * Handles the dragging for horizontal resizing (right border)
 * 
 * @param {type} event
 */
TaskWindow.resizeright_ = function(event) {
var oldLeft = this.offsetLeft;
        var oldRight = window.innerWidth - this.offsetLeft - this.offsetWidth;
        var newRight = window.innerWidth - event.clientX - window.pageXOffset;
        var newWidth = this.offsetWidth -4 + (oldRight - newRight);
        if (newWidth > TaskWindow.minWidth) {
            this.style.width = "" + newWidth + "px"
            this.style.right = "" + newRight + "px"
            var width = this.offsetWidth - 23;
            TaskWindow.page_.style.width = width + "px";
        }
}

/**
 * Handles the dragging for vertical resizing (bootm border)
 * 
 * @param {type} event
 */
TaskWindow.resizebottom_ = function(event) {
    var oldTop = this.offsetTop;
    var oldBottom = this.offsetTop + this.offsetHeight;
    var newBottom = event.clientY + window.pageYOffset;
    var newHeight = this.offsetHeight - 3 + (newBottom - oldBottom);
    if (newHeight > TaskWindow.minHeight) {
        this.style.height = newHeight + "px";
        var height = newHeight - 48;
        TaskWindow.page_wrapper_.style.height = height + "px";        
    }

    if ( TaskWindow.ckeditor != null ) {
        TaskWindow.ckeditor.resize("100%",height,false);
    }
 }

/**
 * Handles the end of dragging for resizing
 *
 * @param {type} event
 */
TaskWindow.resizeend_ = function(event) {}


/**
 * The edit button of the TaskWindow is removed, if set to false.
 * 
 */
TaskWindow.setEditable = function(editable) {
    if (!TaskWindow.editButton_) return;
    if (editable) {  
        TaskWindow.editButton_.style.display = "block";
    } else {
        TaskWindow.editButton_.style.display = "none";
    }
}

/**
 * This handler is called, if the content of the editor changes.
 */
TaskWindow.editorChange_ = function(event) {
    if ( TaskWindow.ckeditor != null ) {
       var content = TaskWindow.ckeditor.getData(false);
       TaskWindow.setContent(content, false);
    }
}
