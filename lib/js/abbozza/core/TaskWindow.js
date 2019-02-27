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

TaskWindow.init = function() {
    TaskWindow.frame = new Frame(_("gui.task"),null,false,"task");
  
    var content = TaskWindow.frame.content;

    TaskWindow.page_wrapper_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.page_wrapper_.className = "taskFrameWrapper";
    TaskWindow.page_wrapper_.innerHTML = '';
    TaskWindow.page_wrapper_.style.display = "block";
    content.appendChild(TaskWindow.page_wrapper_);
    
    // This div contains the current page and the editor
    TaskWindow.page_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.page_.className = "taskOverlayEditorWrapper";
    TaskWindow.page_wrapper_.appendChild(TaskWindow.page_);


    TaskWindow.nav_ = document.createElementNS(Blockly.HTML_NS, 'div');
    TaskWindow.nav_.className = "taskFrameNav";
    TaskWindow.nav_.value = '';

    TaskWindow.nav_prevSketch = document.createElement("SPAN");
    TaskWindow.nav_prevSketch.innerHTML = "<svg viewBox='0 0 20 20'><path stroke-width='1' stroke='black' fill='black' d='M18,2 l-8,8 l8,8 l0,-16 M10,2 l-8,8 l8,8 l0,-16'></svg>";
    TaskWindow.nav_prevSketch.onclick = TaskWindow.prevSketch_;
    TaskWindow.nav_prevSketch.className = "taskFrameNavButton";
    TaskWindow.nav_prevSketch.title = _("gui.task_tooltip_prevsketch");
    TaskWindow.nav_.appendChild(TaskWindow.nav_prevSketch);        
    
    TaskWindow.nav_prev = document.createElementNS(Blockly.HTML_NS,'span');
    TaskWindow.nav_prev.innerHTML = "<svg viewBox='0 0 20 20'><path stroke-width='1' stroke='black' fill='black' d='M18,2 l-16,8 l16,8 l0,-16'></svg>";
    TaskWindow.nav_prev.className = "taskFrameNavButton";
    TaskWindow.nav_prev.onclick = TaskWindow.prevPage_;
    TaskWindow.nav_prev.title = _("gui.task_tooltip_prev");
    TaskWindow.nav_.appendChild(TaskWindow.nav_prev);
    
    TaskWindow.nav_.pageno_ = document.createElementNS(Blockly.HTML_NS, 'SPAN');
    TaskWindow.nav_.appendChild(TaskWindow.nav_.pageno_);
    TaskWindow.nav_.pageno_.className = "taskFrameNavPage";
    TaskWindow.nav_.appendChild(TaskWindow.nav_.pageno_);

    TaskWindow.nav_next = document.createElementNS(Blockly.HTML_NS,'span');
    TaskWindow.nav_next.innerHTML = "<svg viewBox='0 0 20 20'><path stroke-width='1' stroke='black' fill='black' d='M2,2 l16,8 l-16,8 l0,-16'></svg>";
    TaskWindow.nav_next.className = "taskFrameNavButton";
    TaskWindow.nav_next.onclick = TaskWindow.nextPage_;
    TaskWindow.nav_next.title = _("gui.task_tooltip_next");
    TaskWindow.nav_.appendChild(TaskWindow.nav_next);
 
    TaskWindow.nav_nextSketch = document.createElement("SPAN");
    TaskWindow.nav_nextSketch.innerHTML = "<svg viewBox='0 0 20 20'><path stroke-width='1' stroke='black' fill='black' d='M2,2 l8,8 l-8,8 l0,-16 M11,2 l8,8 l-8,8 l0,-16'></svg>";
    TaskWindow.nav_nextSketch.onclick = TaskWindow.nextSketch_;
    TaskWindow.nav_nextSketch.className = "taskFrameNavButton";
    TaskWindow.nav_nextSketch.title = _("gui.task_tooltip_nextsketch");
    TaskWindow.nav_.appendChild(TaskWindow.nav_nextSketch);        

    TaskWindow.nav_reload = TaskWindow.frame.addTitleButton(
            "<svg viewBox='0 0 20 20'><path d='M15.65 4.35A8 8 0 1 0 17.4 13h-2.22a6 6 0 1 1-1-7.22L11 9h7V2z'/></svg>", 
            TaskWindow.reload_
    );
    TaskWindow.nav_mainSketch = TaskWindow.frame.addTitleButton(
            "<svg viewBox='0 0 20 20'><path stroke-width='1' stroke='black' fill='none' d='M0,10 L10,2 L20,10 M2,8 l0,10 l6,0 l0,-8 l4,0 l0,8 l6,0 l0,-10'/></svg>", 
            TaskWindow.mainSketch_
    );

    TaskWindow.frame.addTitleButton("<svg viewBox='0 0 20 20'><path stroke-width='1' stroke='black' fill='none' d='M4,1 l4,0 l0,4 l-3,3 l-4,0 l0,-4 l3,-3 M8,1 l9,9 l2,9 l-9,-2 l-9,-9 M8,5 l9,9 M5,8 l9,9 M17,13 l0,1 l-3,3 l-1,0'/><circle cx='4.5' cy='4.5' r='1.5'/></svg>", TaskWindow.editClicked_);
    TaskWindow.frame.div.addEventListener("frame_resize", TaskWindow.resize );
    
    TaskWindow.frame.div.addEventListener("frame_resize", TaskWindow.resize );

    content.appendChild(TaskWindow.nav_);

    TaskWindow.setContent('',true);

    TaskWindow.editing_ = false;    
    
    TaskWindow.updateNav_();

    TaskWindow.frame.onShow = function() {
        TaskWindow.onShow(TaskWindow.page_);        
    };
    
    TaskWindow.frame.onHide = function() {
        TaskWindow.onHide(TaskWindow.page_);        
    };

    TaskWindow.frame.setPosition(0,"50%");
    
};

