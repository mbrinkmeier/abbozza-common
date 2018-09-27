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
 * @fileoverview ... @author michael.brinkmeier@uni-osnabrueck.de (Michael
 * Brinkmeier)
 */
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;

/**
 *
 * @author mbrinkmeier
 */
public class TaskHandler extends AbstractHandler {
    
    private JarDirHandler _jarHandler;
    
    public TaskHandler(AbbozzaServer abbozza, JarDirHandler jarHandler) {
        super(abbozza);
        this._jarHandler = jarHandler;
    }
   
    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        /**
         * The request has the following form:
         *  task/<path>?<anchor>
         * 
         * <anchor> is an anchor path
         * <path> is a path relative to the current anchor path
         **/
        URL url;
        String query = exchg.getRequestURI().getQuery();
        String path = exchg.getRequestURI().getPath();
        URL taskContext;
        
        // If an anchor path is given, change it
        if (query != null) {
            AbbozzaLogger.out("TaskHandler: New task-anchor path given: " + query,AbbozzaLogger.DEBUG);
            try {
                // If the query is a wellformed URL use it as anchor
                url = new URL(query);
                _abbozzaServer.setTaskContext(url);
                taskContext = url;
                AbbozzaLogger.out("TaskHandler: loading from given url " + path ,AbbozzaLogger.DEBUG);                
            } catch (MalformedURLException ex) {
                // If it isn't a wellformed URL reset the anchor to the standard task path
                taskContext = new URL("file://" + this._abbozzaServer.getConfiguration().getFullTaskPath());
                _abbozzaServer.setTaskContext(taskContext);
            }
        } else {
            AbbozzaLogger.out("TaskHandler: using anchor : " + _abbozzaServer.getTaskContext().toString(),AbbozzaLogger.DEBUG);            
            taskContext = _abbozzaServer.getTaskContext();
        }
        
        // Use the new anchor path 
        URL sketch = new URL(taskContext,path.substring(6));
        AbbozzaLogger.out("TaskHandler: " + sketch.toString() + " requested", AbbozzaLogger.INFO);

        OutputStream os = exchg.getResponseBody();
        InputStream is; 
        
        try {
            is = sketch.openStream();
        } catch (IOException ex) {
            // Try the absolute version, if possible
            String taskPath = taskContext.toString();
            if ( taskPath.startsWith("jar:") && (taskPath.indexOf('!') != -1) ) {
                taskPath = taskPath.substring(0,taskPath.indexOf('!')+1) + "/" + path.substring(6);
                sketch = new URL(taskPath);
                is = sketch.openStream();
            } else {
                is = null;
            }
            
        }

        byte[] bytearray = null;

        if ( is != null ) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int reads = is.read(); 
            while(reads != -1){ 
                baos.write(reads); 
                reads = is.read(); 
            } 
            bytearray = baos.toByteArray();   
                    
            AbbozzaLogger.out("TaskHandler: " + sketch.toString() + " received", AbbozzaLogger.INFO);
        } else {
            return;
        }
        
        Headers responseHeaders = exchg.getResponseHeaders();
        path = sketch.getPath();
        if (path.endsWith(".css")) {
            responseHeaders.set("Content-Type", "text/css; charset=utf-8");
        } else if (path.endsWith(".js")) {
            responseHeaders.set("Content-Type", "text/javascript; charset=utf-8");
        } else if (path.endsWith(".xml")) {
            responseHeaders.set("Content-Type", "text/xml; charset=utf-8");
        } else if (path.endsWith(".svg")) {
            responseHeaders.set("Content-Type", "image/svg+xml");            
        } else if (path.endsWith(".abz")) {
            responseHeaders.set("Content-Type", "text/xml; charset=utf-8");            
        } else if (path.endsWith(".png")) {
            responseHeaders.set("Content-Type", "image/png");
        } else if (path.endsWith(".html")) {
            responseHeaders.set("Content-Type", "text/html; charset=utf-8");
        } else {
            responseHeaders.set("Content-Type", "text/text; charset=utf-8");            
        }

        // ok, we are ready to send the response.
        exchg.sendResponseHeaders(200, bytearray.length);
        os.write(bytearray, 0, bytearray.length);
        os.close();    
    }
        
}
