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
 * @fileoverview ...
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.monitor.AbbozzaMonitor;
import de.uos.inf.did.abbozza.tools.GUITool;
import java.io.IOException;
import java.io.StringReader;
import java.net.URLDecoder;
import java.util.Properties;

/**
 *
 * @author michael
 */
public class MonitorHandler extends AbstractHandler {

    private AbbozzaMonitor monitor;
    
    public MonitorHandler(AbbozzaServer abbozza) {
        super(abbozza);
    }

    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        
        String path = exchg.getRequestURI().getPath();
        boolean result = false;
        if (path.endsWith("/monitor")) {
            result = open();
        } else {
            result = resume();
        }
        if (result) {
            String query = URLDecoder.decode(exchg.getRequestURI().getQuery(),"UTF-8");
            if ( query != null ) {
              query = query.replace('&', '\n');
              Properties props = new Properties();
              props.load(new StringReader(query));
              sendMessage(props.getProperty("msg"));
            }
            sendResponse(exchg, 200, "text/plain", "");
        } else {
            sendResponse(exchg, 440, "text/plain", "");
        }
    }
    
    
    public boolean open() {    
        AbbozzaLogger.out("MonitorHandler: Open monitor", AbbozzaLogger.INFO );
        if (monitor != null) {
            if (resume()) {
                GUITool.bringToFront(monitor);
                return true;
            } else {
                return false;
            }
        }

        String port = this._abbozzaServer.getSerialPort();
        int rate = this._abbozzaServer.getBaudRate();
        
        if (port != null) {
            AbbozzaLogger.out("MonitorHandler: Port discovered: " + port , AbbozzaLogger.INFO);
            AbbozzaLogger.out("MonitorHandler: Initializing ... " , AbbozzaLogger.INFO);        
            try {
                monitor = new AbbozzaMonitor(port,rate);
            } catch (Exception ex) {
                AbbozzaLogger.err(ex.getLocalizedMessage());
            }
            AbbozzaLogger.out("MonitorHandler: Monitor initialized" , AbbozzaLogger.INFO);
        } else {
            AbbozzaLogger.out("MonitorHandler: No board discovered" , AbbozzaLogger.INFO);
            monitor = new AbbozzaMonitor();
        }
        
        try {
            monitor.open();
            monitor.setVisible(true);
            monitor.toFront();
            
            // monitor.setAlwaysOnTop(true);
        } catch (Exception ex) {
            AbbozzaLogger.err(ex.getLocalizedMessage());
            return false;
        }
        return true;
    }

    public boolean resume() {
        AbbozzaLogger.out("MonitorHandler: Resume monitor", AbbozzaLogger.INFO );
        if (monitor == null) {
            return false;
        }
        try {
            monitor.resume();
        } catch (Exception ex) {
            return false;
        }
        return true;
    }
    
    public void suspend() {
        try {
            if (monitor != null) {
                monitor.suspend();
            }
        } catch (Exception ex) {
        }
    }

    public void close() {
        monitor = null;
    }

    public AbbozzaMonitor getMonitor() {
        return monitor;
    }
    
    private void sendMessage(String msg) {
        if ( msg == null ) return;
        
        AbbozzaLogger.debug("MonitorHandler: Send message " + msg + " to monitor");
        monitor.addToUpdateBuffer(msg + "\n");
    }
    
}
