/* global Abbozza, HTMLElement */

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

var abbozzaHintProto = Object.create(HTMLElement.prototype);

/**
 * 
 * @returns {undefined}
 */
abbozzaHintProto.attachedCallback = function() {
    // if ( this.className == "cke_widget_element" ) return;
    // console.log(this);
    
    // Ignore widget element
    // if ( this.className == "cke_widget_element") return;
    
    
    this.block_ = null;
    this.icon_ = null;
    this.element_ = null;
    this.bubble_ = null;

    if (this.hasAttribute("block")) {
        // If a block id is given
        var block = [];
        var blockid = this.hasAttribute("block") ? this.getAttribute("block") : null;
        if (blockid != null) {
            block = Abbozza.getBlocksById(blockid);
        } else {
            block.push(null);
        }
        this.block_ = block[0];
        if (this.block_ != null) {
            var width = this.hasAttribute("width") ? Abbozza.toPx(this.getAttribute("width"),document.body) : 100;
            var height = this.hasAttribute("height") ? Abbozza.toPx(this.getAttribute("height"),document.body) : 50;
            var dx = this.hasAttribute("dx") ? Number(this.getAttribute("dx")) : 0;
            var dy = this.hasAttribute("dy") ? Number(this.getAttribute("dy")) : 0;
            
            this.icon_ = this.block_.warning;
            if ( (this.icon_ != null) && (this.icon_.isIcon == 'undefined') ) {
                return;
            }
            
            if ( this.icon_ == null ) {            
               this.icon_ = new TaskHintIcon(this.block_,this.innerHTML,width,height,dx,dy);
               this.icon_.setBubbleShift(dx,dy);
               this.icon_.addHint(this);
           } else {
               this.icon_.setText(this.innerHTML);
               this.icon_.setGeometry(dx,dy,width,height);
               this.icon_.addHint(this);
           }
        }
    } else if (this.hasAttribute("anchor")) {
        var id = this.getAttribute("anchor");
        // this.element_ = document.getElementById(id);
        this.element_ = document.querySelector("[id='" + id + "']");
        if ( this.element_ != null ) {
            var metrics = Blockly.mainWorkspace.getMetrics();
            var dx = this.hasAttribute("dx") ? Number(this.getAttribute("dx")) : 0;
            var dy = this.hasAttribute("dy") ? Number(this.getAttribute("dy")) : 0;
            var x = this.element_.offsetLeft - metrics.absoluteLeft + this.element_.offsetWidth/2;
            var y = this.element_.offsetTop - metrics.absoluteTop +  this.element_.offsetHeight/2;
            var width = this.hasAttribute("width") ? Abbozza.toPx(this.getAttribute("width"),document.body) : 100;
            var height = this.hasAttribute("height") ? Abbozza.toPx(this.getAttribute("height"),document.body) : 50;
            // this.bubble_ = new AbbozzaBubble(Blockly.mainWorkspace, this.textContent ,null,"taskHint",{ 'x': x ,'y': y},width,height,dx,dy);
            // // this.bubble_.setText(this.textContent);
            // // this.bubble_.setBubbleSize(width,height);
            // this.bubble_.layoutBubble_();
            // // this.bubble_.setShift(dx,dy);
            // this.bubble_.setColour("#909090");
            // this.bubble_.render();
        }
    } else {
        var x = this.hasAttribute("x") ? Number(this.getAttribute("x")) : 0;
        var y = this.hasAttribute("y") ? Number(this.getAttribute("y")) : 0;
        var width = this.hasAttribute("width") ? Abbozza.toPx(this.getAttribute("width"),document.body) : 100;
        var height = this.hasAttribute("height") ? Abbozza.toPx(this.getAttribute("height"),document.body) : 50;
        // this.bubble_ = new AbbozzaBubble(Blockly.mainWorkspace, null,null,"taskHint",x,y,width,height,0,0);
        // this.bubble_.hideArrow();
        // // this.bubble_.setBubbleSize(width,height);
        // this.bubble_.layoutBubble_();        
        // this.bubble_.setColour("#909090");
    }
};

/**
 * 
 * @returns {undefined}
 */
abbozzaHintProto.detachedCallback = function() {
    if (this.icon_) {
        
        this.icon_.removeHint(this);
        
        if ( this.icon_.hints_.length == 0 ) {
            var dx = this.icon_.bubble_.relativeLeft_;
            var dy = this.icon_.bubble_.relativeTop_;
            this.setAttribute("dx",dx);
            this.setAttribute("dy",dy);
            this.icon_.setVisible(false);
            if (this.block_.warning == this.icon_) this.block_.warning = null;
            this.icon_.dispose();
            this.block_.render();
            this.block_.bumpNeighbours_();
        }
        
    } else if (this.bubble_) {
        this.bubble_.dispose();
    }
    this.block_ = null;
    this.icon_ = null;
    this.element_ = null;
    this.bubble_ = null;
};

/**
 * 
 * @type HTMLDocument.registerElement|@pro;document@pro;registerElement|Node.registerElement|Document.registerElement
 */
var abbozzaHint = document.registerElement('abbozza-hint', {
    prototype: abbozzaHintProto
});

/**
 * 
 * @param {type} icon
 * @returns {undefined}
 */
abbozzaHintProto.iconResized = function(icon) {
    if ( this.icon_ == icon ) {
        var dx = icon.shiftX_;
        var dy = icon.shiftY_;
        var width = icon.width_;
        var height = icon.height_;
        this.setAttribute("dx",dx);
        this.setAttribute("dy",dy);
        this.setAttribute("width",width);
        this.setAttribute("height",height);
    }
};
