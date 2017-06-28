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
import com.sun.net.httpserver.HttpServer;
import de.uos.inf.did.abbozza.AbbozzaLocale;
import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.AbbozzaServer;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JOptionPane;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 *
 * @author michael
 */
public class PluginManager implements HttpHandler {

    private AbbozzaServer _abbozza;
    private Hashtable<String,Plugin> _plugins;
   
    
    
    public PluginManager(AbbozzaServer server) {
        AbbozzaLogger.out("PluginManager: Started",AbbozzaLogger.INFO);
        this._abbozza = server;
        this._plugins = new Hashtable<String,Plugin>();
        this.detectPlugins();        
    }
    
    
    private void detectPlugins() {
        // Check local dir
        File path = new File(this._abbozza.getGlobalPluginPath());
        AbbozzaLogger.out("PluginManager: Checking global dir " + path,AbbozzaLogger.INFO);    
        File[] dirs = null;
        dirs = path.listFiles(new FileFilter() {
            public boolean accept(File pathname) {
                return pathname.isDirectory();
            }
        });
        
        addDirs(dirs);
        
        File [] jars = null;
        jars = path.listFiles(new FileFilter() {
           public boolean accept(File pathname) {
               return pathname.getName().endsWith(".jar");
           } 
        });
        
        addJars(jars);
        
        
        // Check global dir
        path = new File(this._abbozza.getLocalPluginPath());
        AbbozzaLogger.out("PluginManager: Checking local dir " + path,AbbozzaLogger.INFO);        
        dirs = path.listFiles(new FileFilter() {
            public boolean accept(File pathname) {
                return pathname.isDirectory();
            }
        });

        addDirs(dirs);
        
        jars = null;
        jars = path.listFiles(new FileFilter() {
           public boolean accept(File pathname) {
               return pathname.getName().endsWith(".jar");
           } 
        });
        
        addJars(jars);

    }
    
