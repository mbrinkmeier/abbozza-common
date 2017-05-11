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
import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.AbbozzaServer;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.jar.JarFile;
import java.util.zip.ZipEntry;

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
    public void handle(HttpExchange exchg) throws IOException {
        /**
         * The request has the following form:
         *  task/<path>?<anchor>
         * 
         * <anchor> is an anchor path
         * <path> is a path realtive to the current anchor path
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
                taskContext = new URL("file://" + this._abbozzaServer.getConfiguration().getTaskPath());
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
        InputStream is = sketch.openStream();

        byte[] bytearray = null;

        if ( is != null) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            int reads = is.read(); 
            while(reads != -1){ 
                baos.write(reads); 
                reads = is.read(); 
            } 
            bytearray = baos.toByteArray();   
                    
            AbbozzaLogger.out("TaskHandler: " + sketch.toString() + " received", AbbozzaLogger.INFO);
        } else {
            /*
            bytearray = getBytes(path);
                
            if (bytearray == null) {
                AbbozzaLogger.out("TaskHandler: " + sketch.toString() + " not found! Looking in jars!", AbbozzaLogger.INFO);
                AbbozzaLogger.out("TaskHandler: Looking for " + "/tasks/" + AbbozzaServer.getInstance().getSystem() + sketch.toString(), AbbozzaLogger.INFO);
                // String result = "abbozza! : " + path + " not found in task directory! Looking in jars.";
                bytearray = this._jarHandler.getBytes("/tasks/" + AbbozzaServer.getInstance().getSystem() + path);
            }
        
            if (bytearray == null) {        
                AbbozzaLogger.out("TaskHandler: tasks" + path + " not found!", AbbozzaLogger.INFO);     
                String result = "abbozza! : " + path + " not found!";
                exchg.sendResponseHeaders(400, result.length());
                os.write(result.getBytes());
                os.close();
                return;
            }
            */
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
    
    /*
    public InputStream getStream(String path) throws IOException {
        URL url;
        try {
            url = new URL(path);
        } catch (MalformedURLException ex) {
            AbbozzaLogger.out("TaskHandler : malformed URL " + path + " requested",AbbozzaLogger.DEBUG);
            return null;
        }

        URLConnection conn = url.openConnection();
        InputStream in = conn.getInputStream();        
        
        return in;
    }
    */
    
    /*
    public byte[] getBytes(String path) throws IOException {

        // Check if there is a jar in the path
        if ( path.contains(".jar") ) {
            int index = path.indexOf(".jar")+4;
            String jarPath = path.substring(0, index );
            AbbozzaLogger.out("TaskHandler : File in jar " + jarPath + " requested",AbbozzaLogger.DEBUG);
            JarFile jarFile = new JarFile(jarPath);
            return getBytesFromJar(jarFile,path.substring(index));
        }
        
        File file = new File(path); 
        if (!file.exists()) {
            return null;
        }
        
        String taskPath = this._abbozzaServer.getConfiguration().getTaskPath();
        if (!file.getCanonicalPath().startsWith(taskPath)) {
            return null;
        }
        
        FileInputStream fis = new FileInputStream(file);

        byte[] bytearray = new byte[(int) file.length()];
        BufferedInputStream bis = new BufferedInputStream(fis);
        bis.read(bytearray, 0, bytearray.length);
        bis.close();

        return bytearray;
    }
    */
    
    /*
    public byte[] getBytesFromJar(JarFile jarFile, String path) throws IOException {
        
        if ( path.equals("")  ) {
            path = "start.abz";
        }
        
        AbbozzaLogger.out("TaskHandler : Reading bytes from " + path + " in " + jarFile.getName(),AbbozzaLogger.DEBUG);
        
        path = path.substring(1, path.length());
        ZipEntry entry = jarFile.getEntry(path);
        InputStream fis = jarFile.getInputStream(entry);

        if (fis == null) {
            return null;
        }

        byte[] bytearray = new byte[(int) entry.getSize()];
        BufferedInputStream bis = new BufferedInputStream(fis);
        bis.read(bytearray, 0, bytearray.length);
        bis.close();

        return bytearray;
    }
    */
}
