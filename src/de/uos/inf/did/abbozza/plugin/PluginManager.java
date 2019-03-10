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
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.handler.JarDirHandler;
import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Collection;
import java.util.HashMap;
import javax.swing.JOptionPane;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.DOMException;
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

    private final AbbozzaServer _abbozza;
    private final HashMap<String, Plugin> _plugins;

    /**
     * Initialize a PluginMAnager and connect it to the Server.
     * 
     * @param server The abbozza! server loading the plugin.
     */
    public PluginManager(AbbozzaServer server) {
        AbbozzaLogger.out("PluginManager: Started", AbbozzaLogger.INFO);
        this._abbozza = server;
        this._plugins = new HashMap<>();
        this.detectPlugins();
    }

    /**
     * Find all installed plugins.
     */
    private void detectPlugins() {       
        // Check local dir
        File path = new File(this._abbozza.getGlobalPluginPath());
        AbbozzaLogger.out("PluginManager: Checking global dir " + path, AbbozzaLogger.INFO);
        installUpdates(path);
        
        File[] dirs;
        dirs = path.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                return ( pathname.isDirectory() && !pathname.getName().contains("__"));
            }
        });
        addDirs(dirs);

        File[] jars;
        jars = path.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                return pathname.getName().endsWith(".jar")  && !pathname.getName().contains("__");
            }
        });
        addJars(jars);

        // Check global dir
        path = new File(this._abbozza.getLocalPluginPath());
        AbbozzaLogger.out("PluginManager: Checking local dir " + path, AbbozzaLogger.INFO);
        installUpdates(path);
        
        dirs = path.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                return pathname.isDirectory() && !pathname.getName().contains("__");
            }
        });
        addDirs(dirs);

        jars = path.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                return pathname.getName().endsWith(".jar") && !pathname.getName().contains("__");
            }
        });
        addJars(jars);
        
    }

    /**
     * Add plugins form directories.
     * 
     * @param dirs 
     */
    private void addDirs(File dirs[]) {
        Plugin plugin;
        Document pluginXml;

        if ((dirs != null) && (dirs.length > 0)) {
            for (File dir : dirs) {
                try {
                    AbbozzaLogger.debug("PluginManager: Checking jar:" + dir.toURI().toString());
                    pluginXml = getPluginXml(dir.toURI().toURL());
                    if (pluginXml != null) {
                        plugin = new Plugin(dir.toURI().toURL(), pluginXml);
                        if (plugin.getId() != null) {
                            AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " found in " + dir.toString(), AbbozzaLogger.INFO);
                            if (checkRequirements(plugin)) {
                                AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " loaded", AbbozzaLogger.INFO);
                                this._plugins.put(plugin.getId(), plugin);
                                this._abbozza.registerPlugin(plugin);
                            } else {

                            }
                        }
                    }
                }catch (MalformedURLException ex) {
                    AbbozzaLogger.stackTrace(ex);
                }
            }
        }
    }

    /**
     * Add a plugin from jar files.
     * 
     * @param jars A directory containing the plugin Jars.
     */
    protected void addJars(File jars[]) {
        Plugin plugin;
        Document pluginXml;
        URL pluginUrl;

        if ((jars != null) && (jars.length > 0)) {
            for (File jar : jars) {
                try {
                    AbbozzaLogger.debug("PluginManager: Checking jar:" + jar.toURI().toString() + "!/");
                    pluginUrl = new URL("jar:" + jar.toURI().toString() + "!/");
                    pluginXml = getPluginXml(pluginUrl);
                    if (pluginXml != null) {
                        plugin = new Plugin(pluginUrl, pluginXml);
                        if (plugin.getId() != null) {
                            AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " found in " + jar.toString(), AbbozzaLogger.INFO);
                            if (checkRequirements(plugin)) {
                                AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " loaded", AbbozzaLogger.INFO);
                                this._plugins.put(plugin.getId(), plugin);
                                this._abbozza.registerPlugin(plugin);
                            }
                        }
                    }
                } catch (MalformedURLException ex) {
                    AbbozzaLogger.err("PluginManager: Malformed URL " + "jar:" + jar.toURI().toString() + "!/");
                }
            }
        }
    }

    
    protected void installUpdates(File path) {
        // Check directories
        /*
        File[] dirs = null;
        dirs = path.listFiles(new FileFilter() {
            public boolean accept(File pathname) {                
                return ( pathname.isDirectory() && pathname.getName().contains("___") );
            }
        });
        
        if ( (dirs != null) && (dirs.length>0) ) {        
          for ( int i = 0; i < dirs.length; i++ ) {
            if ( dirs[i].toURI().toString().contains("_update_") ) {
                String newUri = dirs[i].toURI().toString().replace("___","");
                try {
                    File newFile = new File(new URI(newUri));
                    AbbozzaLogger.info("PlugnManager: Replacing " + newUri);
                    newFile.renameTo("__" + System.currentTimeMillis() + "_" + newFile.getName());
                    dirs[i].renameTo(newFile);
                } catch (URISyntaxException ex) {
                    AbbozzaLogger.err("pluginManager: Ignoring malformed uri " + newUri);
                }
            }
          }
        }
        */
        
        // Check jars
        File[] jars;
        jars = path.listFiles(new FileFilter() {
            @Override
            public boolean accept(File pathname) {
                return ( pathname.getName().endsWith(".jar") && pathname.getName().contains("___") );
            }
        });

        if ( (jars != null) && (jars.length>0) ) {        
            for (File jar : jars) {
                if (jar.toURI().toString().contains("___")) {
                    String newUri = jar.toURI().toString().replace("___", "");
                    try {
                        File newFile = new File(new URI(newUri));
                        AbbozzaLogger.info("PlugnManager: Replacing " + newUri);
                        newFile.delete();
                        jar.renameTo(newFile);
                    }catch (URISyntaxException ex) {
                        AbbozzaLogger.err("pluginManager: Ignoring malformed uri " + newUri);
                    }
                }
            }
        }
        
    }
    
    /**
     * Get an iterator over all plugins
     *
     * @return The iterator
     */
    public Collection<Plugin> plugins() {
        return this._plugins.values();
    }

    public Plugin getPlugin(String id) {
        return this._plugins.get(id);
    }

    public void registerPluginHandlers(HttpServer server) {
        AbbozzaLogger.info("PluginManager: Registering plugin handlers");
        for ( Plugin plugin : _plugins.values() ) {
            AbbozzaLogger.info("PluginManager: Checking plugin " + plugin.getId() + " for handler");
            if (plugin.getHttpHandler() != null) {
                server.createContext("/abbozza/plugin/" + plugin.getId(), plugin.getHttpHandler());
                AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " registered HttpHandler for /abbozza/plugin/" + plugin.getId(), AbbozzaLogger.INFO);
            }
        }
    }

    public void mergeFeatures(Document features) {
        NodeList roots = features.getElementsByTagName("features");
        if (roots.getLength() == 0) {
            return;
        }
        Node root = roots.item(0);

        for ( Plugin plugin : _plugins.values() )  {
            Node feature = plugin.getFeature();
            if (plugin.isActivated() && (feature != null)) {
                try {
                    features.adoptNode(feature);
                    root.appendChild(feature);
                } catch (DOMException ex) {
                    AbbozzaLogger.stackTrace(ex);
                }
            }
        }
    }

    @Override
    public void handle(HttpExchange exchg) throws IOException {
        String response = "";
        int status = 200;
        String path = exchg.getRequestURI().getPath();
        OutputStream os = exchg.getResponseBody();
        Headers responseHeaders = exchg.getResponseHeaders();

        AbbozzaLogger.out("PluginManager: " + path + " requested", AbbozzaLogger.DEBUG);

        // Return the constructed javascript file
        if (path.equals("/abbozza/plugins/plugins.js")) {
            for (Plugin plugin : _plugins.values() ) {
                if (plugin.isActivated()) {
                    response = response + "\n" + plugin.getJavaScript();
                }
            }
            responseHeaders.set("Content-Type", "text/javascript");

        } else if (path.startsWith("/abbozza/plugins/")) {
            // If the path is of the form /abbozza/plugins/<pluginid>/<path>
            // get the requested content from the plugin
            String remainder = path.substring(17);
            int idx = remainder.indexOf('/');
            String pluginId = remainder.substring(0,idx);
            String filePath = remainder.substring(idx);
            Plugin plugin = this.getPlugin(pluginId);
            AbbozzaLogger.info("PluginManager: Requested " + filePath + " from plugin " + pluginId );
            if ( plugin != null)  {                
                plugin.getFileHandler().handlePath(exchg,filePath.substring(1));
                return;
            } else {
                response = "Pluign " + pluginId + " not found!";
                status= 400;
            }
        } else {
            // respond overview 
            response = "Found plugins:";
            for ( Plugin plugin : _plugins.values() ) {
                response = response + "\n\t" + plugin.getId();
                if (plugin.isActivated()) {
                    response = response + " [activated]";
                } else {
                    response = response + " [deactivated]";
                }
            }
            responseHeaders.set("Content-Type", "text/plain");
        }
        if ( response != null ) {
            exchg.sendResponseHeaders(status, response.length());
            os.write(response.getBytes());
        }
        os.close();
    }

    /**
     * This operation adds all locale entries of all registered plugins to a
     * given XML root.
     *
     * @param locale The requested locale
     * @param root The Element to which the locale entries should be added
     */
    public void addLocales(String locale, Element root) {
        try {
            Document locales;

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();

            locales = builder.newDocument();

            // Iterate through all plugins
            for ( Plugin plugin : _plugins.values() ) {
                Element pluginLocale = plugin.getLocale(locale);
                if (pluginLocale != null) {
                    root.getOwnerDocument().adoptNode(pluginLocale);
                    root.appendChild(pluginLocale);
                    pluginLocale.setAttribute("id", plugin.getId() + "_" + locale);
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
            pluginUrl = new URL(url.toString() + "plugin.xml");

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();

            pluginXml = builder.parse(pluginUrl.openStream());
        } catch (ParserConfigurationException | SAXException | IOException ex) {
            pluginXml = null;
            AbbozzaLogger.err("PluginManager: Could not parse " + pluginUrl);
            AbbozzaLogger.stackTrace(ex);
        }
        return pluginXml;
    }

    private boolean checkRequirements(Plugin plugin) {
        String libs = "";

        if ((!"".equals(plugin.getSystem())) && !plugin.getSystem().contains(this._abbozza.getSystem())) {
            AbbozzaLogger.err("PluginManager: Plugin " + plugin.getId() + " not compatible with system " + this._abbozza.getSystem());
            return false;
        }

        boolean foundAll = true;
        Node requirements = plugin.getRequirements();
        if (requirements == null) {
            return true;
        }
        Node child = requirements.getFirstChild();
        while (child != null) {
            if (child.getNodeName().equals("library")) {
                String name = child.getAttributes().getNamedItem("name").getNodeValue();
                // If a required library is not found, reject the plugin
                if (!this._abbozza.checkLibrary(name)) {
                    AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " : required library " + name + " not found", AbbozzaLogger.INFO);
                    libs = libs + "\n- " + name;
                    foundAll = false;
                }

            } else if (child.getNodeName().equals("install")) {
                String name = child.getAttributes().getNamedItem("file").getNodeValue();
                String targetName = child.getAttributes().getNamedItem("target").getNodeValue();
                InputStream stream = plugin.getStream(name);

                if ((stream == null) || (!this._abbozza.installPluginFile(stream, targetName))) {
                    AbbozzaLogger.out("PluginManager: Plugin " + plugin.getId() + " : file " + name + " installed to " + targetName, AbbozzaLogger.INFO);
                    foundAll = false;
                }
            }
            child = child.getNextSibling();
        }
        if (!foundAll) {
            JOptionPane.showMessageDialog(null, "Plugin " + plugin.getName() + " deactivated!\n\nRequired libraries are missing:" + libs, "Missing Libraries", JOptionPane.INFORMATION_MESSAGE);
        }
        return foundAll;
    }
}