    private void addDirs(File dirs[]) {
        Plugin plugin;
        Document pluginXml;
        
        if ((dirs != null) && (dirs.length > 0)) {
            for (int i=0; i < dirs.length; i++) {
                try {
                    pluginXml = getPluginXml(dirs[i].toURI().toURL());
                    if ( pluginXml != null ) {
                        plugin = new Plugin(dirs[i].toURI().toURL(),pluginXml);
                        if (plugin.getId() != null ) {
                            AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " found in " + dirs[i].toString() ,AbbozzaLogger.INFO);
                            if ( checkRequirements(plugin) ) {
                                AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " loaded",AbbozzaLogger.INFO);
                                this._plugins.put(plugin.getId(), plugin);
                            } else {
                                
                            }
                        }
                    }
                } catch (MalformedURLException ex) {
                    AbbozzaLogger.stackTrace(ex);
                }
            }
        }           
    }

    protected void addJars(File jars[]) {
        Plugin plugin;
        Document pluginXml;
        URL pluginUrl;
        
        if ((jars != null) && (jars.length > 0)) {
            for (int i=0; i < jars.length; i++) {
                try {
                    pluginUrl = new URL("jar:" + jars[i].toURI().toString() + "!/");
                    pluginXml = getPluginXml(pluginUrl);
                    if ( pluginXml != null ) {
                        plugin = new Plugin(pluginUrl,pluginXml);
                        if (plugin.getId() != null ) {
                            AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " found in " + jars[i].toString() ,AbbozzaLogger.INFO);
                            if ( checkRequirements(plugin)) {
                                AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " loaded",AbbozzaLogger.INFO);
                                this._plugins.put(plugin.getId(), plugin);
                            }
                        }
                    }
                } catch (MalformedURLException ex) {
                    Logger.getLogger(PluginManager.class.getName()).log(Level.SEVERE, null, ex);
                }
            }
        }           
    }
       
    /**
     * Get an iterator over all plugins
     * 
     * @return The iterator
     */
    public Enumeration<Plugin> plugins() {
        return this._plugins.elements();
    }

    public Plugin getPlugin(String id) {
        return this._plugins.get(id);
    }


    public void registerPluginHandlers(HttpServer server) {
        Enumeration<Plugin> plugins = _plugins.elements();
        while ( plugins.hasMoreElements()) {
            Plugin plugin = plugins.nextElement();
            if (plugin.getHttpHandler() != null) {
                server.createContext("/abbozza/plugin/" + plugin.getId(), plugin.getHttpHandler());
                AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " registered HttpHandler",AbbozzaLogger.INFO);
            }
        }
    }
    
    
    public void mergeFeatures(Document features) {
        NodeList roots = features.getElementsByTagName("features");
        if (roots.getLength() == 0 ) return;
        Node root = roots.item(0);
        
        Enumeration<Plugin> plugins = _plugins.elements();
        while ( plugins.hasMoreElements()) {
            Plugin plugin = plugins.nextElement();
            Node feature = plugin.getFeature();
            if (plugin.isActivated() && (feature != null)) {
                try {
                    features.adoptNode(feature);
                    root.appendChild(feature);
                } catch (Exception ex) {
                    AbbozzaLogger.stackTrace(ex);
                }
            }
        }
    }

    @Override
    public void handle(HttpExchange exchg) throws IOException {
        String response = "";
        String path = exchg.getRequestURI().getPath();
        OutputStream os = exchg.getResponseBody();
        Headers responseHeaders = exchg.getResponseHeaders();

        AbbozzaLogger.out("PluginManager: " + path + " requested",AbbozzaLogger.DEBUG);
        
        if (path.equals("/abbozza/plugins/plugins.js")) {
            Enumeration<Plugin> plugins = _plugins.elements();
            while ( plugins.hasMoreElements()) {
                Plugin plugin = plugins.nextElement();
                if ( plugin.isActivated() ) {
                    response = response + "\n" + plugin.getJavaScript();
                }
            }
            responseHeaders.set("Content-Type", "text/javascript");
        } else {
            response = "Found plugins:";
            Enumeration<Plugin> plugins = _plugins.elements();
            while ( plugins.hasMoreElements()) {
                Plugin plugin = plugins.nextElement();
                response = response + "\n\t" + plugin.getId();
                if ( plugin.isActivated() ) {
                    response = response + " [activated]";
                } else {
                    response = response + " [deactivated]";                    
                }
            }
            responseHeaders.set("Content-Type", "text/plain");
        }
        exchg.sendResponseHeaders(200, response.length());
        os.write(response.getBytes());
        os.close();
    }
    
    /**
     * This operation returns a Document containing the locales of all registered plugins.
     * 
     * @return 
     */
    public void addLocales(String locale, Element root) {
        try {
            Document locales;
            
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            
            locales = builder.newDocument();

            // Iterate through all plugins
            Enumeration<Plugin> plugins = _plugins.elements();
            while ( plugins.hasMoreElements()) {
                Plugin plugin = plugins.nextElement();
                Element pluginLocale = plugin.getLocale(locale);
                if (pluginLocale != null) {
                    root.getOwnerDocument().adoptNode(pluginLocale);
                    root.appendChild(pluginLocale);
                    pluginLocale.setAttribute("id",plugin.getId() + "_" + locale);
                }
            }
            
        } catch (ParserConfigurationException ex) {
            AbbozzaLogger.stackTrace(ex);
        }
    }
    
    private Document getPluginXml(URL url) {
        Document pluginXml = null;
        URL pluginUrl = null;
        
        try {
            pluginUrl = new URL(url.toString()+"plugin.xml");
                        
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();

            pluginXml = builder.parse(pluginUrl.openStream());
        } catch (ParserConfigurationException ex) {
            pluginXml = null;
            AbbozzaLogger.err("PluginManager: Could not parse " + pluginUrl);
            AbbozzaLogger.stackTrace(ex);
        } catch (SAXException ex) {
            pluginXml = null;
            AbbozzaLogger.err("PluginManager: Could not parse " + pluginUrl);
            AbbozzaLogger.stackTrace(ex);
        } catch (IOException ex) {
            pluginXml = null;
            AbbozzaLogger.err("PluginManager: Could not find " + pluginUrl);
        }
        return pluginXml;        
    }

    private boolean checkRequirements(Plugin plugin) {
        String libs = "";
        if ( !plugin.getSystem().equals( this._abbozza.getSystem()) ) {
            return false;
        }
        boolean foundAll = true;
        Node requirements = plugin.getRequirements();
        if ( requirements == null ) return true;
        Node child = requirements.getFirstChild();
        while ( child != null) {
            if ( child.getNodeName().equals("library")) {
                String name = child.getAttributes().getNamedItem("name").getNodeValue();
                // If a required library is not found, reject the plugin
                if ( !this._abbozza.checkLibrary(name) ) {
                    AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " : required library " + name + " not found",AbbozzaLogger.INFO);
                    libs = libs + "\n- " + name;
                    foundAll = false;
                }
            }
            child = child.getNextSibling();
        }
        if ( !foundAll ) {
             JOptionPane.showMessageDialog(null, "Plugin " + plugin.getName() + "deactivated!\n\nRequired libraries are missing:" + libs,"Missing Libraries",JOptionPane.INFORMATION_MESSAGE); 
        }
        return foundAll;
    }
}
