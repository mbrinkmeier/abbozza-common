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

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.core.Tools;
import de.uos.inf.did.abbozza.handler.JarDirHandler;
import de.uos.inf.did.abbozza.monitor.MonitorListener;
import de.uos.inf.did.abbozza.monitor.MonitorPanel;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Vector;
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
    private PluginMonitorPanel _monitorPanel;    
    private PluginMonitorListener _monitorListener; 
    private String _monitorPanelPrefix = "";
    private String _monitorListenerPrefix = "";
    private JarDirHandler _fileHandler;
    
   
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
        
        /*
        this._fileHandler = new JarDirHandler();
        try {
            this._fileHandler.addURI(this._url.toURI());
        } catch (URISyntaxException ex) {
            AbbozzaLogger.err("Plugin " + this._id + ": malformed URL: " + this._url);
        }
        */
        
        parseXML(xml);
        
        try {
            AbbozzaServer.getInstance().getJarHandler().addURI(this._url.toURI());
        } catch (URISyntaxException ex) {
            Logger.getLogger(Plugin.class.getName()).log(Level.SEVERE, null, ex);
        }
        
        AbbozzaLogger.out("Plugin " + this._id + " (" + this._url + ") added", AbbozzaLogger.INFO);
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
                      
                    // Javascript files to be included
                    } else if (childName.equals("js") ) {
                        String fileName = ((Element) child).getAttributes().getNamedItem("file").getNodeValue();
                        if ( fileName != null ) {
                            URL url = new URL(this._url.toString() + fileName);
                            this._js.add(url);
                        }
                        
                    // Get the handler class
                    } else if (childName.equals("handler")) {
                        String className = ((Element) child).getAttributes().getNamedItem("class").getNodeValue();       
                        AbbozzaLogger.info("[Plugin " + this._id +"] Loading classes from " + _url.toURI().toURL().toString() );
                        URLClassLoader classLoader = new URLClassLoader(new URL[]{_url.toURI().toURL()}, AbbozzaServer.class.getClassLoader() );
                        Class handlerClass = classLoader.loadClass(className);
                        try {
                           this._handler = (PluginHandler) handlerClass.newInstance();
                           this._handler.setPlugin(this);
                           AbbozzaLogger.info("Plugin " + this._id + ": Instance of " + className + " used as handler");
                        } catch (ClassCastException cce) {
                           AbbozzaLogger.err("Plugin " + this._id + ": Handler class " + className + " does not implement PluginHandler!"); 
                        }                        

                    // Get the monitor panel class
                    } else if (childName.equals("monitorpanel")) {
                        String className = ((Element) child).getAttributes().getNamedItem("class").getNodeValue();                            
                        this._monitorPanelPrefix = ((Element) child).getAttributes().getNamedItem("prefix").getNodeValue();                            
                        if ( this._monitorPanelPrefix == null ) this._monitorPanelPrefix = this._id;
                        URLClassLoader classLoader = new URLClassLoader(new URL[]{_url.toURI().toURL()}, AbbozzaServer.class.getClassLoader() );
                        Class panelClass = classLoader.loadClass(className);
                        try {
                          this._monitorPanel = (PluginMonitorPanel) panelClass.newInstance();
                          this._monitorPanel.setPlugin(this);
                          AbbozzaLogger.info("Plugin " + this._id + ": Instance of " + className + " used as monitor panel");
                        } catch (ClassCastException cce) {
                           AbbozzaLogger.err("Plugin " + this._id + ": Monitor panel class " + className + " does not implement MonitorPanel!"); 
                        }

                    // Get the monitor listener class
                    } else if (childName.equals("monitorlistener")) {
                        String className = ((Element) child).getAttributes().getNamedItem("class").getNodeValue();                            
                        this._monitorListenerPrefix = ((Element) child).getAttributes().getNamedItem("prefix").getNodeValue();                            
                        if ( this._monitorPanelPrefix == null ) this._monitorPanelPrefix = this._id;
                        URLClassLoader classLoader = new URLClassLoader(new URL[]{_url.toURI().toURL()}, AbbozzaServer.class.getClassLoader() );
                        Class panelClass = classLoader.loadClass(className);
                        try {
                           this._monitorListener = (PluginMonitorListener) panelClass.newInstance();
                           this._monitorListener.setPlugin(this);
                           AbbozzaLogger.info("Plugin " + this._id + ": Instance of " + className + " used as monitor listener");
                        } catch (ClassCastException cce) {
                           AbbozzaLogger.err("Plugin " + this._id + ": Monitor listener class " + className + " does not implement MonitorListener!"); 
                        }

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
            // AbbozzaLogger.debug(XMLTool.documentToString(pluginXml));
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
    
    public InputStream getStream(String name) {
        try {
            URL url = new URL(this._url.toString() + name);
            return url.openStream();
        } catch (Exception ex) {
            AbbozzaLogger.err("Plugin " + getId() + " : Could not access " + name);
            return null;
        }
    }
    
    public MonitorPanel getMonitorPanel() {
        return this._monitorPanel;
    }
    
    public String getMonitorPanelPrefix() {
        return this._monitorPanelPrefix;
    }
    
    public MonitorListener getMonitorListener() {
        return this._monitorListener;
    }
    
    public String getMonitorListenerPrefix() {
        return this._monitorListenerPrefix;
    }
    
    public JarDirHandler getFileHandler() {
        return this._fileHandler;
    }
    
    public Document getXml() {
        return this._xml;
    }
}
