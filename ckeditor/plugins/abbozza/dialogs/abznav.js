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
 
CKEDITOR.dialog.add( 'abznav', function( editor ) {
    return {
        title: 'abboza! Navigation',
        minWidth: 400,
        minHeight: 200,
        contents: [
          {
            id: 'tab1',
            label: '',
            title: '',
            elements: [
            {
                type: 'text',
                id: 'main',
                label: 'Menu',
                'default': ""
            },
            {
                type: 'text',
                id: 'prev',
                label: 'Previous sketch',
                'default': ""
            },
            {
                type: 'text',
                id: 'next',
                label: 'Next sketch',
                'default': ""
            }
          ]
          }
        ],
        onShow : function() {
          if ( TaskWindow ) {
            this.setValueOf('tab1','main',TaskWindow.mainSketch);
            this.setValueOf('tab1','prev',TaskWindow.prevSketch);
            this.setValueOf('tab1','next',TaskWindow.nextSketch);
          }
        },
        onOk: function() {
            var dialog = this;
            if ( TaskWindow ) {
                TaskWindow.mainSketch = dialog.getValueOf( 'tab1', 'main' );
                TaskWindow.prevSketch = dialog.getValueOf( 'tab1', 'prev' );
                TaskWindow.nextSketch = dialog.getValueOf( 'tab1', 'next' );
            }
        }
    };
});