TaskWindow.show = function() { TaskWindow.frame.show(); };

TaskWindow.hide = function() { TaskWindow.frame.hide(); };


/**
 * Switches to the editor perspective.
 */
TaskWindow.showEditor = function () {
    if ( !TaskWindow.editable ) return;
    TaskWindow.editing_ = true;
    
    // Insert ckeditor
    if ( (TaskWindow.ckeditor == null) || (!TaskWindow.ckeditor) ) {
        TaskWindow.ckeditor = CKEDITOR.replace( TaskWindow.page_ ,{
            resize_enabled: false,
            height: "100%",
            width: "100%"
        });
        TaskWindow.ckeditor.on('instanceReady', TaskWindow.setEditorSize);
        TaskWindow.ckeditor.on('change', TaskWindow.editorChange_ );
    }
    
    TaskWindow.updateNav_();
}


TaskWindow.setEditorSize = function() {
    if ( TaskWindow.ckeditor != null ) {
        var height = TaskWindow.page_wrapper_.offsetHeight;
        TaskWindow.ckeditor.resize("100%",height,false);
    }
}


/*
 * Switches to the content perspective
 */
TaskWindow.showContent = function(getContentFromEditor) {   
    if ( TaskWindow.ckeditor != null ) {
       TaskWindow.ckeditor.destroy();
       TaskWindow.ckeditor = null;
       TaskWindow.storePageScript(TaskWindow.page_);
    }
   
   /*
    if ((TaskWindow.pages_.length > 1) || 
       ( (TaskWindow.mainSketch != "") || (TaskWindow.nextSketch != "") || (TaskWindow.prevSketch != ""))
        && ((TaskWindow.mainSketch != null) || (TaskWindow.nextSketch != null) || (TaskWindow.prevSketch != null)) ){
      TaskWindow.nav_.style.display = "block";
    } else {
      TaskWindow.nav_.style.display = "none";
    }
    */
   
    TaskWindow.editing_ = false;
    
    TaskWindow.updateNav_();
};


/**
 * Checks if the TaskWindow is currently visible
 * 
 * @returns {Boolean} true is TaskWindow is vbisible, false otherwise.
 */
TaskWindow.isVisible = function() { TaskWindow.frame.isVisible(); };


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

TaskWindow.resize = function(event) {
    var w = TaskWindow.page_wrapper_.offsetWidth;
    var h = TaskWindow.page_wrapper_.offsetHeight;
    
    if ( TaskWindow.ckeditor != null ) {
        TaskWindow.ckeditor.resize(w,h,false);
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


TaskWindow.setSize = function(width,height) { TaskWindow.frame.setSize(width,height); };
TaskWindow.setPosition = function(x,y) { TaskWindow.frame.setPosition(x,y); };

TaskWindow.getWidth = function() {
    return TaskWindow.frame.div.offsetWidth;
}

TaskWindow.getHeight = function() {
    return TaskWindow.frame.div.offsetHeight;
}

TaskWindow.setEditable  = function(editable) {};


TaskWindow.closeClicked_ = function(event) {
    if ( !TaskWindow.closable ) return;
    if (TaskWindow.editing_) {
        TaskWindow.showContent(true);
    }
    TaskWindow.hide();
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

TaskWindow.updateNav_ = function() {
    if ( TaskWindow.editing_ == true ) {
        // Hide the sketch navigation
        TaskWindow.nav_prevSketch.style.display="none";        
        TaskWindow.nav_nextSketch.style.display="none";        
        // TaskWindow.nav_mainSketch.style.display="none";
        // TaskWindow.nav_reload_.style.display="none";                
    } else {
        TaskWindow.nav_prevSketch.style.display="inline";        
        TaskWindow.nav_nextSketch.style.display="inline";        
        // TaskWindow.nav_mainSketch_.style.display="inline";
        // TaskWindow.nav_reload_.style.display="inline";                

        // TaskWindow.nav_reload_.className = "taskOverlayNavButton";

        if ( (TaskWindow.prevSketch != null) && (TaskWindow.prevSketch != "")) {
            // TaskWindow.nav_.prevSketch_.style.display="inline";
            TaskWindow.nav_prevSketch.className = "taskFrameNavButton";
        } else {
            // TaskWindow.nav_.prevSketch_.style.display="none";        
            TaskWindow.nav_prevSketch.className = "taskFrameNavButtonDisabled";
        }
    
        if ( (TaskWindow.nextSketch != null) && (TaskWindow.nextSketch != "")) {
            TaskWindow.nav_nextSketch_className = "taskFrameNavButton";
        } else {
            TaskWindow.nav_nextSketch.className = "taskFrameNavButtonDisabled";
        }
    
        if ( (TaskWindow.mainSketch != null) && (TaskWindow.mainSketch != "")) {
            // TaskWindow.nav_mainSketch.className = "taskFrameNavButton";
        } else {
            // TaskWindow.nav_mainSketch.className = "taskFrameNavButtonDisabled";
        }    
    }
    
    // Toggle nav bar
    // if (TaskWindow.pages_.length > 1) {
      if (TaskWindow.currentPage_ > 0) {
        TaskWindow.nav_prev.className = "taskFrameNavButton";
      } else {
        TaskWindow.nav_prev.className = "taskFrameNavButtonDisabled";
      }
      if (TaskWindow.currentPage_ < TaskWindow.pages_.length -1 ) {
        TaskWindow.nav_next.className = "taskFrameNavButton";
      } else {
        TaskWindow.nav_next.className = "taskFrameNavButtonDisabled";
      }
};


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