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
 * @fileoverview Blocks for teachers
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

/**
 * A block providing an editable text instructions or hints
 */
Abbozza.TeacherText = {
  init: function() {
    this.setHelpUrl(Abbozza.HELP_URL);
    this.setColour(ColorMgr.getCatColor("cat.TEACHER"));
    this.appendDummyInput()
            .appendField(new Blockly.FieldLabel(_("gui.task")), "TEXT");
    this.setOutput(false);
    this.setTooltip('');
    // this.setCommentText("");
    this.setPreviousStatement(true,"COMMENT");
    this.setNextStatement(true,"COMMENT");
    Blockly.bindEvent_(this.svgGroup_,"dblclick",this,this.dblClicked_);
    this.textWin = null;
    this.text_ = "<p>Insert your text here!</p>"
    this.textWidth_ = 238;
    this.textHeight_ = 238;
  },
  
  generateCode : function(generator) {
  	return "";
  },
  
  dblClicked_ : function(event) {
    // If window is already open, do nothing
    if ( this.textWin != null ) return;
    // Otherwise open new window
    var coord = this.getRelativeToSurfaceXY();
    this.textWin = new InternalWindow(Blockly.mainWorkspace,
            this, this.getFieldValue("TEXT"), "abbozzaVarWin", coord.x + this.width/2, coord.y,
            this.textWidth_,this.textHeight_,true, function() {
                this.block.setFieldValue(this.head_.textContent,"TEXT");              
                this.block.textWidth_ = this.foreignObject_.getAttribute("width");
                this.block.textHeight_ = this.foreignObject_.getAttribute("height");
                this.block.text_ = this.textarea_.innerHTML;
                this.block.textWin = null;
            });
    this.textWin.setText(this.text_);
    event.stopPropagation();
  },
  
  mutationToDom : function() {
      // Write title, text and size
      var mutation = document.createElement('mutation');
      var child = document.createElement('title');
      child.textContent = this.getFieldValue("TEXT");
      mutation.appendChild(child);
      child = document.createElement('text');
      child.textContent = this.text_;
      mutation.appendChild(child);
      child = document.createElement('size');
      child.setAttribute("width",this.textWidth_);
      child.setAttribute("height",this.textHeight_);
      mutation.appendChild(child);
      return mutation;
  },
  

    domToMutation: function(xmlElement) {
        var child;
        for (var i = 0; i < xmlElement.childNodes.length; i++) {
            child = xmlElement.childNodes[i];
            // Abbozza.log(child);
            if (child.tagName == 'title') {
                this.setFieldValue(child.textContent,"TEXT");
            } else if (child.tagName == "text") {
               this.text_ = child.textContent;
            } else if (child.tagName == "size") {
                this.textWidth_ = child.getAttribute("width");
                this.textHeight_ = child.getAttribute("height");
            }
        }
    },
    
    dispose : function(healStack, animate,opt_dontRemoveFromWorkspace) {
        if (this.textWin != null ) {
            this.textWin.close();
        }
        Blockly.BlockSvg.prototype.dispose.call(this,healStack, animate,opt_dontRemoveFromWorkspace);
    }

};

Blockly.Blocks['teacher_text'] = Abbozza.TeacherText;

