/**
 * @license
 * abbozza!
 *
 * File: Boards.js
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
 * 
 * SYSTEM SPECIFIC
 */

/**
 * @fileoverview A singleton object managing the parameters of the current board.
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

Board = {
    boardsXML: null,
    description: "Arduino Uno (default)",
    boardId: "uno",
    analogIn: 6,
    analogOut: 0,
    digitalPins: 14,
    pwm: [3, 5, 6, 9, 10, 11],
    internalLED: 13,
    interrupts: [3, 2],
    serialRX: [0],
    serialTX: [1]

};

Board.init = function (systemPrefix) {
    this.boardsXML = null;
    this._reset();

    Connection.getXMLSynced("/js/abbozza/" + systemPrefix + "/boards.xml",
            function (xml) {
                Board.boardsXML = xml;
            },
            function (xml) {
            }
    );
};

Board.ANY_PIN = 0;
Board.PWM_PIN = 1;
Board.ANALOG_PIN = 2;


Board.load = function (query) {
    if ( query == false ) {
        Connection.getText("/abbozza/board",
            function (response) {
                var val = response.split("|");
                Abbozza.showInfoMessage(_("msg.board_found",[val[1],[2]]));
                Board._apply(response.split("|")[0]);
                document.getElementById("connect").style.backgroundColor = "#00d000";
            },
            function (response) {
                Abbozza.showInfoMessage(_("msg.no_board"));
                Board._apply(response.split("|")[0]);                    
                document.getElementById("connect").style.backgroundColor = "#d00000";
            }
        );
    } else {
        Connection.getText("/abbozza/queryboard",
            function (response) {
                var val = response.split("|");
                Abbozza.showInfoMessage(_("msg.board_found",[val[1],[2]]));
                Board._apply(response.split("|")[0]);
                document.getElementById("connect").style.backgroundColor = "#00d000";
            },
            function (response) {
                Abbozza.showInfoMessage(_("msg.no_board"));
                Board._apply(response.split("|")[0]);
                document.getElementById("connect").style.backgroundColor = "#d00000";
            }
        );
        
    }
}


Board._apply = function (id) {
    if (this.boardsXML == null) {
        this._reset();
        return;
    }

    // var board = this.boardsXML.getElementById(id);
    var board = this.boardsXML.querySelector("[id='" + id + "']");
    this.description = board.getElementsByTagName("name")[0].textContent;
    this.boardId = board.getAttribute("id");
    var pins = board.getElementsByTagName("pins")[0];
    this.analogIn = pins.getAttribute("analogin");
    this.analogOut = pins.getAttribute("analogout");
    this.digitalPins = pins.getAttribute("digital");
    this.internalLED = pins.getAttribute("led");
    this.pwm = board.getElementsByTagName("pwm")[0].textContent.split(",");
    this.interrupts = board.getElementsByTagName("interrupts")[0].textContent.split(",");
    this.serialRX = board.getElementsByTagName("interrupts")[0].textContent.split(",");
    this.serialTX = board.getElementsByTagName("interrupts")[0].textContent.split(",");
}

Board._reset = function () {
    this.description = "Arduino Uno (default)";
    this.boardId = "uno";
    this.analogIn = 6;
    this.analogOut = 0;
    this.digitalPins = 14;
    this.pwm = [3, 5, 6, 9, 10, 11];
    this.internalLED = 13;
    this.interrupts = [3, 2];
    this.serialRX = [0];
    this.serialTX = [1];
}


Board._isPWM = function(pin) {
    var result = false;
    var i = 0;
    while ( (result==false) && (i < this.pwm.length) ) {
        result = ( this.pwm[i] == pin );
        i=i+1;
    }
    return result;
}


Board.getPinMenu = function(type) {
    var menu = [];
    var pins = Board.digitalPins;
    var pwm = Board.pwm;
    var analog = Board.analogIn;
    
    var count = 0;
    if ((type == PinDropdown.ALL) || (type == PinDropdown.DIGITAL)) count = count + pins;
    if ((type == PinDropdown.PWM)) count = count + pwm.length;
    if ((type == PinDropdown.ALL) || (type == PinDropdown.ANALOG)) count = count + analog;
    if (type == PinDropdown.INTERRUPT) count = Board.interrupts.length;
    
    if ( count <= 10 ) {
        this.directMenu = true;
        switch ( type ) {
            case PinDropdown.ALL :
                menu = Board.getAllPinMenu();
                break;
            case PinDropdown.DIGITAL :
                menu = Board.getDigitalPinMenu();
                break;
            case PinDropdown.PWM :
                menu = Board.getPWMPinMenu();
                break;
            case PinDropdown.ANALOG :
                menu = Board.getAnalogPinMenu();
                break;
            case PinDropdown.INTERRUPT :
                menu = Board.getInterruptPinMenu();
                break;
            default:
                menu = Board.getAllPinMenu();
        }
        return menu;
    }
    
    this.directMenu = false;
    if ( this.prefix == null ) {
        // Construct menu for the first digits
        if ((type == PinDropdown.ALL) || (type == PinDropdown.DIGITAL)) {
            var dig = pins/10;
            for ( var i = 0; i < dig; i++) {
                var max = (i*10+9) < pins ? i*10+9 : pins-1;
                menu.push([ "" + (i * 10) + " ... " + max,"pref."+i]);
            }
        }
        if ( (pwm.length > 0) && ((type == PinDropdown.ALL) || (type == PinDropdown.PWM))) {
            menu.push(["PWM","pref.PWM"]);
        }
        if ((type == PinDropdown.ALL) || (type == PinDropdown.ANALOG)) {
            dig = analog/10;
            for ( i = 0; i < dig; i++) {
                var max = (i*10+9) < analog ? i*10+9 : analog-1;
                menu.push(["A"+(i*10)+" ... A" + max,"pref.A"+i]);
            }
        }
    }
    return menu;
}


Board.getAllPinMenu = function() {
   return this.getDigitalPinMenu();    
}


Board.getDigitalPinMenu = function () {
    var pins = [];
    for (var i = 0; i < this.digitalPins; i++) {
        if (this._isPWM(i)) {
            pins.push(["" + i + "~", "" + i]);
        } else {
            pins.push(["" + i, "" + i]);
        }
    }
    for (i = 0; i < this.analogIn; i++) {
        pins.push(["A" + i, "A" + i]);
    }

    return pins;
};


Board.getInterruptPinMenu = function() {
    var pins = [];
    for (i = 0; i < this.interrupts.length ; i++) {
        pins.push(["" + this.interrupts[i], "" + this.interrupts[i]]);
    }
    return pins;    
};

Board.getAnalogPinMenu = function () {
    var pins = [];
    for (i = 0; i < this.analogIn; i++) {
        pins.push(["A" + i, "A" + i]);
    }
   
    if (pins.length == 0) {
        pins.push([_("err.ILLEGAL_ANALOG_PIN"),"<illegalanalogpin>"]);
    }
    return pins;
};

Board.getPWMPinMenu = function () {
    var pins = [];
    for (i = 0; i < this.pwm.length; i++) {
        pins.push(["" + this.pwm[i] + "~", "" + this.pwm[i]]);
    }
    return pins;
};


/**
 * This operation returns the code for reading a digital pin using the register.
 * 
 * @param {type} pin the pin to be read
 * @returns {undefined} The code or null, if the pin is illegal (no digital pin)
 */
