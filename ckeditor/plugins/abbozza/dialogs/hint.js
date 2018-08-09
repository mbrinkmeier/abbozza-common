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
 
CKEDITOR.dialog.add( 'hint', function( editor ) {
    return {
        title: 'abboza! Hint',
        minWidth: 400,
        minHeight: 200,
        contents: [
          {
            id: 'tab1',
            label: '',
            title: '',
            elements: [
            {
                type: 'textarea',
                id: 'text',
                validate: CKEDITOR.dialog.validate.notEmpty( "" ),
                label: 'Text',
                'default': "Text",
                setup: function( widget ) {
                  this.setValue ( widget.element.getText() );
                },
                commit: function ( widget ) {
                  widget.setData('text', this.getValue());
                }
            },
            {
                type: 'text',
                id: 'block',
                label: 'Block ID',
                validate: CKEDITOR.dialog.validate.notEmpty( "" ),
                'default': "block_id",
                setup: function( widget ) {
                  this.setValue ( widget.element.getAttribute("block") );
                },
                commit: function ( widget ) {
                  widget.setData('block', this.getValue());
                  widget.element.setAttribute("block",this.getValue());
                }
            },
            {
                type: 'text',
                id: 'dx',
                label: 'X-Offset [px]',
                validate: CKEDITOR.dialog.validate.notEmpty( "" ),
                'default': "0",
                setup: function( widget ) {
                  this.setValue ( widget.element.getAttribute("dx") );
                },
                commit: function ( widget ) {
                  widget.setData('dx', this.getValue());
                  widget.element.setAttribute("dx",this.getValue());
                }
            },
            {
                type: 'text',
                id: 'dy',
                label: 'Y-Offset [px]',
                validate: CKEDITOR.dialog.validate.notEmpty( "" ),
                'default': "0",
                setup: function( widget ) {
                  this.setValue ( widget.element.getAttribute("dy") );
                },
                commit: function ( widget ) {
                  widget.setData('dy', this.getValue());
                  widget.element.setAttribute("dy",this.getValue());
                }
            },
            {
                type: 'text',
                id: 'width',
                label: 'Width',
                validate: CKEDITOR.dialog.validate.notEmpty( "" ),
                'default': "20em",
                setup: function( widget ) {
                  this.setValue ( widget.element.getAttribute("width") );
                },
                commit: function ( widget ) {
                  widget.setData('width', this.getValue());
                  widget.element.setAttribute("width",this.getValue());
                }
            },
            {
                type: 'text',
                id: 'height',
                label: 'Height',
                validate: CKEDITOR.dialog.validate.notEmpty( "" ),
                'default': "3em",
                setup: function( widget ) {
                  this.setValue ( widget.element.getAttribute("height") );
                },
                commit: function ( widget ) {
                  widget.setData('height', this.getValue());
                  widget.element.setAttribute("height",this.getValue());
                }
            }
          ]
          }
        ]

        /*,

        onOk: function() {
            var dialog = this;

            var hint = editor.document.createElement( 'abbozza-hint' );
            hint.setText( dialog.getValueOf( 'tab1', 'text' ) );
            hint.setAttribute( 'block', dialog.getValueOf( 'tab1', 'blockid' ) );
            hint.setAttribute( 'dx', dialog.getValueOf( 'tab1', 'dx' ) );
            hint.setAttribute( 'dy', dialog.getValueOf( 'tab1', 'dy' ) );
            hint.setAttribute( 'width', dialog.getValueOf( 'tab1', 'width' ) );
            hint.setAttribute( 'height', dialog.getValueOf( 'tab1', 'height' ) );

            hint.setAttribute( 'id', 'hint-' + dialog.getValueOf( 'tab1', 'blockid' ) );

            editor.insertElement( hint );
        }*/
    };
});
