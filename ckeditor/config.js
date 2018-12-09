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
    // %REMOVE_START%
    config.plugins =
            'about,' +
            'a11yhelp,' +
            'basicstyles,' +
            'bidi,' +
            'blockquote,' +
            'clipboard,' +
            'colorbutton,' +
            'colordialog,' +
            'copyformatting,' +
            'contextmenu,' +
            'dialogadvtab,' +
            'div,' +
            'elementspath,' +
            'enterkey,' +
            'entities,' +
            'filebrowser,' +
            'find,' +
            'flash,' +
            'floatingspace,' +
            'font,' +
            'format,' +
            'forms,' +
            'horizontalrule,' +
            'htmlwriter,' +
            'image,' +
            'iframe,' +
            'indentlist,' +
            'indentblock,' +
            'justify,' +
            'language,' +
            'link,' +
            'list,' +
            'liststyle,' +
            'magicline,' +
            'maximize,' +
            'newpage,' +
            'pagebreak,' +
            'pastefromword,' +
            'pastetext,' +
            'preview,' +
            'print,' +
            'removeformat,' +
            'resize,' +
            'save,' +
            'selectall,' +
            'showblocks,' +
            'showborders,' +
            'smiley,' +
            'sourcearea,' +
            'specialchar,' +
            'stylescombo,' +
            'tab,' +
            'table,' +
            'tableselection,' +
            'tabletools,' +
            'templates,' +
            'toolbar,' +
            'undo,' +
            'uploadimage,' +
            'wysiwygarea';
    // %REMOVE_END%


    config.allowedContent = true;
    config.pasteFilter = null;
    config.extraPlugins = 'abbozza';
    config.extraAllowedContent = 'abbozza-hint page pagescript taskscript';
    config.resize_enabled = true;
    config.toolbarCanCollapse = true;
    config.toolbarStartupExpanded = true;
    config.width = "100%";
    config.height = "400px";

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
// %LEAVE_UNMINIFIED% %REMOVE_LINE%
