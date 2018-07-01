/**
 * @license
 * abbozza!
 * 
 * File: Connection.js
 * This object handles the communication with the abboza!-Server
 * 
 * Copyright 2015 Michael Brinkmeier
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
 */

/**
 * A singleton for handling the connection to the abbozza!-server.
 * 
 * @type type
 */
var Connection = {}


/**
 * This oeration retrieves an XML document unsynced from the given URL.
 * 
 * @param {type} path The requested path
 * @param {type} successHandler The success callback
 * @param {type} errorHandler the error callback
 * @returns {xhttp.responseXML|ActiveXObject.responseXML|Document} The
 * requested XML document
 */
Connection.getXML = function (path, successHandler, errorHandler) {

    var xhttp;
    
    if (window.XMLHttpRequest)
        xhttp = new XMLHttpRequest();
    else // code for IE5 and IE6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onload = function () {
        if (xhttp.status == 200) {
            if (successHandler) {
                successHandler(this.responseXML,xhttp);
            }
        } else {
            if (errorHandler)
                errorHandler(this.responseXML);
        }
    };

    
    // xhttp.responseType = "application/xml";
    xhttp.open("GET", path, true);
    xhttp.setRequestHeader("Cache-Control","no-cache");
    xhttp.setRequestHeader("Cache-Control","no-store");
    xhttp.setRequestHeader("Cache-Control","must-revalidate");
    xhttp.setRequestHeader("Cache-Control","max-age=0");
    xhttp.responseType = "document";
    xhttp.send();
};


/**
 * This oeration retrieves an XML document synced from the given URL.
 * 
 * @param {type} path The requested path
 * @param {type} successHandler The success callback
 * @param {type} errorHandler the error callback
 * @returns {xhttp.responseXML|ActiveXObject.responseXML|Document} The
 * requested XML document
 */
Connection.getXMLSynced = function (path, successHandler, errorHandler) {

    var xhttp;

    if (window.XMLHttpRequest)
        xhttp = new XMLHttpRequest();
    else // code for IE5 and IE6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onload = function () {
        if (xhttp.status == 200) {
            if (successHandler)
                successHandler(this.responseXML);
        } else {
            if (errorHandler)
                errorHandler(this.responseXML);
        }
    }

    xhttp.open("GET", path, false);
    // xhttp.responseType="document";
    xhttp.setRequestHeader("Cache-Control","no-cache");
    xhttp.setRequestHeader("Cache-Control","no-store");
    xhttp.setRequestHeader("Cache-Control","must-revalidate");
    xhttp.setRequestHeader("Cache-Control","max-age=0");
    xhttp.send();

    if ( xhttp.responseXML) {
        return xhttp.responseXML;
    } else {
        var parser = new DOMParser();
        var dom = parser.parseFromString(xhttp.response,"application/xml");
        console.log(dom);
        return dom;
    } 
};

/**
 * This oeration sends an XML document to the given URL.
 * 
 * @param {type} path The path
 * @param {type} successHandler The success callback
 * @param {type} errorHandler the error callback
 * @returns {xhttp.responseXML|ActiveXObject.responseXML|Document} The
 * requested XML document
 */
Connection.sendXML = function (path, content, successHandler, errorHandler) {
    var xhttp;

    if (window.XMLHttpRequest)
        xhttp = new XMLHttpRequest();
    else // code for IE5 and IE6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onload = function () {
        if (xhttp.status == 200) {
            if (successHandler)
                successHandler(this.responseXML);
        } else {
            if (errorHandler)
                errorHandler(this.responseXML);
        }
    };

    xhttp.open("POST", path, true);
    xhttp.responseType = "";
    xhttp.setRequestHeader("Cache-Control","no-cache");
    xhttp.setRequestHeader("Cache-Control","no-store");
    xhttp.setRequestHeader("Cache-Control","must-revalidate");
    xhttp.setRequestHeader("Cache-Control","max-age=0");
    xhttp.send(content);

    return xhttp.responseText;
};

/**
 * This oeration retrieves string unsynced from the given URL.
 * 
 * @param {type} path The requested path
 * @param {type} successHandler The success callback
 * @param {type} errorHandler the error callback
 * @returns {String} The requested string
 */
Connection.getText = function (path, successHandler, errorHandler) {
    var xhttp;

    if (window.XMLHttpRequest)
        xhttp = new XMLHttpRequest();
    else // code for IE5 and IE6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onload = function () {
        if (xhttp.status == 200) {
            if (successHandler)
                successHandler(this.responseText);
        } else {
            if (errorHandler)
                errorHandler(this.responseText);
        }
    };

    xhttp.open("GET", path, true);
    xhttp.setRequestHeader("Cache-Control","no-cache");
    xhttp.setRequestHeader("Cache-Control","no-store");
    xhttp.setRequestHeader("Cache-Control","must-revalidate");
    xhttp.setRequestHeader("Cache-Control","max-age=0");
    xhttp.send();
    // xhttp.responseType = "";

    return xhttp.responseText;
};


/**
 * This oeration retrieves string synced from the given URL.
 * 
 * @param {type} path The requested path
 * @param {type} successHandler The success callback
 * @param {type} errorHandler the error callback
 * @returns {String} The requested string
 */
Connection.getTextSynced = function (path, successHandler, errorHandler) {
    var xhttp;

    if (window.XMLHttpRequest)
        xhttp = new XMLHttpRequest();
    else // code for IE5 and IE6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onload = function () {
        if (xhttp.status == 200) {
            if (successHandler)
                successHandler(this.responseText);
        } else {
            if (errorHandler)
                errorHandler(this.responseText);
        }
    };

    xhttp.open("GET", path, false);
    xhttp.setRequestHeader("Cache-Control","no-cache");
    xhttp.setRequestHeader("Cache-Control","no-store");
    xhttp.setRequestHeader("Cache-Control","must-revalidate");
    xhttp.setRequestHeader("Cache-Control","max-age=0");
    xhttp.send();

    // xhttp.responseType = "";
    return xhttp.responseText;
};

/**
 * This operation sends a string to a given URL.
 */
Connection.sendText = function (path, content, successHandler, errorHandler, timeout) {
    var xhttp;

    if ( typeof timeout == "undefined" ) timeout = 0;
    
    if (window.XMLHttpRequest)
        xhttp = new XMLHttpRequest();
    else // code for IE5 and IE6
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xhttp.onload = function () {
        if (xhttp.status == 200) {
            if (successHandler)
                successHandler(this.responseText);
        } else {
            if (errorHandler)
                errorHandler(this.responseText);
        }
    };
    
    xhttp.ontimeout = function() {
        if (errorHandler)
            errorHandler("TIMEOUT");
    };
            
    xhttp.open("POST", path, true);
    xhttp.timeout = timeout;    
    // xhttp.responseType = "";
    xhttp.setRequestHeader("Cache-Control","no-cache");
    xhttp.setRequestHeader("Cache-Control","no-store");
    xhttp.setRequestHeader("Cache-Control","must-revalidate");
    xhttp.setRequestHeader("Cache-Control","max-age=0");
    
    try {
        xhttp.send(content);
    } catch (err) {
        console.log(err);
    }

    return xhttp.responseText;
};
