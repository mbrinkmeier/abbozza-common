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

CKEDITOR.plugins.add( 'abbozza', {

  requires: 'widget',

  icons: 'newabzpage,delabzpage,hint,abznav',

  init: function( editor ) {

    /**
     * Add the hint widget
     */
    editor.widgets.add( 'hint' , {
       draggable: false,

       // The template for the widget
       template:
          '<abbozza-hint block="block_id" dx="0" dy="0" width="20em" height="3em">' +
          'Text ...' +
          '</abbozza-hint>',

      dialog: 'hint',

      upcast: function( element, data ) {
        return element.name == "abbozza-hint";
      },

      init: function() {
        this.setData('text', this.element.getText());
        this.setData('block', this.element.getAttribute("block"));
        this.setData('dx', this.element.getAttribute("dx"));
        this.setData('dy', this.element.getAttribute("dy"));
        this.setData('width', this.element.getAttribute("width"));
        this.setData('height', this.element.getAttribute("height"));

        // Add this element as a connected hint to the warning icon of
        // the corresponding block.
        if ( Abbozza ) {
          var blocks = Abbozza.getBlocksById(this.element.getAttribute("block"));
          this.element.$.iconResized = function(icon) {
            var dx = icon.shiftX_;
            var dy = icon.shiftY_;
            var width = icon.width_;
            var height = icon.height_;
            this.setAttribute("dx",dx);
            this.setAttribute("dy",dy);
            this.setAttribute("width",width);
            this.setAttribute("height",height);
          };
          for ( var i = 0; i < blocks.length; i++) {
            if ( blocks[i].warning  && (blocks[i].warning.addHint != "undefined") ) {
              blocks[i].warning.addHint(this.element.$);
            }
          }

          // If this element is destroyed, remove it from the hint list of the
          // corresponding block.
          this.on("destroy", function(event) {
            if ( Abbozza ) {
              var blocks = Abbozza.getBlocksById(this.element.getAttribute("block"));
              for ( var i = 0; i < blocks.length; i++) {
                if ( blocks[i].warning  && (blocks[i].warning.removeHint != "undefined") ) {
                  blocks[i].warning.removeHint(this.element.$);
                }
              }
            }
          });
        }
      },

      data: function() {
        this.element.setText(this.data.text);
        this.element.setAttribute("block",this.data.block);
        this.element.setAttribute("dx",this.data.dx);
        this.element.setAttribute("dy",this.data.dy);
        this.element.setAttribute("width",this.data.width);
        this.element.setAttribute("height",this.data.height);
      }

    });

    /**
     * The hint command
     */
    editor.addCommand( 'abznav', new CKEDITOR.dialogCommand( 'abznav' ) );
    CKEDITOR.dialog.add('hint', this.path + 'dialogs/hint.js');
    CKEDITOR.dialog.add('abznav',this.path + 'dialogs/abznav.js');
    
    /**
     * The newpage command inserts anew page.
     */
    editor.addCommand( 'newabzpage', {
      exec:
         function( editor ) {
           if ( !TaskWindow ) return;
           TaskWindow.insertPage();
         }
    });

    editor.addCommand( 'delabzpage', {
      exec:
         function( editor ) {
           if ( !TaskWindow ) return;
           TaskWindow.deletePage();
         }
     });
     
    /**
     * Adding the newpage Button
     */
    editor.ui.addButton( 'newabzpage', {
      label: 'Insert abbozza! Page',
      command: 'newabzpage',
      toolbar: 'abbozza'
    });

    /**
     * Adding the newpage Button
     */
    editor.ui.addButton( 'delabzpage', {
      label: 'Delete abbozza! Page',
      command: 'delabzpage',
      toolbar: 'abbozza'
    });

    /**
     * Adding the hint Button
     */
    editor.ui.addButton( 'hint', {
      label: 'Create an abbozza! Hint',
      command: 'hint',
      toolbar: 'abbozza'
    });

    /**
     * Adding the nav Button
     */
    editor.ui.addButton( 'abznav', {
      label: 'Set abbozza! navigation',
      command: 'abznav',
      toolbar: 'abbozza'
    });
  }

});
