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
 * @fileoverview This class implements a thread which retreives entries from its
 * SerialManager's message queue and sens it via the given serial port.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.monitor;

import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.handler.SerialHandler;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author michael
 */
public class Sender extends Thread {
   
    private boolean stopped;
    private AbbozzaMonitor _monitor;
    private String _port;
    
    public Sender(AbbozzaMonitor manager) {
        this._monitor = manager;
        this._port = manager.getBoardPort();
    }
    
    public void portChanged() {
        this._port = this._monitor.getBoardPort();        
    }
    
    public void run() {
        stopped = false;
        while ( !stopped ) {
            if ( _monitor._msgQueue.peek() != null ) {
                Message msg = _monitor._msgQueue.poll();
                sendMsg(msg);
            } else {
                // Sleep for 100 milliseconds if no message is enqueued
                try {
                    this.sleep(100);
                } catch (InterruptedException ex) {
                    stopped = true;
                }
            }            
        }
    }
    
    private void sendMsg(Message msg) {
        
        // Check if web message
        if ( msg.getHandler() == null ) {
            // If not, simply write it
            AbbozzaLogger.out("AbbozzaMonitor: Sending " + msg.toString() + " to board",AbbozzaLogger.DEBUG);            
            _monitor.writeMessage(msg.toString());  
        } else {
            // Otherwise        
            if (_monitor.getBoardPort() == null ) {
                SerialHandler handler = msg.getHandler();
                if (handler != null) {
                    try {
                        handler.sendResponse(msg.getHttpExchange(), 400, "text/plain", "No board connected!");
                    } catch (IOException ex) {
                        Logger.getLogger(Sender.class.getName()).log(Level.SEVERE, null, ex);
                    }
                }
            } else {        
                AbbozzaLogger.out("AbbozzaMonitor: Sending " + msg.toString() + " to board",AbbozzaLogger.DEBUG);            
                if (msg.getTimeout() == 0) {
                    _monitor.writeMessage(msg.toString());  
                } else {
                    _monitor.writeMessage(msg.toString());  
                    msg.startTimeOut();
                    _monitor.addWaitingMsg(msg);
                }
            }
        }
    }
 
    protected void stopIt() {
        stopped = true;
    }
}
