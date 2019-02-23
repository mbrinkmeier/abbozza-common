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

/**
 * Events during the Tasks Life Cycle
 * 
 * 1) The Task is loaded with a sketch  => Task.onLoad for new Task
 * 2) The Task window is shown          => Task|Page.onShow
 * 3) The current page is changed       => Page.onHide, Page.onShow
 * 3) The Task window is hidden         => Task|Page.onHide
 * 4) The Task is unloaded              => onUnload for old Task
 */

/**
 * 
 * A static object containing page hooks
 * 
 * Page.onShow(page) is triggered if the page is shown
 * Page.onHide(page) is triggered if the page is hidden
 *
 * Both triggers obtain the page element as parameter.
 */
var Page = {}

// A static object containing task hooks
//
// Task.onLoad() is triggered if the task is loaded
// Task.onUnload() is triggered if the task is replaced by anotehr task content
// Task.onShow() is triggered if the task window is opened
// Task.onHide() is triggered if the task window is closed (minimized)
var Task = {}


/* global TaskWindow */
TaskWindow = {
    pages_ : new Array(), // This array contains all <page>-elements
    taskScript_ : null,
    pageScript_ : null,
    currentPage_ : 0,    // The currently displayed page
    resizable : true,
    editable: true,
    closable: true,
    ckeditor : null,
    mainSketch : null,
    nextSketch : null,
    prevSketch : null,
    width : 0,
    height: 0
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
      TaskWindow.closeButton_.innerHTML = '<img src="img/nav/close.png"/>';
      TaskWindow.closeButton_.onclick = TaskWindow.closeClicked_;
      TaskWindow.overlay_.appendChild(TaskWindow.closeButton_);
    }
    
    // Add an edit button, if required
    if ( TaskWindow.editable ) {
      TaskWindow.editButton_ = document.createElementNS(Blockly.HTML_NS, 'div');
      TaskWindow.editButton_.className = "taskOverlayButton";
      TaskWindow.editButton_.innerHTML = '<img src="img/nav/edit.png"/>';
      TaskWindow.editButton_.onclick = TaskWindow.editClicked_;
      TaskWindow.overlay_.appendChild(TaskWindow.editButton_);
    }
    
    // TaskWindow.page_wrapper_ is the inner div surrounding the content
    TaskWindow.page_wrapper_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.page_wrapper_.className = "taskOverlayPage";
    TaskWindow.page_wrapper_.innerHTML = '';
    TaskWindow.page_wrapper_.style.display = "block";
    TaskWindow.overlay_.appendChild(TaskWindow.page_wrapper_);
    
    // This div contains the current page and the editor
    TaskWindow.page_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.page_.className = "taskOverlayEditorWrapper";
    TaskWindow.page_wrapper_.appendChild(TaskWindow.page_);

    // TaskWndow.nav_ ist the navigation bar at the bottom 
    TaskWindow.nav_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.nav_.className = "taskOverlayNav";
    TaskWindow.nav_.value = '';
    // TaskWindow.nav_.style.display = "none";
    TaskWindow.overlay_.appendChild(TaskWindow.nav_);    
    
    // Adding the button leading to the previous sketch
    TaskWindow.nav_.prevSketch_ = document.createElementNS(Blockly.HTML_NS, 'span');
    // TaskWindow.nav_.prevSketch_.innerHTML = "&#x23EE;";
    TaskWindow.nav_.prevSketch_.innerHTML = "<img src='img/nav/prevsketch.png'/>";
    TaskWindow.nav_.prevSketch_.onclick = TaskWindow.prevSketch_;
    TaskWindow.nav_.prevSketch_.className = "taskOverlayNavButton";
    TaskWindow.nav_.prevSketch_.title = _("gui.task_tooltip_prevsketch");
    TaskWindow.nav_.appendChild(TaskWindow.nav_.prevSketch_)        

    // TaskWindow.nav_.prev_ is the "to previous" arrow
    TaskWindow.nav_.prev_ = document.createElementNS(Blockly.HTML_NS, 'span');
    //TaskWindow.nav_.prev_.innerHTML = "&#x23F4;";
    TaskWindow.nav_.prev_.innerHTML = "<img src='img/nav/prev.png'/>";
    TaskWindow.nav_.prev_.className = "taskOverlayNavButton";
    TaskWindow.nav_.prev_.onclick = TaskWindow.prevPage_;
    TaskWindow.nav_.prev_.title = _("gui.task_tooltip_prev");
    TaskWindow.nav_.appendChild(TaskWindow.nav_.prev_);
    
    // TaskWindow.nav_reload_ is the reload button
    TaskWindow.nav_.reload_ = document.createElementNS(Blockly.HTML_NS, 'span');
    // TaskWindow.nav_.reload_.innerHTML = "&#x2B6F;";
    TaskWindow.nav_.reload_.innerHTML = "<img src='img/nav/reload.png'/>";
    TaskWindow.nav_.reload_.className = "taskOverlayNavButton";
    TaskWindow.nav_.reload_.onclick = TaskWindow.reload_;
    TaskWindow.nav_.reload_.title = _("gui.task_tooltip_reload");
    TaskWindow.nav_.appendChild(TaskWindow.nav_.reload_);

    // TaskWindow.nav_next_ is the "to next" arrow    
    TaskWindow.nav_.next_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.next_.innerHTML = "<img src='img/nav/next.png'/>";
    TaskWindow.nav_.next_.onclick = TaskWindow.nextPage_;
    TaskWindow.nav_.next_.className = "taskOverlayNavButton";
    TaskWindow.nav_.next_.title = _("gui.task_tooltip_next");
    TaskWindow.nav_.appendChild(TaskWindow.nav_.next_)

    // Adding the button leading to the next sketch
    TaskWindow.nav_.nextSketch_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.nextSketch_.innerHTML = "<img src='img/nav/nextsketch.png'/>";
    TaskWindow.nav_.nextSketch_.onclick = TaskWindow.nextSketch_;
    TaskWindow.nav_.nextSketch_.className = "taskOverlayNavButton";
    TaskWindow.nav_.nextSketch_.title = _("gui.task_tooltip_nextsketch");
    TaskWindow.nav_.appendChild(TaskWindow.nav_.nextSketch_)            

    // TaskWindow.nav_pageno_ is the number of the current page
    TaskWindow.nav_.pageno_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.pageno_.textContent = (TaskWindow.currentPage_ + 1) + " / " + TaskWindow.pages_.length;
    TaskWindow.nav_.pageno_.className = "taskOverlayNavPages";
    TaskWindow.nav_.appendChild(TaskWindow.nav_.pageno_);

    // TaskWindow.nav_.mainSketch_ leads to the main menu
    TaskWindow.nav_.mainSketch_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.mainSketch_.innerHTML = "<img src='img/nav/home.png'/>";
    TaskWindow.nav_.mainSketch_.onclick = TaskWindow.mainSketch_;
    TaskWindow.nav_.mainSketch_.className = "taskOverlayNavButton";
    TaskWindow.nav_.mainSketch_.title = _("gui.task_tooltip_main");
    TaskWindow.nav_.appendChild(TaskWindow.nav_.mainSketch_)        

    // TaskWindow.nav_.zoomOut_ leads to the main menu
    TaskWindow.nav_.zoomOut_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.zoomOut_.innerHTML = "<img src='img/nav/ominus.png'/>";
    TaskWindow.nav_.zoomOut_.onclick = TaskWindow.zoomOut_;
    TaskWindow.nav_.zoomOut_.className = "taskOverlayZoomButton";
    TaskWindow.nav_.zoomOut_.title = _("gui.task_tooltip_zoomout");
    TaskWindow.overlay_.appendChild(TaskWindow.nav_.zoomOut_);

    // TaskWindow.nav_.zoomIn_ leads to the main menu
    TaskWindow.nav_.zoomIn_ = document.createElementNS(Blockly.HTML_NS, 'span');
    TaskWindow.nav_.zoomIn_.innerHTML = "<img src='img/nav/oplus.png'/>";
    TaskWindow.nav_.zoomIn_.onclick = TaskWindow.zoomIn_;
    TaskWindow.nav_.zoomIn_.className = "taskOverlayZoomButton";
    TaskWindow.nav_.zoomIn_.title = _("gui.task_tooltip_zoomin");
    TaskWindow.overlay_.appendChild(TaskWindow.nav_.zoomIn_);        
    
    // TaskWindow.content_ is a container for the displayed content
    TaskWindow.content_ = document.createElementNS(Blockly.HTML_NS, 'pages');
    TaskWindow.content_.className = "taskOverlayContent";
    TaskWindow.content_.style.display = "none";

    TaskWindow.setContent('',true);

    TaskWindow.editing_ = false;    
    
    TaskWindow.updateNav_();
};


