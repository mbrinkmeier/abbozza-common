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
 
/**
 * @fileoverview Some validator functions for names, array dimensions etc
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 * 
 * NOT SYSTEM SPECIFIC
 */


Validator = function() {};
	
	
/**
 * Checks if the given text is a number of size at most max (if max != -1).
 * Strips thousands seperators from the text. Returns the number (or max)
 * as a String.
 * 
 * @param {String} text The returned number.
 * @param {int} max The returned number.
 * @returns {String} The number as text if smaller or equal to max 
 * (if max != -1), and max otherwise.
 */
Validator.lengthValidator = function(text,max) {
	if (text == null) {
	   return null;
	}
	text = text.replace(/O/ig, '0');
	// Strip out thousands separators.
	text = text.replace(/,/g, '');
	var n = parseInt(text || 0);
	if ( isNaN(n) ) return null;
	if ( n < 1 ) return "1";
	if ( (max !== -1) && (n>max) ) return String(max);
	return String(n);
};

/**
 * Checks if the given text is a number.
 * Strips thousands seperators from the text. Returns the number (or max)
 * as a String.
 * 
 * @param {type} text The returned number.
 * @returns {String} The number as text
 */
Validator.numberValidator = function(text) {
	if (text == null) {
	   return null;
	}
	text = text.replace(/O/ig, '0');
	// Strip out thousands separators.
	text = text.replace(/,/g, '');
	var n = parseInt(text || 0);
	if ( isNaN(n) ) return null;
	// if ( n < 1 ) return "1";
	return String(n);
};

/**
 * Checks if the given text is a decimal number.
 * Strips thousands seperators from the text. Returns the number (or max)
 * as a String.
 * 
 * @param {type} text The returned number.
 * @returns {String} The number as text
 */
Validator.decimalValidator = function(text) {
	if (text == null) {
	   return null;
	}
	text = text.replace(/O/ig, '0');
	// Strip out thousands separators.
	text = text.replace(/,/g, '');
	var n = parseFloat(text || 0.0);
	if ( isNaN(n) ) return null;
	// if ( n < 1 ) return "1";
	return String(n);
};


/**
 * Validates the given name and changes it if neccessary.
 * The name has to bee of the form: [a-zA-Z_][a-zA-Z0-9_]*
 * 
 * @param {String} name The name to be validated
 * @returns {String} The corrected String
 */
Validator.nameValidator = function(name) {
	if (name == null) return null;
        if (name === "<name>") return "<name>";
	var result = name.replace(/[\W]/g,"_");
	result = result.replace(/^[0-9]*/g,"");
	return result;
};

/**
 * Checks if the text is a number, rounds it down
 * and returns the integer value as String.
 * 
 * @param {type} text The text to be validated
 * @returns {String} A String representation of trhe rounded down value.
 */
Validator.numericalValidator = function(text) {
	if ( text == null) return null;
	var f = parseFloat(text || 0.0);
	if ( isNaN(f) ) return null;
	var frac = f - Math.floor(f);
	if ( frac === 0.0 ) {
		f = parseInt(text || 0);
	}
	return String(f);
};