Board.getDigitalReadCodeByRegister = function(pin) {
    var register = "";
    var shift = 0;
    if ( (this.board == null) || ( (this.boardId != "mega") && (this.boardId != "megaADK") && (this.boardID != "atmegang" ))) {
        // If the board is not a Mega
        if ( (pin >= 0) && (pin <= 7) ) {
            register ="PIND";
            shift = pin;
        } else if ((pin >= 8) && (pin <= 13)) {
            register = "PINB";
            shift = pin-8;
        } else {
            return null;
        }
    } else {
        switch (pim) {
            case  0: shift = 0; register = "PINE"; break;
            case  1: shift = 1; register = "PINE"; break;
            case  2: shift = 4; register = "PINE"; break;
            case  3: shift = 5; register = "PINE"; break;
            case  4: shift = 5; register = "PING"; break;
            case  5: shift = 3; register = "PINE"; break;
            case  6:
            case  7:
            case  8:
            case  9: shift = pin-3; register = "PINH"; break;
            case 10:
            case 11:
            case 12:
            case 13: shift = pin-6; register = "PINB"; break;
            case 14: 
            case 15: shift = 15-pin; register = "PINJ"; break;
            case 16: 
            case 17: shift = 17-pin; register = "PINH"; break;
            case 18: 
            case 19: 
            case 20: 
            case 21: shift = 21-pin; register = "PIND"; break;
            case 22:
            case 23:
            case 24:
            case 25:
            case 26:
            case 27:
            case 28:
            case 29: shift = pin-22; register = "PINA"; break;
            case 30: 
            case 31: 
            case 32: 
            case 33: 
            case 34: 
            case 35: 
            case 36: 
            case 37: shift = 37-pin; register = "PINC"; break;
            case 38: shift = 7; register = "PIND"; break;
            case 39: 
            case 40: 
            case 41: shift = 41-pin; register = "PING"; break;
            case 42: 
            case 43: 
            case 44: 
            case 45: 
            case 46: 
            case 47: 
            case 48: 
            case 49: shift = 49-pin; register = "PINL"; break;
            case 50: 
            case 51: 
            case 52: 
            case 53: shift = 53-pin; register = "PINB"; break;
            default: return null;
                
        }
    }
    return "((" + register + " & ( 1 << " + shift  + " )) > 0 ? HIGH : LOW )";
}