/**
 * Displays the TaskWindow
 */
TaskWindow.show = function() {
    if ( TaskWindow.isVisible() ) return;
    
    TaskWindow.setEditable((Configuration.getParameter("tasksEditable") == "true"));
    TaskWindow.overlay_.style.top = "60px";
    TaskWindow.overlay_.style.right = "20px";
    TaskWindow.overlay_.style.display = "block";
    TaskWindow.showContent(false);
    TaskWindow.setSize(TaskWindow.width,TaskWindow.height);
    document.getElementsByTagName("body")[0].appendChild(TaskWindow.overlay_);
    
    TaskWindow.onShow();
}

/**
 * Hides the TaskWindow
 */
TaskWindow.hide = function() {
    if ( !TaskWindow.isVisible() ) return;

    TaskWindow.overlay_.style.display = "none";
    TaskWindow.page_wrapper_.style.display = "block";
    TaskWindow.editing_ = false;
    if (document.getElementsByClassName("taskOverlay").length > 0) {
       document.getElementsByTagName("body")[0].removeChild(TaskWindow.overlay_);
    }
    
    TaskWindow.onHide();
}

/**
 * Switches to the editor perspective.
 */
TaskWindow.showEditor = function () {
    if ( !TaskWindow.editable ) return;
    // TaskWindow.nav_.style.display = "none";
    TaskWindow.editing_ = true;
    
    // Insert ckeditor
    if ( (TaskWindow.ckeditor == null) || (!TaskWindow.ckeditor) ) {
        TaskWindow.ckeditor = CKEDITOR.replace( TaskWindow.page_ );
        TaskWindow.ckeditor.on('instanceReady', TaskWindow.setEditorSize);
        // window.setTimeout( TaskWindow.setEditorSize, 100 );    
        TaskWindow.ckeditor.on('change', TaskWindow.editorChange_ );
    }
    
    TaskWindow.updateNav_();
}

