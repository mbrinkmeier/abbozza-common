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
#include "abbozzaParser.h"

AbbozzaParser::AbbozzaParser() {
    buffer = "";
    currentCommand = "";
    // remainder = "";
    debug = false;
}


void AbbozzaParser::check() {
    int start, end;

    String newBuf;
    // String prefix;
    String currentLine;
    
    currentCommand = "";
    cmd = "";
    cmdId = "";
    
    if ( Serial.available() ) {
        // append string to buffer
        Serial.setTimeout(100);
        newBuf = Serial.readString();
        buffer.concat(newBuf);
        if (debug) {
            String buf = String(buffer);
            buf.replace("[[","[_[");
            buf.replace("]]","]_]");
            Serial.println("Buffer : '" + buf + "'");
        }
    }
    // find next command
    currentLine = "";
    // do {
        start = buffer.indexOf("[[");
        if ( start >= 0 ) {
            end = buffer.indexOf("]]");
            if ( end >= 0 ) {
                // prefix = buffer.substring(0,start);
                // remainder.concat(prefix);
                currentLine = buffer.substring(start+2,end);
                currentLine.replace('\n',' ');
                currentLine.replace('\t',' ');
                currentLine.trim();
                buffer.remove(0,end+2);
                setCommand(currentLine);
            }
        }
    // } while ((start >= 0) && (end >= 0));
}


void AbbozzaParser::setCommand(String line) {
    if (debug) Serial.println("-> executing " + line);
    currentCommand = line;
    cmdId = "";
    cmd = "";
    if ( currentCommand.charAt(0) == '_' ) {
        cmdId = parse_word();
    }
    cmd = parse_word();
    cmd.toUpperCase();
}


void AbbozzaParser::sendResponse(String resp) {
    if ( !cmdId.equals("") ) {
        resp = "[[" + cmdId + " " + resp + "]]";
    } else {
        resp = "[["+resp+"]]";
    }
   Serial.println(resp);
   cmdId = "";
}


String AbbozzaParser::parse_word() {
    int pos = currentCommand.indexOf(' ');
    String word = currentCommand.substring(0,pos);
    currentCommand.remove(0,pos);
    currentCommand.trim();    
    return word;
}

String AbbozzaParser::parse_string() {
    int pos;
    String result = "";
    if ( currentCommand.charAt(0) != '"') return parse_word();
    do {
        pos = currentCommand.indexOf('"',pos+1);
    } while ( (pos != -1) && (currentCommand.charAt(pos-1) == '\\' ));
    if ( pos == -1 ) pos = currentCommand.length();
    result = currentCommand.substring(1,pos);
    currentCommand.remove(0,pos+1);
    return result;
}


String AbbozzaParser::getCmd() {
    return cmd;
}
int AbbozzaParser::parse_int() {
    String word = parse_word();
    return (int) word.toInt();
}

long AbbozzaParser::parse_long() {
    String word = parse_word();
    return word.toInt();
}

float AbbozzaParser::parse_float() {
    String word = parse_word();
    return word.toFloat();
}

double AbbozzaParser::parse_double() {
    String word = parse_word();
    return word.toFloat();
}

void AbbozzaParser::execute() {
  String command;
  String arg;
  int pos, pin, value;

  if ( cmd.equals("DSET") ) {
    pin = parse_int();
        
    value = parse_int();
    
    pinMode(pin,OUTPUT);
    if ( value > 0 ) {
      digitalWrite(pin,HIGH);
    } else {
      digitalWrite(pin,LOW);
    }
  } else if ( cmd.equals("ASET") ) {
      pin = parse_int();

      value = parse_int();

    pinMode(pin,OUTPUT);
    analogWrite(pin,value);
  } else if ( cmd.equals("DGET") ) {
      pin = parse_int();

    pinMode(pin,INPUT);
    value = digitalRead(pin) > 0 ? 1 : 0;
    sendResponse("DVAL " + String(pin) + " " + String(value));
  }  else if ( cmd.equals("AGET") ) {
    pin = parse_int();

    pinMode(pin,INPUT);
    value = analogRead(pin);
    sendResponse("AVAL " + String(pin) + " " + String(value));
  } else if ( cmd.equals("DEBUG") ) {
      value = parse_int();
      if ( value == 0) {
          debug = false;
      } else {
          debug = true;
      }
  }
}