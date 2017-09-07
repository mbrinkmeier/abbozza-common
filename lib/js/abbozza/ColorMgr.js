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
 * 
 * NOT SYSTEM SPECIFIC
 * 
 * Categories are system specific ??
 * 
 */

/**
 * This singleton colorizes the toolbox and blocks according to the configured
 * color scheme.
 * 
 * @fileoverview A handler for the block colors 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

var ColorMgr = {
};


ColorMgr.originalGetColour = Blockly.Block.prototype.getColour;

// Switch Blockly to abbozza! color management
Blockly.Block.prototype.getColour = function () {
    return ColorMgr.getBlockColour(this);
}


ColorMgr.BY_CATEGORY = 1;
ColorMgr.BY_TYPE = 2;
ColorMgr.BY_DEFAULT = 0;

ColorMgr._strategy = ColorMgr.BY_TYPE;


ColorMgr.catColor = new Array();


ColorMgr.resetColors = function () {
    
    ColorMgr.catColor["cat.CTRL"] = "#FF8000";  // 330
    ColorMgr.catColor["cat.COND"] = "#FFA000";  // 0
    ColorMgr.catColor["cat.LOOPS"] = "#FF8000"; // 345
    ColorMgr.catColor["cat.VAR"] = "#FF6000";   // 300
    ColorMgr.catColor["cat.FUNC"] = "#FF4000";  // 330
    
    ColorMgr.catColor["cat.LOGIC"] = "#FF0000"; // 330
    ColorMgr.catColor["cat.MATH"] = "#800080";  // 270
    ColorMgr.catColor["cat.TEXT"] = "#0040FF";  // 240
    ColorMgr.catColor["cat.DISPLAY"] = "#0080FF";  // 240
    
    ColorMgr.catColor["cat.INOUT"] = "#0080C0"; // 160
    ColorMgr.catColor["cat.DEVICES"] = "#008090"; // 135
    ColorMgr.catColor["cat.DEVIN"] = "#008060";   // 115
    ColorMgr.catColor["cat.DEVOUT"] = "#008030";   // 90
    ColorMgr.catColor["cat.SOUND"] = "#008000"; // 90
    ColorMgr.catColor["cat.MOTOR"] = "#008010"; // 90

    ColorMgr.catColor["cat.USB"]    = "#808000"; // 30
    ColorMgr.catColor["cat.SERIAL"] = "#A08000"; // 60
    ColorMgr.catColor["cat.RADIO"] = "#A08000"; // 60
    ColorMgr.catColor["cat.I2CS"] = "#C08000"; // 60
    ColorMgr.catColor["cat.I2CS_MASTER"] = "#C08000"; // 60
    ColorMgr.catColor["cat.I2CS_SLAVE"] = "#C08000"; // 60
    ColorMgr.catColor["cat.INT"]    = "#E08000"; // 45
    ColorMgr.catColor["cat.EVENTS"]    = "#E08000"; // 45

    ColorMgr.typeColor = new Array();

    ColorMgr.typeColor["BOOLEAN"] = "#FF0000"; // 285;
    ColorMgr.typeColor["NUMBER"] = "#800080"; // 250;
    ColorMgr.typeColor["DECIMAL"] = "#6000A0"; // 215;
    ColorMgr.typeColor["STRING"] = "#0000FF"; // 180;
    ColorMgr.typeColor["DEVICE"] = "#008010"; // 145;
    ColorMgr.typeColor["VAR"] = "#FF6000"; // 110;
    ColorMgr.typeColor["FUNC"] = "#FF4000"; // 75;
    ColorMgr.typeColor["PIN"] = "#00800"; // 40;
    ColorMgr.typeColor["ARR_DIM"] = "#FF6000"; // 5;
    ColorMgr.typeColor[""] = "#FF8000"; // 330;
}


/**
 * Create the hex colour is necessary.
 */
ColorMgr.getHexColor = function (color) {
    var hue = Number(color);
    if (!isNaN(hue)) {
        color = Blockly.hueToRgb(hue);
    } else if (goog.isString(color) && color.match(/^#[0-9a-fA-F]{6}$/)) {
        color = color;
    } else {
        color = "#000000";
    }
    return color;
}

ColorMgr.getCatColor = function (cat) {
    if (cat == undefined) {
        return ColorMgr.getHexColor(0);
    }
    
    if (!this.catColor[cat]) {
        return ColorMgr.getHexColor(0);
    }

    return ColorMgr.getHexColor(this.catColor[cat]);
}


ColorMgr.getColor = function (cat) {
    if (!ColorMgr.catColor[cat])
        return 0;
    return ColorMgr.getHexColor(ColorMgr.catColor[cat]);
}


ColorMgr.getBlockColour = function (block) {

    if (this._strategy == this.BY_CATEGORY) {
        return ColorMgr.getCatColor(block._category);
    } else if (this._strategy == this.BY_DEFAULT) {
        return this.originalGetColour.call(block);
    }

    var type;

    if (!block.outputConnection || !block.outputConnection.check_) {
        type = "";
    } else {
        type = block.outputConnection.check_[0];
        if (type == "VAR") {
            type = block.outputConnection.check_[1];
        }
    }
    return this.getHexColor(ColorMgr.typeColor[type]);
}


ColorMgr.colorizeBlocks = function (toolbox) {
    var entries = toolbox.getElementsByTagName("category");
    for (var i = 0; i < entries.length; i++) {
        var blocks = entries[i].getElementsByTagName("block");
        var color = ColorMgr.getCatColor(entries[i].getAttribute("id"));
        for (var j = 0; j < blocks.length; j++) {
            var type = blocks[j].getAttribute("type");
            Blockly.Blocks[type].setColour(color);
        }
    }
}