// This is a workaround for seting the initial size of the editor.
// For some reason, resize does not work immediately after inserting the
// editor.
TaskWindow.setEditorSize = function() {
    if ( TaskWindow.ckeditor != null ) {
        var height = TaskWindow.page_wrapper_.offsetHeight - 10;
        if ( TaskWindow.nav_.style.display != "none" ) {
            height = height - TaskWindow.nav_.offsetHeight;
        }
            
        try { 
            TaskWindow.ckeditor.resize("100%",height,false);
        }
        catch (err) {
            window.setTimeout(TaskWindow.setEditorSize, 100);
        }
    }
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
       TaskWindow.storePageScript(TaskWindow.page_);
    }
   
    if ((TaskWindow.pages_.length > 1) || 
       ( (TaskWindow.mainSketch != "") || (TaskWindow.nextSketch != "") || (TaskWindow.prevSketch != ""))
        && ((TaskWindow.mainSketch != null) || (TaskWindow.nextSketch != null) || (TaskWindow.prevSketch != null)) ){
      TaskWindow.nav_.style.display = "block";
    } else {
      TaskWindow.nav_.style.display = "none";
    }

    TaskWindow.editing_ = false;
    
    TaskWindow.updateNav_();
};


/**
 * Checks if the TaskWindow is currently visible
 * 
 * @returns {Boolean} true is TaskWindow is vbisible, false otherwise.
 */
