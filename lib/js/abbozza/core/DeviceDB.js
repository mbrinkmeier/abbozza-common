/* global ReservedWords */

/**
 * @license
 * abbozza!
 *
 * Copyright 2015-2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
 * @fileoverview An object for the storage of registered devices
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */

DEV_TYPE_LED = 0;
DEV_TYPE_BUTTON = 1;
DEV_TYPE_POTI = 2;
DEV_TYPE_SERVO = 3;
DEV_TYPE_IRDIST = 4;
DEV_TYPE_IRRECEIVER = 5;
DEV_TYPE_LCD = 10;
DEV_TYPE_SERIAL = 11;
DEV_TYPE_MOTOR = 12;
DEV_TYPE_RGB_LED = 13;
DEV_TYPE_LED_DIM = 13;

/**
 * The constructor.
 * 
 * @returns {DeviceDB}
 */
DeviceDB = function () {

    this.devices = [];
};

/**
 * Add a device to the DB.
 * 
 * @param {type} name The name of the device.
 * @param {type} device The block declaring the device
 * @returns {undefined}
 */
DeviceDB.prototype.addDevice = function (name, device) {
    var found = this.findDevice(name);
    if (found == null) {
        this.devices.push([name, device]);
    }
};


/**
 * Find the block declaring the device.
 * 
 * @param {type} name The name of the device
 * @returns {DeviceDB.prototype@arr;@arr;devices}
 */
DeviceDB.prototype.findDevice = function (name) {
    var i = 0;
    while ((i < this.devices.length) && (this.devices[i][0] !== name)) {
        i++;
    }

    if (i === this.devices.length)
        return null;

    return this.devices[i][1];
};

/**
 * Delete a device from the DB.
 * 
 * @param {type} name
 * @returns {undefined}
 */
DeviceDB.prototype.delDevice = function (name) {
    var i = 0;
    while ((i < this.devices.length) && (this.devices[i][0] !== name)) {
        i++;
    }

    if (i === this.devices.length)
        return;

    this.devices[i] = this.devices[this.devices.length - 1];
    this.symbols.pop();
};


/**
 * Get all devices of a given type.
 * 
 * @param {type} type The requested type
 * @returns {Array}
 */
DeviceDB.prototype.getDevices = function (type) {
    var names = [];
    for (i = 0; i < this.devices.length; i++) {
        if (this.devices[i][1].type === type) {
            names.push(this.devices[i]);
        }
    }
    if (this.devices.length === 0)
        return [["<default>", "<default>"]];
};

/**
 * Get a legal name for the device.
 * 
 * @param {type} name The original name
 * @returns {@var;neuname|String} The legal name
 */
DeviceDB.prototype.getLegalName = function (name) {
    console.log(name);
    console.log(this.findDevice(name));
    var neuname;
    var no;
    if (ReservedWords.check(name))
        return "_" + name;

    if (this.findDevice(name) !== null) {
        no = 0;
        neuname = name + no;
        while (this.findDevice(neuname) !== null) {
            no = no + 1;
            neuname = name + no;
        }
        name = neuname;
    }

    return name;

};