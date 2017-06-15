/**
 * @license abbozza!
 * 
 * File: ToolboxMgr.js
 * 
 * This singleton object manages the toolbox
 * 
 * Copyright 2015 Michael Brinkmeier
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * This singleton manages the toolbox of the abbozza! workspace. It provides
 * operations to construct the toolbox from given features, described in
 * features.xml.
 * 
 * @type type
 */
ToolboxMgr = {
    features: null,
    
    /**
     * This operation rebuilds the toolbox. If init is set to true,
     * the toolbox is injected into the document. If it is set to false,
     * the toolbox is updated. 
     */
    rebuild: function (init) {
        // this.features = Connection.getXMLSynced("js/abbozza/" + Abbozza.pathPrefix + "features.xml");
        ColorMgr.resetColors();
        
        this.features = Connection.getXMLSynced("/abbozza/features");

        var myToolbox = ToolboxMgr.toolboxFromFeature("feat.BASE");

        // if (Configuration.getParameter("option.operations") == "true")
        //    ToolboxMgr.mergeFeature(myToolbox, "feat.FUNC");
        /* if (Configuration.getParameter("option.serialRate") == "true") {
         ToolboxMgr.mergeFeature(myToolbox, "feat.SERIAL");
         ToolboxMgr.mergeFeature(myToolbox, "feat.SERIALRATE");
         }*/
        // if (Configuration.getParameter("option.devices") == "true") {
        //     ToolboxMgr.mergeFeature(myToolbox, "feat.DEVICES");
        // }
        // if (Configuration.getParameter("option.serial") == "true") {
        //     ToolboxMgr.mergeFeature(myToolbox, "feat.SERIAL");
        // }
        // if (Configuration.getParameter("option.teacher") == "true") {
        //     ToolboxMgr.mergeFeature(myToolbox, "feat.TEACHER");
        // }
        
        // Iterate through features
        var features = this.features.getElementsByTagName("feature");
        for (var i = 0; i < features.length; i++) {
            var id = features[i].getAttribute("id");
            if ( id != "feat.BASE" ) {
                var option = features[i].getAttribute("option");
                if ( option != null ) {
                    if (Configuration.getParameter("option."+option) == "true") {
                       ToolboxMgr.mergeFeature(myToolbox,id);
                    }
                } else {
                       ToolboxMgr.mergeFeature(myToolbox,id);                
                }
            }
        }
        
        var entries = myToolbox.getElementsByTagName("category");
        for (var i = 0; i < entries.length; i++) {
            var cat = entries[i].getAttribute("id");
            var col = entries[i].getAttribute("color");
            if ( col ) {
                ColorMgr.catColor[cat] = col;
            }
            entries[i].setAttribute("name", _(cat));
            var children = entries[i].getElementsByTagName("block");
            for (var j = 0; j < children.length; j++) {
                var child = children[j];
                var type = children[j].getAttribute("type");
                if ( Blockly.Blocks[type] && child.parentNode == entries[i] ) {
                    Blockly.Blocks[type]._category = cat;
                }
            }
        }
        

        for ( var type in Blockly.Blocks ) {
            if ( Blockly.Blocks[type]._category == undefined ) {
               if (type.startsWith("var_") || type.startsWith("arr_")) {
                   Blockly.Blocks[type]._category = "cat.VAR";
               } else {
                   Blockly.Blocks[type]._category = "cat.FUNC";
               }
            }
        }
       
        // Check for empty categories
        var cats = myToolbox.getElementsByTagName("category");
        
        for (var i=0; i < cats.length; i++) {
            var children = cats[i].getElementsByTagName("block");
            if (children.length == 0) {
                myToolbox.removeChild(cats[i]);
                i=i-1;
            }
        }
                        
        if (init) {
            // Blockly.inject(document.getElementById("workspace"), {
            Blockly.inject(document.querySelector("[id='workspace']"), {
                toolbox: myToolbox,
                trashcan: true,
                scrollbars: true
            });
        } else {
            Blockly.mainWorkspace.updateToolbox(myToolbox);
        }
        
        this.colorize();
    },
    
    /**
     * This operation builds a toolbox from a given feature.
     */
    toolboxFromFeature: function (name) {

        // var feature = this.features.getElementById(name);
        var feature = this.features.querySelector("[id='" + name + "']");
        if (feature == null)
            return null;

        return feature.cloneNode(true);
    },
    
    /**
     * This operation merges the feature specific toolbox into the given one.
     */
    mergeFeature: function (toolbox, name) {
        
        var feature = this.features.querySelector("[id='" + name + "']");
        // var feature = this.features.getElementById(name);
        if (feature == null)
            return;
        
        var cats = feature.getElementsByTagName("category");
        
        for (i = 0; i < cats.length; i++) {
            var toolcat = null;
            var tcats = toolbox.getElementsByTagName("category");
            var j = 0;
            while ((j < tcats.length) && (cats[i].getAttribute("id") != tcats[j].getAttribute("id"))) {
                j++;
            }
            if (j < tcats.length) {
                for (var k = 0; k < cats[i].childNodes.length; k++) {
                    if (cats[i].childNodes[k].nodeType == 1) {
                        tcats[j].appendChild(cats[i].childNodes[k].cloneNode(false));
                    }
                }
            } else {
                toolbox.appendChild(cats[i].cloneNode(true));
            }
        }
    },
    
    /**
     * This operation colorizes the toolbox
     */
    colorize: function () {
        var treeItems = document.querySelectorAll('[role="treeitem"]');
        for (var i = 0; i < treeItems.length; i++) {
            var id = treeItems[i].getAttribute("id") + ".label";
            // var el = document.getElementById(id);
            var el = document.querySelector("[id='" + id + "']");
            var content = el.textContent;
            var cat = this.getCategory(content);
            var color = ColorMgr.getCatColor(cat);
            // Check if the deprecated function exists
            treeItems[i].style.backgroundColor = ColorMgr.getHexColor(color);
            treeItems[i].style.color = "#ffffff";        }

        /**
         * Change the onmouse over handler of the categories to keep a 
         * transparent background.
         */
        var treeRows = document.getElementsByClassName("blocklyTreeRow");
        for (var i = 0; i < treeRows.length; i++ )  {
            treeRows[i].onmouseover = function(event) {
                this.style.backgroundColor = "transparent";
            }
        }

        treeRows = document.getElementsByClassName("blocklyTreeLabel");
        for (var i = 0; i < treeRows.length; i++ )  {
            treeRows[i].style.fontSize = "14px";
            treeRows[i].style.paddingLeft = "0px";
            treeRows[i].style.paddingRight = "12px";
        }

    },
    
    
    getCategory: function (id) {
        var children = Configuration.xmlLocale
                .getElementsByTagName("categories")[0].childNodes;
        for (var i = 0; i < children.length; i++) {
            if (children[i].textContent == id)
                return children[i].getAttribute("id");
        }

        return null;
    }
        
}