TaskWindow.isVisible = function () {
    return (TaskWindow.overlay_.style.display == "block");
};


/*****
 *****  Setting the whole task
 *****/ 

/**
 * Resets the content.
 * 
 * @returns {undefined}
 */
TaskWindow.resetContent = function() {
    TaskWindow.setContent("",true);
};


/**
 * Set the content of the TaskWindow. It is given as an HTML-string (not a
 * DOM). Setting flag to true resets the displayed page number to 0.
 * 
 * What happens during setContent:
 * 1) The old task is unloaded      => TaskWindow.unloadTask()
 * 2) The task script is retreived 
 * 3) The new task is loaded        => TaskWindow.loadTask()
 * 4) The pages are retreived
 * 5) The page is set               => TaskWindow.setPage_()
 * 
 * @param {type} html The HTML string
 * @param {type} reset If true, the displayed page is reset to page number 0
 */
TaskWindow.setContent = function(html, reset) {
    TaskWindow.unloadTask();

    // Create new dom
    var dom = document.createElementNS(Blockly.HTML_NS, 'pages');
    dom.innerHTML = html;

    // Reset the pages array
    TaskWindow.pages_ = new Array();
    if (reset) TaskWindow.currentPage_ = 0;

    // "Load" the new task
    TaskWindow.loadTask(dom);
    
    // Retreive all pages from dom
    TaskWindow.pages_ = new Array();
    var list = dom.getElementsByTagName('page');
    if ( list.length == 0 ) {
        // If no page is found, everything is one page
        TaskWindow.pages_.push(dom);
    } else {
      for ( var i = 0; i < list.length; i++ ) {
          TaskWindow.pages_.push(list[i]);
      }
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

    TaskWindow.updateNav_();
}



/**
 * Returns a html dom of the content
 * 
 * @param {document} The html document to which the html dom should be added.
 * @returns {undefined}
 */
TaskWindow.getHTML = function() {
    var task = document.createElement("task");
    
    task.textContent = TaskWindow.getContent();

    // Set window geometry
    task.setAttribute("width", TaskWindow.getWidth());
    task.setAttribute("height", TaskWindow.getHeight());

    // Set nav components
    if ( (TaskWindow.mainSketch != "") && (TaskWindow.mainSketch != null) )
        task.setAttribute("main", TaskWindow.mainSketch);
    if ( (TaskWindow.prevSketch != "") && (TaskWindow.prevSketch != null) )
        task.setAttribute("prev", TaskWindow.prevSketch);
    if ( (TaskWindow.nextSketch != "") && (TaskWindow.nextSketch != null) )
        task.setAttribute("next", TaskWindow.nextSketch);
    
    return task;
};


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

    // Add Taksscripts
    if ( this.taskScript_ ) {
        var script = document.createElementNS(Blockly.HTML_NS, 'taskscript');
        script.textContent = TaskWindow.taskScript_;
        TaskWindow.content_.appendChild(script);
    }
    
    // Add pages
    for ( i = 0; i < TaskWindow.pages_.length; i++) {
        var page = document.createElementNS(Blockly.HTML_NS, 'page');
        page.innerHTML = TaskWindow.pages_[i].innerHTML;
        TaskWindow.content_.appendChild(page);
    }

    return TaskWindow.content_.innerHTML;
}


/**
 *  Reteive the sources of all task scripts
 */
TaskWindow.getTaskScript = function() {
    return this.taskScript_;
}


/**
 * Set the task script
 */
TaskWindow.setTaskScript = function(script) {
    this.taskScript_ = script;
    
    // Execute the taskscript
    if ( TaskWindow.taskScript_ ) {
        var script= document.createElement("script");
        script.textContent = TaskWindow.taskScript_;
        document.getElementsByTagName("BODY")[0].appendChild(script);
        document.getElementsByTagName("BODY")[0].removeChild(script);
    }
}


/*****
 ***** Handling of pages
 *****/

/**
 * Sets the current displayed page.
 * 
 * @param {type} page The number of the page to be displayed.
 */
