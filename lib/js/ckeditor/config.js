/**
 * Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

        CKEDITOR.editorConfig = function (config) {
            // Define changes to default configuration here. For example:
            // config.language = 'fr';
            // config.uiColor = '#AADC6E';

            config.allowedContent = true;
            config.pasteFilter = null;
            config.extraPlugins = 'abbozza';
            config.extraAllowedContent = 'abbozza-hint page';
            config.resize_enabled = false;
            config.removePlugins = "resize";
            config.toolbarCanCollapse = true;
            config.toolbarStartupExpanded = false;

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
