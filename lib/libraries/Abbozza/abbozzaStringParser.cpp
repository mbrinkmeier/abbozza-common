/**
 * @license 
 * abbozza!
 * 
 * File: Abbozza.js
 * 
 * A parser for the serial connection
 * 
 * Copyright 2017 Michael Brinkmeier
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

#include "Arduino.h"
#include "abbozzaStringParser.h"

AbbozzaStringParser::AbbozzaStringParser() {
    buffer = "";
}


void AbbozzaStringParser::setLine(String line) {
    buffer = String(line);
}


boolean AbbozzaStringParser::endOfLine() {
    return ( buffer.length() == 0 );
}


String AbbozzaStringParser::parse_word() {
    int pos = buffer.indexOf(' ');
    String word = buffer.substring(0,pos);
    buffer.remove(0,pos);
    buffer.trim();    
    return word;
}

String AbbozzaStringParser::parse_string() {
    int pos;
    String result = "";
    if ( buffer.charAt(0) != '"') return parse_word();
    do {
        pos = buffer.indexOf('"',pos+1);
    } while ( (pos != -1) && (buffer.charAt(pos-1) == '\\' ));
    if ( pos == -1 ) pos = buffer.length();
    result = buffer.substring(1,pos);
    buffer.remove(0,pos+1);
    return result;
}


int AbbozzaStringParser::parse_int() {
    String word = parse_word();
    return (int) word.toInt();
}

long AbbozzaStringParser::parse_long() {
    String word = parse_word();
    return word.toInt();
}

float AbbozzaStringParser::parse_float() {
    String word = parse_word();
    return word.toFloat();
}

double AbbozzaStringParser::parse_double() {
    String word = parse_word();
    return word.toFloat();
}
