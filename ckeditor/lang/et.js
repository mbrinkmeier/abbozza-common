/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @fileOverview Defines the {@link CKEDITOR.lang} object, for the
 * Estonian language.
 */

/**#@+
   @type String
   @example
*/

/**
 * Contains the dictionary of language entries.
 * @namespace
 */
CKEDITOR.lang[ 'et' ] = {
	// ARIA description.
	editor: 'Rikkalik tekstiredaktor',
	editorPanel: 'Rikkaliku tekstiredaktori paneel',

	// Common messages and labels.
	common: {
		// Screenreader titles. Please note that screenreaders are not always capable
		// of reading non-English words. So be careful while translating it.
		editorHelp: 'Abi saamiseks vajuta ALT 0',

		browseServer: 'Serveri sirvimine',
		url: 'URL',
		protocol: 'Protokoll',
		upload: 'Laadi üles',
		uploadSubmit: 'Saada serverisse',
		image: 'Pilt',
		flash: 'Flash',
		form: 'Vorm',
		checkbox: 'Märkeruut',
		radio: 'Raadionupp',
		textField: 'Tekstilahter',
		textarea: 'Tekstiala',
		hiddenField: 'Varjatud lahter',
		button: 'Nupp',
		select: 'Valiklahter',
		imageButton: 'Piltnupp',
		notSet: '<määramata>',
		id: 'ID',
		name: 'Nimi',
		langDir: 'Keele suund',
		langDirLtr: 'Vasakult paremale (LTR)',
		langDirRtl: 'Paremalt vasakule (RTL)',
		langCode: 'Keele kood',
		longDescr: 'Pikk kirjeldus URL',
		cssClass: 'Stiilistiku klassid',
		advisoryTitle: 'Soovituslik pealkiri',
		cssStyle: 'Laad',
		ok: 'Olgu',
		cancel: 'Loobu',
		close: 'Sulge',
		preview: 'Eelvaade',
		resize: 'Suuruse muutmiseks lohista',
		generalTab: 'Üldine',
		advancedTab: 'Täpsemalt',
		validateNumberFailed: 'See väärtus pole number.',
		confirmNewPage: 'Kõik salvestamata muudatused lähevad kaotsi. Kas oled kindel, et tahad laadida uue lehe?',
		confirmCancel: 'Mõned valikud on muudetud. Kas oled kindel, et tahad dialoogi sulgeda?',
		options: 'Valikud',
		target: 'Sihtkoht',
		targetNew: 'Uus aken (_blank)',
		targetTop: 'Kõige ülemine aken (_top)',
		targetSelf: 'Sama aken (_self)',
		targetParent: 'Vanemaken (_parent)',
		langDirLTR: 'Vasakult paremale (LTR)',
		langDirRTL: 'Paremalt vasakule (RTL)',
		styles: 'Stiili',
		cssClasses: 'Stiililehe klassid',
		width: 'Laius',
		height: 'Kõrgus',
		align: 'Joondus',
		alignLeft: 'Vasak',
		alignRight: 'Paremale',
		alignCenter: 'Kesk',
		alignJustify: 'Rööpjoondus',
		alignTop: 'Üles',
		alignMiddle: 'Keskele',
		alignBottom: 'Alla',
		alignNone: 'None', // MISSING
		invalidValue: 'Vigane väärtus.',
		invalidHeight: 'Kõrgus peab olema number.',
		invalidWidth: 'Laius peab olema number.',
		invalidLength: 'Value specified for the "%1" field must be a positive number with or without a valid measurement unit (%2).', // MISSING
		invalidCssLength: '"%1" välja jaoks määratud väärtus peab olema positiivne täisarv CSS ühikuga (px, %, in, cm, mm, em, ex, pt või pc) või ilma.',
		invalidHtmlLength: '"%1" välja jaoks määratud väärtus peab olema positiivne täisarv HTML ühikuga (px või %) või ilma.',
		invalidInlineStyle: 'Reasisese stiili määrangud peavad koosnema paarisväärtustest (tuples), mis on semikoolonitega eraldatult järgnevas vormingus: "nimi : väärtus".',
		cssLengthTooltip: 'Sisesta väärtus pikslites või number koos sobiva CSS-i ühikuga (px, %, in, cm, mm, em, ex, pt või pc).',

		// Put the voice-only part of the label in the span.
		unavailable: '%1<span class="cke_accessibility">, pole saadaval</span>',

		// Keyboard keys translations used for creating shortcuts descriptions in tooltips, context menus and ARIA labels.
		keyboard: {
			8: 'Backspace', // MISSING
			13: 'Enter', // MISSING
			16: 'Shift', // MISSING
			17: 'Ctrl', // MISSING
			18: 'Alt', // MISSING
			32: 'Space', // MISSING
			35: 'End', // MISSING
			36: 'Home', // MISSING
			46: 'Delete', // MISSING
			112: 'F1', // MISSING
			113: 'F2', // MISSING
			114: 'F3', // MISSING
			115: 'F4', // MISSING
			116: 'F5', // MISSING
			117: 'F6', // MISSING
			118: 'F7', // MISSING
			119: 'F8', // MISSING
			120: 'F9', // MISSING
			121: 'F10', // MISSING
			122: 'F11', // MISSING
			123: 'F12', // MISSING
			124: 'F13', // MISSING
			125: 'F14', // MISSING
			126: 'F15', // MISSING
			127: 'F16', // MISSING
			128: 'F17', // MISSING
			129: 'F18', // MISSING
			130: 'F19', // MISSING
			131: 'F20', // MISSING
			132: 'F21', // MISSING
			133: 'F22', // MISSING
			134: 'F23', // MISSING
			135: 'F24', // MISSING
			224: 'Command' // MISSING
		},

		// Prepended to ARIA labels with shortcuts.
		keyboardShortcut: 'Keyboard shortcut', // MISSING

		optionDefault: 'Default' // MISSING
	}
};
