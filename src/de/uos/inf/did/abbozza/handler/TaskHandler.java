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
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;

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
         * 
         * <path> is a path relative to the query of the refering uri
         **/
        
        URI uri;
        String query = exchg.getRequestURI().getQuery();
        String path = exchg.getRequestURI().getPath();
        URI taskContext = null;
        
        
        URI refererURI; // The referring uri
        try {
            // Get the referer from the equest
            refererURI = new URI(exchg.getRequestHeaders().getFirst("referer"));
            AbbozzaLogger.debug("TaskHandler: referer query = " + refererURI.getQuery() );
        } catch (URISyntaxException ex) {
            AbbozzaLogger.err("TaskHandler: could not determine referer for request " + exchg.getRequestURI().toString() );
            // refererURI = _abbozzaServer.getTaskContext();
            try {
                refererURI = new URI(_abbozzaServer.getRootURL());
            } catch (URISyntaxException ex1) {
                AbbozzaLogger.err("TaskHandler: could not determine root URL" );
                refererURI = exchg.getRequestURI();
            }
        }
        
        
        // If an anchor path is given, change it
        if (query != null) {
            AbbozzaLogger.out("TaskHandler: New task-anchor path given: " + query,AbbozzaLogger.DEBUG);
            try {
                // If the query is a wellformed URL use it as anchor
                uri = new URI(URLEncoder.encode(query,"UTF-8"));
                _abbozzaServer.setTaskContext(uri);
                taskContext = uri;
                AbbozzaLogger.out("TaskHandler: loading from given url " + path ,AbbozzaLogger.DEBUG);                
            } catch (URISyntaxException ex) {
                try {
                    // If it isn't a wellformed URL reset the anchor to the standard task path
                    taskContext = new URI("file://" + URLEncoder.encode(this._abbozzaServer.getConfiguration().getFullTaskPath(),"UTF-8"));
                } catch (URISyntaxException ex1) {
                    AbbozzaLogger.err("TaskHandler: Wrong URI Syntax : file://" + this._abbozzaServer.getConfiguration().getFullTaskPath());
                }
                _abbozzaServer.setTaskContext(taskContext);
            }
        } else {
            try {
                taskContext = new URI(refererURI.getQuery());
                AbbozzaLogger.debug("TaskHandler: using anchor : " + taskContext);            
            } catch (URISyntaxException ex) {
                AbbozzaLogger.err("TaskHandler: could not determine referer for request " + exchg.getRequestURI().toString() );
                try {
                    taskContext = new URI(_abbozzaServer.getSketchbookPath());
                } catch (URISyntaxException ex1) {
                    taskContext = null;
                }
            }
        }
        
        OutputStream os = exchg.getResponseBody();
        InputStream is = null; 

        // Use the new anchor path 
        String taskPath = path.substring(6);
        URL sketch = new URL(taskContext.toURL(), taskPath);
        AbbozzaLogger.debug("TaskHandler: taskContext = " + taskContext.toString());        
        AbbozzaLogger.debug("TaskHandler: requested path = " + taskPath);        
        AbbozzaLogger.debug("TaskHandler: " + sketch.toString() + " requested");

        if ( sketch.toString().length() == 0 ) {
            // URI context = _abbozzaServer.getTaskContext();
            exchg.sendResponseHeaders(404, taskContext.toString().length() );
            os.write(taskContext.toString().getBytes(), 0, taskContext.toString().length());
            os.close();
            return;
        }
        
        // Open the requested uri
        try {
            is = sketch.openStream();
        } catch (IOException ex) {
            AbbozzaLogger.err("TaskHandler: Could not open " + sketch.toString());
            AbbozzaLogger.err("TaskHandler: " + ex.getLocalizedMessage());
            // Try the absolute version, if possible
            taskPath = taskContext.toString();
            if ( taskPath.startsWith("jar:") && (taskPath.indexOf('!') != -1) ) {
                taskPath = taskPath.substring(0,taskPath.indexOf('!')+1) + "/" + path.substring(6);
                sketch = new URL(taskPath);
                AbbozzaLogger.info("TaskHandler: Trying " + sketch.toString());
                is = sketch.openStream();
            } else {
                is = null;
            }
        }

        byte[] bytearray = null;
        byte[] buf = new byte[1024];

        if ( is != null ) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();            
            while(is.available() > 0){
                int count = is.read(buf);
                baos.write(buf, 0, count);
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
