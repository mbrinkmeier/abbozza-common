/**
 * @license abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
/**
 * @fileoverview This class provides a Logging system for abbozza!
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.core;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.Vector;

/**
 *
 * @author michael
 */
public class AbbozzaLogger {

    static public final int NONE = 0;
    static public final int ERROR = 1;
    static public final int WARNING = 2;
    static public final int INFO = 3;
    static public final int DEBUG = 4;

    static private int level;
    
    static private Vector<AbbozzaLoggerListener> _listeners = new Vector<AbbozzaLoggerListener>();
    static private ByteArrayOutputStream errorLogger = new ByteArrayOutputStream();
    static private Vector<OutputStream> streams;

    static {
        streams = new Vector<OutputStream>();
    }
    
    public static void init() {
        level = 1;
        System.setErr(new PrintStream(errorLogger));
    }
    
    
    public static void resetErr() {
        errorLogger.reset();
    }
    
    public static String getErr() {
        String result = errorLogger.toString();
        errorLogger.reset();
        return result;
    }
    
    public static void addListener(AbbozzaLoggerListener listener) {
        if ( !_listeners.contains(listener) ) {
            _listeners.add(listener);
        }
    }
    
    public static void removeListener(AbbozzaLoggerListener listener) {
       _listeners.remove(listener);
    }
    
    private static void fire(String message) {
        for ( AbbozzaLoggerListener listener: _listeners) {
            listener.logged(message);
        }
    }
    
    public static void registerStream(OutputStream stream) {
        if ( !streams.contains(stream) ) {
            streams.add(stream);
        }
    }
    
    public static void unregisterStream(OutputStream stream) {
        streams.removeElement(stream);
    }

    public static void setLevel(int lvl) {
        level = lvl;
    }

    public static int getLevel() {
        return level;
    }

    public static void out(String msg) {
        if (level >= DEBUG ) {
            write("[out] : " + msg);
            fire("[out] : " + msg);
        }
    }

    public static void debug(String msg) {
        out(msg,DEBUG);
    }

    public static void warn(String msg) {
        out(msg,WARNING);
    }

    public static void info(String msg) {
        out(msg,INFO);
    }
    
    public static void force(String msg) {
        out(msg,-1);
    }

    public static void out(String msg, int lvl) {
        if (lvl <= level) {
            String prefix = "";
            switch (lvl) {
                case INFO    : prefix = "[inf] : "; break;
                case WARNING : prefix = "[wrn] : "; break;
                case DEBUG   : prefix = "[dbg] : "; break;
                default      : prefix = ""; break;
            }                    
            write(prefix + msg);
            fire(prefix + msg);
        }
    }

    public static void err(String msg) {
        if ( level >= ERROR ) {
            write("[err] : " + msg);
            fire("[err] : " + msg);
        }
    }
    
    public static void stackTrace(Exception ex) {
        if (level >= ERROR ) {
            write("[err] : Stack trace for exception");
            ex.printStackTrace(System.out);
        }
    }
    
    private static void write(String msg) {
        for (OutputStream stream : streams) {
            try {
                stream.write(msg.getBytes());
                stream.write('\n');
            } catch (Exception ex) {}
        }
    }
}
