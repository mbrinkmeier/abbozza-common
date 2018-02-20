/**
 * @license
 * abbozza!
 *
 * Copyright 2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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

        CKEDITOR.editorConfig = function (config) {
            // Define changes to default configuration here. For example:
            // config.language = 'fr';
            // config.uiColor = '#AADC6E';

            config.allowedContent = true;
            config.pasteFilter = null;
            config.extraPlugins = 'abbozza,autogrow';
            config.extraAllowedContent = 'abbozza-hint,page';
            config.resize_enabled = false;
            // config.removePlugins = "resize";
            config.toolbarCanCollapse = true;
            config.toolbarStartupExpanded = true;
            config.width = "auto";
            config.height = "100%";
            config.autoGrow_onStartup = true;
            config.fillEmptyBlocks = false;
            config.autoParagraph = false;
            
            config.toolbarGroups = [
                {name: 'document', groups: ['mode', 'document', 'doctools']},
                {name: 'undo', groups: ['undo']},
                {name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']},
                // { name: 'forms', groups: [ 'forms' ] },
                {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                '/',
                {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'paragraph']},
                {name: 'links', groups: ['links']},
                {name: 'insert', groups: ['insert']},
                {name: 'abbozza', groups: ['abbozza']},
                '/',
                {name: 'styles', groups: ['styles']},
                {name: 'colors', groups: ['colors']},
                {name: 'tools', groups: ['tools']},
                {name: 'others', groups: ['others']},
                {name: 'about', groups: ['about']}
            ];

            config.removeButtons = 'Save,Preview,Print,Templates,newPage,Find,Replace,bidi,Flash,pagebreak';

        };
