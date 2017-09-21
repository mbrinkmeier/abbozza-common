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

import de.uos.inf.did.abbozza.AbbozzaLocale;
import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.AbbozzaServer;
import de.uos.inf.did.abbozza.Tools;
import de.uos.inf.did.abbozza.monitor.MonitorPanel;
import de.uos.inf.did.abbozza.tools.FileTool;
import de.uos.inf.did.abbozza.tools.XMLTool;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Vector;
import java.util.jar.JarFile;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * This class implements a basic plugin for abbozza! 
 * It provides a handler for requests with path "/plugin/&lt;name&gt;/".
 * 
 * @author Michael Brinkmeier (michael.brinkmeier@uni-osnabrueck.de)
 */
public class Plugin {

    private URL _url;
    private String _id;
    private String _name;
    private String _description;
    private Vector<URL> _js;
    private Document _xml;
    private Node _options;
    private Node _feature;
    private Node _locales;
    private Node _requirements;
    private String _system;
    private String _parentOption;
    private PluginHandler _handler;
    private Class _monitorPanelClass;
    private String _monitorPanelPrefix;
        
    /**
     * Instantiate the pugin. 
     * 
     * @param url The URL of the plugin
     * @param xml The XML-document containing the plugin informations.
     */
    public Plugin(URL url, Document xml) {
        this._handler = null;
        this._url = url;
        this._id = null;
        this._js = new Vector<URL>();
        parseXML(xml);
        AbbozzaLogger.out("Plugin: " + this._id + " (" + this._url + ") added", AbbozzaLogger.INFO);
    }
    
    /**
     * Read the plugin details from plugin.xml
     */
    private void parseXML(Document pluginXml) {
        this._xml = pluginXml;
        try {            
            NodeList plugins = pluginXml.getElementsByTagName("plugin");
            if ( plugins.getLength() > 0) {
                Node root = plugins.item(0);
                this._id = root.getAttributes().getNamedItem("id").getNodeValue();
                if ( root.getAttributes().getNamedItem("system") != null ) {
                    this._system = root.getAttributes().getNamedItem("system").getNodeValue();
                } else {
                    this._system = "";                    
                }
                this._parentOption = "gui.blocks";
                if ( root.getAttributes().getNamedItem("parent") != null ) {
                    this._parentOption = root.getAttributes().getNamedItem("parent").getNodeValue();
                }
                NodeList children = root.getChildNodes();
                Node child;
                for ( int i = 0; i < children.getLength(); i++) {
                    child = children.item(i);
                    String childName = child.getNodeName();
                    
                    // Get the display name
                    if (childName.equals("name")) {
                        this._name = child.getTextContent();
                    
                    // Get the requriements
                    } else if (childName.equals("requirements")) {
                        this._requirements = child.cloneNode(true);
                        
                    // Get the description
                    } else if (childName.equals("description")) {
                        this._description = child.getTextContent();                        
                        
                    // Get the option trees
                    } else if (childName.equals("options")) {
                        _options = child.cloneNode(true);
                    } else if (childName.equals("js") ) {
                        String fileName = ((Element) child).getAttributes().getNamedItem("file").getNodeValue();
                        if ( fileName != null ) {
                            URL url = new URL(this._url.toString() + fileName);
                            this._js.add(url);
                        }
                        
                    // Get the handler class
                    } else if (childName.equals("handler")) {
                        String className = ((Element) child).getAttributes().getNamedItem("class").getNodeValue();                            
                        URLClassLoader classLoader = new URLClassLoader(new URL[]{_url.toURI().toURL()}, AbbozzaServer.class.getClassLoader() );
                        Class handlerClass = classLoader.loadClass(className);
                        this._handler = (PluginHandler) handlerClass.newInstance();
                        this._handler.setPlugin(this);

                    // Get the monitor panel
                    } else if (childName.equals("monitor")) {
                        String className = ((Element) child).getAttributes().getNamedItem("class").getNodeValue();                            
                        URLClassLoader classLoader = new URLClassLoader(new URL[]{_url.toURI().toURL()}, AbbozzaServer.class.getClassLoader() );
                        _monitorPanelClass = classLoader.loadClass(className);
                        _monitorPanelPrefix = ((Element) child).getAttributes().getNamedItem("prefix").getNodeValue();                            
                    
                    // Get the feature tree
                    } else if (childName.equals("feature")) {
                        this._feature = child;
                                      
                    // Get the locales
                    } else if ( childName.equals("locales")) {
                        this._locales = child;
                    }
                }   
            }
        } catch (Exception ex) {
            AbbozzaLogger.err(XMLTool.documentToString(pluginXml));
            AbbozzaLogger.stackTrace(ex);
        }
        
        if (_options == null) {
            try {
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document doc = builder.newDocument();
                _options = doc.createElement("options");
            } catch (ParserConfigurationException ex) {
                AbbozzaLogger.err("Plugin: " + ex.toString());
                AbbozzaLogger.stackTrace(ex);
            }
        }
        
        if ( _locales != null ) {
            AbbozzaLogger.info("Plugin " +_id + " : Adding locale");
            AbbozzaLocale.addLocale(this._locales, _id);
        }
    }
    
    
    /**
     * Returns the id of the plugin
     * 
     * @return the id
     */
    public String getId() {
        return this._id;
    }

