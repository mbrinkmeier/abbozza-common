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

#ifndef AbbozzaStringParser_h
#define AbbozzaStringParser_h

class AbbozzaStringParser {
    
public:
    AbbozzaStringParser();
    void setLine(String line);
    boolean endOfLine();
    String parse_word();
    int parse_int();
    long parse_long();
    float parse_float();
    double parse_double();
    String parse_string();
        
private:
    String buffer;
};

#endif
