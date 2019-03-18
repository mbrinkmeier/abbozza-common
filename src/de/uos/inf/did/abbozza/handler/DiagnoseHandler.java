/*
 * Copyright 2019 Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.core.AbbozzaVersion;
import java.io.File;
import java.io.IOException;
import java.net.URI;

/**
 *
 * @author Michael Brinkmeier <michael.brinkmeier@uni-osnabrueck.de>
 */
public class DiagnoseHandler extends AbstractHandler {

    private AbbozzaServer abbozza;
    
    public DiagnoseHandler(AbbozzaServer server) {
        abbozza = server;
    }
    
    
    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        String result = "";
        
        result = "<BODY>";
        
        result += "<H1>abbozza! diagnose</H1>";
        result += "System: " + abbozza.getSystem() + "<br/>";
        result += "Version: " + AbbozzaVersion.asString() + "<br/>";
        result += "<br/>";
        
        result += "<h2>Server</h2><ul>";
        result += "<li>Hostname: " + abbozza.getHostName() + "</li>";
        result += "<li>IP4 Address: " + abbozza.getIp4Address() + "</li>";
        result += "<li>IP6 Address: " + abbozza.getIp6Address() + "</li>";
        result += "<li>Port: " + abbozza.getServerPort() + "</li>";
        result += "</ul>";
        
        result += "<h2>Paths</h2><ul>";

        result += "<li><tt>userPath : " + abbozza.getUserPath() + "</tt>";
        result += checkWritableDir(abbozza.getUserPath());
        result += "</li>";
        
        result += "<li><tt>configPath : " + abbozza.getConfigPath() + "</tt>";
        result += checkWritableFile(abbozza.getConfigPath());
        result += "</li>";

        result += "<li><tt>jarPath : " + abbozza.getJarPath() + "</tt>";
        result += checkReadableDir(abbozza.getJarPath());
        result += "</li>";

        result += "<li><tt>abbozzaPath : " + abbozza.getAbbozzaPath() + "</tt>";
        result += checkReadableDir(abbozza.getAbbozzaPath());
        result += "</li>";

        result += "<li><tt>globalPluginPath : " + abbozza.getGlobalPluginPath() + "</tt>";
        result += checkReadableDir(abbozza.getAbbozzaPath());
        result += "</li>";

        result += "<li><tt>localPluginPath : " + abbozza.getLocalPluginPath() + "</tt>";
        result += checkWritableDir(abbozza.getAbbozzaPath());
        result += "</li>";

        result += getRegisteredPaths();
   
        result += "</ul>";
        
        result += abbozza.runSystemDiagnose(this);
        
        result += "</BODY>";
        
        this.sendResponse(exchg, 200, "text/html", result);
    }
    

    
    public String checkWritableDir(String path) {
        File file = new File(path);
        
        if (!file.exists()) {
            return "<span color='red'> DOESN'T EXIST</span>";
        }
        if  ( !file.isDirectory() ) {
            return "<span color='red'> ISN'T AN DIRECTORY</span>";                
        }
        if ( !file.canWrite() ) {
            return "<span color='red'> ISN'T WRITABLE</span>";                                
        }
        return "<span color='red'> is a writable directory</span>";
    }
    

    public String checkReadableDir(String path) {
        File file = new File(path);
        
        if (!file.exists()) {
            return "<span color='red'> DOESN'T EXIST</span>";
        }
        if  ( !file.isDirectory() ) {
            return "<span color='red'> ISN'T AN DIRECTORY</span>";                
        }
        if ( !file.canRead() ) {
            return "<span color='red'> ISN'T READABLE</span>";                                
        }
        return "<span color='red'> is a readable directory</span>";
    }

    public String checkWritableFile(String path) {
        File file = new File(path);
        
        if (!file.exists()) {
            return "<span color='red'> DOESN'T EXIST</span>";
        }
        if  ( file.isDirectory() ) {
            return "<span color='red'> IS AN DIRECTORY</span>";                
        }
        if ( !file.canWrite() ) {
            return "<span color='red'> ISN'T WRITABLE</span>";                                
        }
        return "<span color='red'> is a writable file</span>";
    }
    
    public String checkReadableFile(String path) {
        File file = new File(path);
        
        if (!file.exists()) {
            return "<span color='red'> DOESN'T EXIST</span>";
        }
        if  ( file.isDirectory() ) {
            return "<span color='red'> IS AN DIRECTORY</span>";                
        }
        if ( !file.canRead() ) {
            return "<span color='red'> ISN'T READABLE</span>";                                
        }
        return "<span color='red'> is a readable file</span>";
    }

    private String getRegisteredPaths() {
        String result = "<br/><LI>Registered paths<UL>";
        
        JarDirHandler handler = abbozza.getJarHandler();
        for ( URI uri : handler.getEntries() ) {
            result += "<LI><tt>" + uri.toString();
            result += "</tt></li>";
        }
        return result + "</UL></LI>";
    }
}
