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
 * @fileoverview A dropdown menu for the pins.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

'use strict';

goog.provide('PinDropdown');


goog.require('Blockly.Field');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.userAgent');
goog.require('goog.ui');
goog.require('goog.ui.Popup');
goog.require('goog.ui.Menu');
goog.require('Blockly.ContextMenu');


PinDropdown = function(opt_type) {
        this.prefix = null;
        if (!opt_type) 
            this.type = PinDropdown.CHECK;
        else 
            this.type = opt_type;

	PinDropdown.superClass_.constructor.call(this, this.getMenu, this.handleChange);
        this.directMenu = false;
        this.setText("???");
        this.setValue("???");
};
goog.inherits(PinDropdown, Blockly.FieldDropdown);


PinDropdown.ALL = 0;
PinDropdown.DIGITAL = 1;
PinDropdown.PWM = 2;
PinDropdown.ANALOG = 3;
PinDropdown.INTERRUPT = 4;
PinDropdown.CHECK = 5;
PinDropdown.TOUCH = 6;

PinDropdown.currentField = null;

PinDropdown.handler = function (text, value) {
    PinDropdown.currentField.prefix = null;
    PinDropdown.currentField.setValue(value);
    PinDropdown.currentField.setText(text);
}


PinDropdown.prototype.getMenu = function() {
    
    // Determine the type of pin menu
    var type = this.type;
    if ( type == PinDropdown.CHECK ) {
       type = PinDropdown.ALL;
       if ( this.sourceBlock_ != null ) {
           if ( (this.sourceBlock_.outputConnection != null) && (this.sourceBlock_.outputConnection.targetConnection != null) ) {
               var parent = this.sourceBlock_.outputConnection.targetConnection;
               var check = parent.check_;
               var pintype = "PIN_ALL";
               if ( check && check.length > 0 ) {
                   pintype = check[check.length-1];
               }
               if ( pintype == "PIN_DIGITAL" ) {
                    type = PinDropdown.DIGITAL;
               } else if ( pintype == "PIN_ANALOG" ) {
                    type = PinDropdown.ANALOG;
               } else if ( pintype == "PIN_PWM" ) {
                    type = PinDropdown.PWM;
               } else {
                    type = PinDropdown.ALL;
               }
           }
       }  
    }
    
    // fetch the menu
    var menu = Board.getPinMenu(type);
    
    return menu;
}

PinDropdown.prototype.handleChange = function(selection) {
        
    var result;
    var pins = Board.digitalPins;
    var pwm = Board.pwm;
    var analog = Board.analogIn;
    
    if ( selection.startsWith("pref.") ) {

        this.prefix = selection.split(".")[1];
        var menu = [];
        if ( this.prefix.startsWith("A") ) {
            var no = this.prefix.charAt(1);
            var start = 10*no;
            var end = start+10;
            if ( analog < end ) {
                end = analog;
            }
            var options = [];
            PinDropdown.currentField = this;
            for (var i = start; i < end; i++ ) {
                var option = new Object();
                option.enabled = true;
                option.text = new String("A"+i);
                option.callback = new Function ( "PinDropdown.handler('A" + i + "','A"+i+"');" );
                options.push(option);
            }
        } else if ( this.prefix == "PWM" ) {
            var options = [];
            PinDropdown.currentField = this;
            for ( var i = 0; i < pwm.length; i++) {
                var option = new Object();
                option.enabled = true;
                option.text = new String(""+pwm[i]+"~");
                option.callback = new Function ( "PinDropdown.handler('" + pwm[i] + "~','"+pwm[i]+"');" );
                options.push(option);                
            }
        } else { 
            var start = 10*this.prefix;
            var end = start+10;
            if ( pins < end ) {
                end = pins;
            }
            var options = [];
            PinDropdown.currentField = this;
            for (var i = start; i < end; i++ ) {
                var tilde = "";
                if ( Board._isPWM(i) ) {
                   tilde = "~";
                }
                var option = new Object();
                option.enabled = true;
                option.text = new String(""+i + tilde);
                option.callback = new Function ( "PinDropdown.handler('" + i + tilde + "','"+i+"');" );
                options.push(option);
            }
        }
        // Construct the menu for the second digit
        Blockly.ContextMenu.currentBlock == this;
        this.prefix = null;
        // var event = new Event("click");
        var event = document.createEvent("Event");
        event.initEvent("click",true,true);
        event.clientX=this.sourceBlock_.dragStartXY_.x - this.sourceBlock_.workspace.dragDeltaXY_.x;
        event.clientY=this.sourceBlock_.dragStartXY_.y - this.sourceBlock_.workspace.dragDeltaXY_.y;
        Blockly.ContextMenu.show(event,options,this.RTL);
    } else {
        return selection;
    }
    return null;
}


