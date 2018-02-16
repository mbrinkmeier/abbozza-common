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
package de.uos.inf.did.abbozza.plugin;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import java.io.IOException;
import java.io.OutputStream;

/**
 *
 * @author michael
 */
public class PluginHandler implements HttpHandler {

    protected Plugin _plugin;
    
    public PluginHandler() {
        this._plugin = null;
    }
    
    public void setPlugin(Plugin plugin) {
        this._plugin = plugin;
    }
    
    @Override
    final public void handle(HttpExchange exchg) throws IOException {
        // Check if the plugin is activated
        if ( !this._plugin.isActivated()) {
            OutputStream os = exchg.getResponseBody();
            Headers responseHeaders = exchg.getResponseHeaders();
            String response = this._plugin.getId() + " is deactivated";
            responseHeaders.set("Content-Type", "text/plain");
            exchg.sendResponseHeaders(404, response.length());
            os.write(response.getBytes());
            os.close();
        } else {
            handleRequest(exchg);
        }
    }
    
    public void handleRequest(HttpExchange exchg) throws IOException {
        OutputStream os = exchg.getResponseBody();
        Headers responseHeaders = exchg.getResponseHeaders();

        String path = exchg.getRequestURI().getPath();
        AbbozzaLogger.out("PluginHandler: " + path + " requested",AbbozzaLogger.INFO);
        
        String response = _plugin.getId();
        
        responseHeaders.set("Content-Type", "text/plain");
        exchg.sendResponseHeaders(200, response.length());
        os.write(response.getBytes());
        os.close();        
    }
    
}