TaskWindow.setPage_ = function ( page, storePage ) {
    // If page is out of scope, do nothing
    if ((page >= TaskWindow.pages_.length) || (page < 0)) return;
    
    TaskWindow.updateNav_();
    
    // Show selected page
    if ( TaskWindow.editing_ ) {
      if ( TaskWindow.ckeditor != null ) {
        var content = TaskWindow.ckeditor.getData(false);
        TaskWindow.pages_[TaskWindow.currentPage_].innerHTML = content;
        TaskWindow.storePageScript(TaskWindow.pages_[TaskWindow.currentPage_]);
        TaskWindow.hidePage();
        TaskWindow.ckeditor.destroy();
        TaskWindow.ckeditor = null;
      }
      TaskWindow.currentPage_ = page;
      TaskWindow.page_.innerHTML = TaskWindow.pages_[TaskWindow.currentPage_].innerHTML;
      TaskWindow.nav_.pageno_.textContent = (TaskWindow.currentPage_ + 1) + " / " + TaskWindow.pages_.length;
      TaskWindow.showPage(TaskWindow.page_);

      TaskWindow.ckeditor = CKEDITOR.replace( TaskWindow.page_);
      TaskWindow.ckeditor.on('instanceReady', TaskWindow.setEditorSize);
   } else {
      // If storePage is set, store the old page
      if ( storePage ) {
         TaskWindow.pages_[TaskWindow.currentPage_].innerHTML =  TaskWindow.page_.innerHTML;
         TaskWindow.storePageScript(TaskWindow.pages_[TaskWindow.currentPage_]);
      }
      TaskWindow.hidePage(TaskWindow.pages_[TaskWindow.currentPage_]);
      TaskWindow.currentPage_ = page;
      TaskWindow.page_.innerHTML = TaskWindow.pages_[TaskWindow.currentPage_].innerHTML;
      TaskWindow.nav_.pageno_.textContent = (TaskWindow.currentPage_ + 1) + " / " + TaskWindow.pages_.length;
      TaskWindow.showPage(TaskWindow.page_);
    }

    TaskWindow.page_wrapper_.scrollTop = 0;
    TaskWindow.updateNav_();
}

/**
 * Skips to the prvious page if possible.
 */