    /**
     * Returns the display name of the plugin
     * 
     * @return the display name
     */
    public String getName() {
        return this._name;
    }

    /**
     * Returns a description of the plugin
     * 
     * @return the description
     */
    public String getDescription() {
        return this._description;
    }
    
    /**
     * Returns the system for which this plugin is written.
     * 
     * @return the system id
     */
    public String getSystem() {
        return this._system;
    }
    /**
     * Returns a concatenation of all javascript files belonging to the plugin
     * 
     * @return the concatenated javascript files
     */
    public String getJavaScript() {
        String code = "";
        for (int i = 0; i < _js.size() ; i++) {
            try {
                code = code + "\n" + new String(Tools.readBytes(_js.get(i)));
            } catch (IOException ex) {
                AbbozzaLogger.err("Plugin: " + _js.get(i).toString() + " could not be read!");
            }
        }
        return code;
    }
    
    /**
     * Gets a http handler for the context /plugin/&lt;id&gt;
     * 
     * @return The http handler
     */
    public PluginHandler getHttpHandler() {
        return this._handler;
    }
    
    /**
     * Returns an document node describing all options of the plugin
     * 
     * @return the document node
     */
    public Node getOptions() {
        if ( this._options == null) return null;
        return this._options.cloneNode(true);
    }
    
    public boolean isActivated() {
        return AbbozzaServer.getConfig().getOption(_id + ".enabled");
    }

    public Node getFeature() {
        if ( this._feature == null ) return null;
        return this._feature.cloneNode(true);
    }

    /**
     * This operation returns the requested local node for the plugin
     * 
     * @param locale The requested Locale
     * @return The node containig the requested locale
     */
    Element getLocale(String locale) {
        
        if ( this._locales == null) return null;
                
        Element foundElement = null;
        NodeList languages = this._xml.getElementsByTagName("language");
        for ( int i = 0; i < languages.getLength(); i++ ) {
            Element element = (Element) languages.item(i);
            if ( (foundElement == null) || (locale.equals(element.getAttribute("id"))) ) {
                foundElement = element;
            }
        }
                
        return (Element) foundElement.cloneNode(true);
    }

    Node getRequirements() {
        return this._requirements;
    }

    public String getParentOption() {
        return this._parentOption;
    }

    public void install() {
        AbbozzaServer abbozza = AbbozzaServer.getInstance();
        try {
            // Check if lib subdirectory exists
            AbbozzaLogger.info("PluginManager : " + _id + " : Checking for libraries");
            URL libs = new URL(_url,"lib");
            if ( libs.getProtocol().startsWith("jar") ) {
                String name = _url.getPath();
                name = name.substring(5,name.length()-2); // strep leading "file:" and trailing "!/"
                File jarFile = new File(name);
                JarFile jar = new JarFile(jarFile);
                if ( jar.getEntry("lib/") != null ) {
                    abbozza.installPluginLibFromJar(_id,jarFile);
                }
            } else {
                File srcDir = new File(_url.toString(),"lib");
                if ( srcDir.exists() ) {
                    abbozza.installPluginLib(_id, srcDir);
                }
            }
            // If it exists, check if it is present in local libraries folder
            // If not in local libraries folder or copy there is older, copy the lib
        } catch (Exception ex) {
            AbbozzaLogger.err(ex.getLocalizedMessage());
        }
    }
    
    
    public MonitorPanel getMonitorPanel() {
        try {
            if ( _monitorPanelClass != null ) {            
                return (MonitorPanel) _monitorPanelClass.newInstance();
            }
        } catch (Exception ex) {}
        return null;
    }
    
    public String getMonitorPanelPrefix() {
        return _monitorPanelPrefix;
    }
}
