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
 * SYSTEM SPECIFIC
 */

TaskWindow.init = function() {
    TaskWindow.frame = new Frame("Aufgabe",null,false,"task");
  
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

TaskWindow.isVisible = function() { TaskWindow.frame.isVisible(); };

TaskWindow.setSize = function(width,height) { TaskWindow.frame.setSize(width,height); };
TaskWindow.setPosition = function(x,y) { TaskWindow.frame.setPosition(x,y); };

TaskWindow.getWidth = function() {
    return TaskWindow.frame.div.offsetWidth;
}

TaskWindow.getHeight = function() {
    return TaskWindow.frame.div.offsetHeight;
}

TaskWindow.setEditable  = function(editable) {};

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
            TaskWindow.nav_nextSketch.className = "taskFrameNavButton";
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


TaskWindow.setEditorSize = function() {
    if ( TaskWindow.ckeditor != null ) {
        var height = TaskWindow.page_wrapper_.offsetHeight;
        TaskWindow.ckeditor.resize("100%",height,false);
    }
}

TaskWindow.resize = function(event) {
    var w = TaskWindow.page_wrapper_.offsetWidth;
    var h = TaskWindow.page_wrapper_.offsetHeight;
    
    if ( TaskWindow.ckeditor != null ) {
        TaskWindow.ckeditor.resize(w,h,false);
    }
}


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