TaskWindow.prevPage_ = function() {
    if (TaskWindow.currentPage_ > 0) {
        TaskWindow.setPage_(TaskWindow.currentPage_ - 1, true);
    }
   TaskWindow.updateNav_();
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
 * Skips to the prvious page if possible.
 */
TaskWindow.prevSketch_ = function() {
    if ( (TaskWindow.prevSketch != "") && (TaskWindow.prevSketch != null) ) {
        document.location = TaskWindow.prevSketch;
    }
}

/**
 * Skips to the next page if possible.
 */
TaskWindow.nextSketch_ = function() {
    if ( (TaskWindow.nextSketch != "") && (TaskWindow.nextSketch != null) ) {
        document.location = TaskWindow.nextSketch;
    }
}

/**
 * Skips to the main page if possible.
 */
TaskWindow.mainSketch_ = function() {
    if ( (TaskWindow.mainSketch != "") && (TaskWindow.mainSketch != null) ) {
        document.location = TaskWindow.mainSketch;
    }
}

/**
 * Skips to the main page if possible.
 */
TaskWindow.reload_ = function() {
    if ( confirm(_("gui.reset_sketch")) ) {
        Abbozza.clearStoredSketch(document.location.search.substring(1));
        Abbozza.reloadForced = true;
        document.location.reload();
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
   TaskWindow.updateNav_();
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
      if ( TaskWindow.currentPage_ >= TaskWindow.pages_.length ) {
          TaskWindow.currentPage_ = TaskWindow.pages_.length-1;
      }
      TaskWindow.setPage_(TaskWindow.currentPage_, false);
   }
   
   // Restart editor
   if ( TaskWindow.editing_ ) {
      TaskWindow.ckeditor = CKEDITOR.replace( TaskWindow.page_);       
      TaskWindow.ckeditor.on('instanceReady', TaskWindow.setEditorSize);
      // window.setTimeout( TaskWindow.setEditorSize, 100 );   
   }

    TaskWindow.updateNav_();
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

    TaskWindow.width = width;
    TaskWindow.height = height;

    // if ( !TaskWindow.isVisible() ) return;
    
    TaskWindow.width = (width > TaskWindow.minWidth) ? width : TaskWindow.minWidth;
    TaskWindow.height = (height > TaskWindow.minHeight) ? height : TaskWindow.minHeight;
                
    var wsHeight = document.querySelector("[id='workspace']").offsetHeight;
    var wsWidth = document.querySelector("[id='workspace']").offsetWidth;
    
    if ( wsHeight -100 < TaskWindow.height ) {
        TaskWindow.height = wsHeight - 100;
    }
    
    if ( wsWidth -100 < TaskWindow.width ) {
        TaskWindow.width = wsWidth - 100;
    }
    
    TaskWindow.overlay_.style.width = TaskWindow.width + "px";
    TaskWindow.overlay_.style.height = TaskWindow.height + "px";
}

/**
 * Returns the width of the TaskWindow.
 * 
 * @returns {document@call;createElementNS.offsetWidth|TaskWindow.overlay_.offsetWidth}
 *  The width
 */
TaskWindow.getWidth = function() {
    return TaskWindow.width;
}

/**
 * Returns the height of the TaskWindow.
 * @returns {document@call;createElementNS.offsetHeight|TaskWindow.overlay_.offsetHeight}
 *  The height
 */
TaskWindow.getHeight = function() {
    return TaskWindow.height;
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
    
    // var button = document.getElementById('toolButton');
    // button.classList("fadeout");
    
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
    if ( newLeft > Blockly.mainWorkspace.toolbox_.getWidth() ) {
      this.style.width = newWidth + "px";
      var width = this.offsetWidth - 23;
    
      TaskWindow.page_.style.width = width + "px";
      TaskWindow.width = width;
  }
    
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
        var maxRight = document.querySelector("[id='workspace']").offsetWidth;
        var newWidth = this.offsetWidth -4 + (oldRight - newRight);
        if ((newWidth > TaskWindow.minWidth) && (newRight < maxRight)) {
            this.style.width = "" + newWidth + "px"
            this.style.right = "" + newRight + "px"
            var width = this.offsetWidth - 23;
            TaskWindow.page_.style.width = width + "px";
            TaskWindow.width = width;
        }

    
}

/**
 * Handles the dragging for vertical resizing (bottom border)
 * 
 * @param {type} event
 */
TaskWindow.resizebottom_ = function(event) {
    var oldTop = this.offsetTop;
    var oldBottom = this.offsetTop + this.offsetHeight;
    var newBottom = event.clientY + window.pageYOffset;
    var maxBottom = document.querySelector("[id='workspace']").offsetHeight;
    var newHeight = this.offsetHeight - 3 + (newBottom - oldBottom);
    if ((newHeight > TaskWindow.minHeight) && ( newBottom < maxBottom )) {
        this.style.height = newHeight + "px";
        var height = newHeight - 64;
        // TaskWindow.page_wrapper_.style.height = height + "px";        
        TaskWindow.height = newHeight;
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
TaskWindow.editorChange_ = function() {
    if ( TaskWindow.ckeditor != null ) {
      var content = TaskWindow.ckeditor.getData(false);
      TaskWindow.pages_[TaskWindow.currentPage_].innerHTML = content;
    }
}


/**
 * Update the nav bar
 * 
 * @returns {undefined}
 */
TaskWindow.updateNav_ = function() {
    
    // TaskWindow.nav_.style.display = "none";

    if ( TaskWindow.editing_ == true ) {
        
        // Hide the sketch navigation
        TaskWindow.nav_.prevSketch_.style.display="none";        
        TaskWindow.nav_.nextSketch_.style.display="none";        
        TaskWindow.nav_.mainSketch_.style.display="none";
        TaskWindow.nav_.reload_.style.display="none";                
    } else {
        TaskWindow.nav_.prevSketch_.style.display="inline";        
        TaskWindow.nav_.nextSketch_.style.display="inline";        
        TaskWindow.nav_.mainSketch_.style.display="inline";
        TaskWindow.nav_.reload_.style.display="inline";                

        // TaskWindow.nav_.reload_.style.display="inline";
        TaskWindow.nav_.reload_.className = "taskOverlayNavButton";

        if ( (TaskWindow.prevSketch != null) && (TaskWindow.prevSketch != "")) {
            // TaskWindow.nav_.prevSketch_.style.display="inline";
            TaskWindow.nav_.prevSketch_.className = "taskOverlayNavButton";
            TaskWindow.nav_.style.display = "block";
        } else {
            // TaskWindow.nav_.prevSketch_.style.display="none";        
            TaskWindow.nav_.prevSketch_.className = "taskOverlayNavButtonDisabled";
        }
    
        if ( (TaskWindow.nextSketch != null) && (TaskWindow.nextSketch != "")) {
            // TaskWindow.nav_.nextSketch_.style.display="inline";
            TaskWindow.nav_.nextSketch_.className = "taskOverlayNavButton";
            // TaskWindow.nav_.style.display = "block";
        } else {
            // TaskWindow.nav_.nextSketch_.style.display="none";        
            TaskWindow.nav_.nextSketch_.className = "taskOverlayNavButtonDisabled";
        }
    
        if ( (TaskWindow.mainSketch != null) && (TaskWindow.mainSketch != "")) {
            // TaskWindow.nav_.mainSketch_.style.display="inline";
            TaskWindow.nav_.mainSketch_.className = "taskOverlayNavButton";
            TaskWindow.nav_.style.display = "block";
        } else {
            // TaskWindow.nav_.mainSketch_.style.display="none";
            TaskWindow.nav_.mainSketch_.className = "taskOverlayNavButtonDisabled";
        }    
    }
    
    // Toggle nav bar
    // if (TaskWindow.pages_.length > 1) {
      TaskWindow.nav_.style.display = "block";
      if (TaskWindow.currentPage_ > 0) {
        // TaskWindow.nav_.prev_.style.display = "inline";
        TaskWindow.nav_.prev_.className = "taskOverlayNavButton";
      } else {
        // TaskWindow.nav_.prev_.style.display = "none";          
        TaskWindow.nav_.prev_.className = "taskOverlayNavButtonDisabled";
      }
      if (TaskWindow.currentPage_ < TaskWindow.pages_.length -1 ) {
        // TaskWindow.nav_.next_.style.display = "inline";
        TaskWindow.nav_.next_.className = "taskOverlayNavButton";
      } else {
        // TaskWindow.nav_.next_.style.display = "none";          
        TaskWindow.nav_.next_.className = "taskOverlayNavButtonDisabled";
      }
      TaskWindow.nav_.pageno_.style.display = "inline";
    // TaskWindow.page_wrapper_.style.marginBottom = "32px";
    
}


TaskWindow.storePageScript = function(page) {
    // Remove all pagescript elements
    var scripts = page.getElementsByTagName("PAGESCRIPT");
    for ( var idx = 0; idx < scripts.length; idx++) {
        page.removeChild(scripts[idx]);
    }
    // Add a nw pagescript element
    if (TaskWindow.pageScript_) {
        var script = document.createElement("pagescript");
        script.textContent = TaskWindow.pageScript_;
        script.style.display = "none";
        page.insertBefore(script,page.firstChild);
    }
}


/**
 * Resets all hoooks of Task and Pand loads the new Taskscript
 * 
 * @returns {undefined}
 */
TaskWindow.loadTask = function(dom) {
    // Reset all hooks and execute the taskscript
    Task = {};
    Page = {};
    
    // Find the first TASKSCRIPT element
    var scripts = dom.getElementsByTagName("TASKSCRIPT");
    if ( scripts[0] ) {
        this.taskScript_ = scripts[0].textContent;
    } else {
        this.taskScript_ = null;    
    }

    // Execute the taskscript
    if ( TaskWindow.taskScript_ ) {
        var script= document.createElement("script");
        script.textContent = TaskWindow.taskScript_;
        document.getElementsByTagName("BODY")[0].appendChild(script);
        document.getElementsByTagName("BODY")[0].removeChild(script);
    }
      
    // Trigger the load handler if it is defined
    if (Task && Task.onLoad ) {
        Task.onLoad();
    }    
}

/**
 * Trigger the unload handler of the current Task
 * It does not trigger the onHide handlers!
 * 
 * @returns {undefined}
 */
TaskWindow.unloadTask = function() {
    // First Hide Page
    this.hidePage();
    
    // Trigger the unLoad handler if it is defined
    if (Task && Task.onUnload ) {
        Task.onUnload();
    }
    
    // Now reset the Task
    Task = {};
}

/**
 * This operation triggers the onHide of the current page!
 * 
 * @param {type} page
 * @returns {undefined}
 */
TaskWindow.showPage = function(page) {
    // Fetch and execute the pagescript
    Page = {};

    var scripts = page.getElementsByTagName("PAGESCRIPT");
    if ( scripts[0] ) {
        TaskWindow.setPageScript(scripts[0].textContent);
    } else {
        TaskWindow.setPageScript(null);
    }   
    
    if ( Page && Page.onShow ) {
        Page.onShow(page);
    }
}

/**
 * This operation triggers the onHide of the current page!
 * 
 * @param {type} page
 * @returns {undefined}
 */
TaskWindow.hidePage = function(page) {
    if ( Page && Page.onHide ) {
        Page.onHide(page);
    }}

/**
 * This operation is executed if the task window is show.
 * This does NOT affect the current page and task! Theit scripts remain
 * active and will not be triggered!
 * 
 * @param {type} page
 * @returns {undefined}
 */
TaskWindow.onShow = function(page) {
    if ( Task && Task.onShow ) {
        Task.onShow();
    }
}

/**
 * This operation is executed if the task window is hidden
 * This does NOT affect the current page and task! Their scripts
 * remain active and will not be triggered!
 * 
 * @param {type} page
 * @returns {undefined}
 */
TaskWindow.onHide = function(page) {
    if ( Task && Task.onHide ) {
        Task.onHide();
    }
}



TaskWindow.getPageScript = function() {
    return this.pageScript_;
}

TaskWindow.setPageScript = function(script) {
    this.pageScript_ = script;

    if ( TaskWindow.pageScript_ ) {
        var script= document.createElement("script");
        script.textContent = TaskWindow.pageScript_;
        document.getElementsByTagName("BODY")[0].appendChild(script);
        document.getElementsByTagName("BODY")[0].removeChild(script);
    }
}


/**
 * Increase zoom by 0.1
 */
TaskWindow.zoomIn_ = function() {
    var zoom = parseFloat(TaskWindow.page_.style.zoom);
    if ( isNaN(zoom) ) zoom = 1.0;
    zoom = zoom + 0.1;
    TaskWindow.page_.style.zoom = zoom;
}

/**
 * Decrease zoom by 0.1
 */
TaskWindow.zoomOut_ = function() {
    var zoom = parseFloat(TaskWindow.page_.style.zoom);
    if ( isNaN(zoom) ) zoom = 1.0;
    zoom = zoom - 0.1;
    TaskWindow.page_.style.zoom = zoom;    
}


/***
 **  DEPRECATED
 **/

TaskWindow.triggerOnLoad = function() {
    console.log("Call to deprecated TaskWindow.triggeroOnLoad()");
    TaskWindow.triggerOnLoad_(TaskWindow.page_.firstChild);
}



TaskWindow.triggerOnLoad_ = function(node) {
    while ( node != null ) {
        if ( node.nodeType == 1) {
            var event = new Event('load');
            node.dispatchEvent(event);
            if ( node.firstChild ) {
                TaskWindow.triggerOnLoad_(node.firstChild);
            }
        }
        node = node.nextSibling;
    }
}