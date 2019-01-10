/**
 * @license abbozza!
 *
 * Copyright 2015-2018 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
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
 * @fileoverview AbbozzaConfig manages a set of preferences, settings, options 
 * and properties required by an abbozza! server.
 * 
 * It handles three types of properties:
 * 
 * 1) Base Properties
 *    These are settings required by the server. Each instance of AbbozzaConfig
 *    provides at least the default values for these properties.
 *    They are:
 *    - The port on which the servber should run (if possible)
 *    - A flag indicating wether the server is automatically started (arduino)
 *    - The path to the used browser
 *    - A flag inidcating wether the browser should be started immediately
 *    - The locale
 *    - The update url
 *    - A flag inidcating wether the server should check for updates
 *    - The path of the task directory
 *    - A flag inidcating if the task should be editable
 * 
 * 2) Additional Properties
 *    These properties are settings required by specific implementations.
 *    They contain string values and are identified by specific keys.
 * 
 * 3) Options
 *    Options are described in the options.xml file and are configurable in the
 *    Option tree, displayed in the config dialog. They vcan be set and read by
 *    several operations, depending on the type of the values.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael
 * Brinkmeier)
 */
package de.uos.inf.did.abbozza.core;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.Properties;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 *
 * @author michael
 */
public class AbbozzaConfig {

    private String configPath;
    private Properties config;

    // General configuration
    private int config_serverPort = 54242;
    private boolean config_autoStart = true;
    private boolean config_browserStart = true;
    private String config_browserPath = "";
    private String config_locale = "de";
    private String config_updateUrl = "https://inf-didaktik.rz.uos.de/downloads/abbozza/current/";
    private String config_pluginUrl = "https://inf-didaktik.rz.uos.de/downloads/abbozza/plugins/" + AbbozzaServer.getInstance().getSystem() + "/plugins.xml";
    private boolean config_update = false;
    private String config_taskPath = configPath;
    private boolean config_tasksEditable = true;
    private int config_timeout = 120000;

    /**
     * Reads the configuration from the given path.
     * The file is a standard properties file, consisting of
     * key-value-pairs.
     * 
     * @param path The path of the file to be read.
     */
    public AbbozzaConfig(String path) {
        configPath = path;
        read();
    }

    
    /**
     * Constructs an AbbozzaConfig object containing only the default
     * base properties and an empty browser Path.
     */
    public AbbozzaConfig() {
        configPath = null;
        if ( System.getProperty("os.name").toLowerCase().contains("mac") ) {
            setDefault("open");
        } else {        
            setDefault("");
        }
    }

    
    
    /**
     * This method reads the configuration from the file at configPath. 
     * If the file does not exist, set the default configuration and write it.
     */
    public void read() {
        if (configPath == null) {
            return;
        }
        
        File prefFile = new File(configPath);
        config = new Properties();
        try {
            // Load the configuration
            AbbozzaLogger.out("Reading config from " + configPath, AbbozzaLogger.DEBUG);
            config.load(new InputStreamReader(new FileInputStream(prefFile),"UTF8"));
            set(config);
            AbbozzaLogger.err("Writing configuration to " + configPath);
            write();
        } catch (IOException ex) {
            // Create a new configuration file
            AbbozzaLogger.err("Configuration file " + configPath + " not found! Creating one!");
            if ( System.getProperty("os.name").toLowerCase().contains("mac") ) {
                setDefault("open");
            } else {        
                setDefault("");
            }
            write();
        }
    }

    /**
     * Prepare the default configuration. The browser path is set to the
     * given value.
     * 
     * @param browserPath The browser path to be set.
     */
    public void setDefault(String browserPath) {
        
        // Set default configuration
        config = new Properties();

        AbbozzaLogger.out("Setting internal default configuration", AbbozzaLogger.INFO);
        config.remove("freshInstall");
        config_serverPort = 54242;
        config_autoStart = true;
        config_browserStart = true;
        config_browserPath = browserPath;
        config_locale = System.getProperty("user.language");
        config_updateUrl = "https://inf-didaktik.rz.uos.de/downloads/abbozza/current/";
        config_pluginUrl = "https://inf-didaktik.rz.uos.de/downloads/abbozza/plugins/" + AbbozzaServer.getInstance().getSystem() + "/plugins.xml";
        config_update = false;
        config_taskPath = System.getProperty("user.home");
        config_tasksEditable = true;
        config_timeout = 120000;
        storeProperties(config);
        
        setDefaultOptions();
        AbbozzaLogger.setLevel(AbbozzaLogger.NONE);
        AbbozzaLogger.out("Default configuration set", AbbozzaLogger.INFO);

        // Check if default configuration in <runtimePath>/lib/ exists
        // and load it.
        AbbozzaServer abbozza = AbbozzaServer.getInstance();
        File defaultConfigFile = new File(abbozza.abbozzaPath+ "/lib/" + abbozza.getSystem() + ".cfg");
        AbbozzaLogger.out("Cheking for default configuration in " + defaultConfigFile.getAbsolutePath());
        if ( defaultConfigFile.exists() ) {
            try {
                // Load the configuration
                AbbozzaLogger.out("Reading default config from " + defaultConfigFile.getAbsolutePath(), AbbozzaLogger.DEBUG);
                config.load(new InputStreamReader(new FileInputStream(defaultConfigFile),"UTF8"));
                set(config);
            } catch (IOException ex) {
                AbbozzaLogger.err("Default configuration file " + defaultConfigFile.getAbsolutePath() + " could not be read!");
            }
        }

        write();
    }

    /**
     * This operation sets the default values of all options given in the
     * option tree of the associated server.
     */
    public void setDefaultOptions() {
        Document optionXml = AbbozzaServer.getInstance().getOptionTree();

        // Options
        NodeList items = optionXml.getElementsByTagName("item");
        for (int i = 0; i < items.getLength(); i++) {
            Node node = items.item(i);
            String option = node.getAttributes().getNamedItem("option").getNodeValue();
            String def = node.getAttributes().getNamedItem("default").getNodeValue();
            setOption(option, def.equals("true"));
            // AbbozzaLogger.out(option);
        }

        // Choices
        items = optionXml.getElementsByTagName("choice");
        for (int i = 0; i < items.getLength(); i++) {
            Node node = items.item(i);
            String option = node.getAttributes().getNamedItem("option").getNodeValue();
            String def = node.getAttributes().getNamedItem("default").getNodeValue();
            setOption(option, def.equals("true"));
            // AbbozzaLogger.out(option);
        }
    }

    /**
     * This operation sets the various settings by the given properties.
     * If a config file is set, the configuration is stored there afterwards.
     * 
     * @param properties The collection of values to be set.
     */
    public void set(Properties properties) {

        config = (Properties) properties.clone();

        // Set general configuration
        config_autoStart = ("true".equals(properties.getProperty("autoStart", "false")));
        config_browserStart = ("true".equals(properties.getProperty("startBrowser", "true")));
        if (config.containsKey("serverPort")) {
            config_serverPort = Integer.parseInt(properties.getProperty("serverPort", "54242"));
        }
        config_browserPath = properties.getProperty("browserPath", "");
        config_locale = properties.getProperty("locale", System.getProperty("user.language"));
        // change the config value to the language part (downward compatibility)
        if (config_locale.length() > 2) config_locale = config_locale.substring(0,2);
        
        config_pluginUrl = properties.getProperty("pluginUrl", "https://inf-didaktik.rz.uos.de/downloads/abbozza/plugins/" + AbbozzaServer.getInstance().getSystem()) + "/plugins.xml";
        config_updateUrl = properties.getProperty("updateUrl", "https://inf-didaktik.rz.uos.de/downloads/abbozza/current/");
        config_update = "true".equals(properties.getProperty("update", "false"));
        if (AbbozzaServer.getInstance() != null) {
            config_taskPath = properties.getProperty("taskPath", AbbozzaServer.getInstance().getSketchbookPath());
        } else {
            config_taskPath = properties.getProperty("taskPath", "");
        }
        config_tasksEditable = "true".equals(properties.getProperty("tasksEditable", "true"));
        if (properties.getProperty("loglevel") != null) {
            AbbozzaLogger.setLevel(Integer.parseInt(properties.getProperty("loglevel", ""+AbbozzaLogger.NONE)));
        } else {
            AbbozzaLogger.setLevel(AbbozzaLogger.NONE);
        }
        if (properties.getProperty("timeout") != null) {
            config_timeout=Integer.parseInt(properties.getProperty("timeout", ""+AbbozzaLogger.NONE));
        } else {
            config_timeout=120000;
        }

        write();        
    }

    /**
     * Writes the current configuration to the config file, if one is given.
     */
    public void write() {
        if (configPath == null) {
            return;
        }
        File prefFile = new File(configPath);
        try {
            prefFile.getParentFile().mkdirs();
            prefFile.createNewFile();
            Properties props = get();
            AbbozzaLogger.out("Configuration written to " + configPath, AbbozzaLogger.INFO);
            props.store(new OutputStreamWriter(new FileOutputStream(prefFile),"UTF8"), "abbozza! preferences (" + AbbozzaServer.getInstance().getSystem() + ")");

        } catch (IOException ex) {
            AbbozzaLogger.err("Could not write configuration file " + configPath);
        }
    }

    /**
     * This operation returns a clone of the current settings.
     * 
     * @return A clone of the properties.
     */
    public Properties get() {
        Properties props = (Properties) config.clone();

        // Write General Configuration
        storeProperties(props);

        return props;
    }

    /*
     * Stores the current config_* values in the given properties.
     * 
     * @param props The Properties object into which the current values should
     * be stored.
     */
    private void storeProperties(Properties props) {
        props.setProperty("autoStart", config_autoStart ? "true" : "false");
        props.setProperty("startBrowser", config_browserStart ? "true" : "false");
        props.setProperty("serverPort", Integer.toString(config_serverPort));
        props.setProperty("browserPath", config_browserPath);
        props.setProperty("locale", config_locale);
        props.setProperty("loglevel", Integer.toString(AbbozzaLogger.getLevel()));
        props.setProperty("updateUrl", config_updateUrl);
        props.setProperty("update", config_update ? "true" : "false");
        props.setProperty("taskPath", config_taskPath);
        props.setProperty("tasksEditable", config_tasksEditable ? "true" : "false");
        props.setProperty("timeout", Integer.toString(config_timeout));
    }
    
    /**
     * Apply the string of options.
     * The string contains a series of &lt;key&gt;=&lt;value&gt; pairs, seperated by
     * commata and enclosed in braces {,}
     * 
     * @param options The string continiag the key-value-pairs
     * @throws IOException Thrown if an error occurs.
     */
    public void apply(String options) throws IOException {
        // Remove braces, replace commata by newlines and remove leading 
        // and trailing whitespaces
        options = options.replace('{', ' ');
        options = options.replace('}', ' ');
        options = options.replace(',', '\n');
        options = options.trim();
        config.load(new InputStreamReader(new ByteArrayInputStream(options.getBytes()),"UTF8"));
    }

    /**
     * 
     * Operations for setting and retreiving options from the option tree.
     * 
     */
    
    /**
     * Set an additional Property.
     * 
     * @param key The key
     * @param value The value
     */
    public void setProperty(String key, String value) {
        config.setProperty(key, value);
    }
    
    /**
     * Retreive an additional property.
     * 
     * @param key The key of the requested property
     * @return  The value
     */
    public String getProperty(String key) {
        return config.getProperty(key);
    }
    
    /**
     * Set a boolean option
     * 
     * @param option The option identifier
     * @param value The new value
     */
    public void setOption(String option, boolean value) {
        config.setProperty("option." + option, (value) ? "true" : "false");
    }

    /**
     * Get a boolean option
     * 
     * @param option The option identifier
     * @return Its current value
     */
    public boolean getOption(String option) {
        String value = config.getProperty("option." + option);
        if (value == null) {
            return false;
        }
        return (value.equals("true")) ? true : false;
    }

    /**
     * Set an integer option
     * 
     * @param option The option identifier
     * @param value The new value
     */
    public void setOptionInt(String option, int value) {
        config.setProperty("option." + option, Integer.toString(value));
    }

    /**
     * Get an integer option
     * 
     * @param option The option identifier
     * @return Its current value
     */
    public int getOptionInt(String option) { 
        String value = config.getProperty("option." + option);
        if (value == null) {
            return -1;
        }
        return (Integer.parseInt(value));
    }

    /**
     * Set a string option
     * 
     * @param option The option identifier
     * @param value The new value
     */
    public void setOptionStr(String option, String value) {
        config.setProperty("option." + option, value);
    }

    /**
     * Get a string option
     * 
     * @param option The option identifier
     * @return Its current value
     */
    public String getOptionStr(String option) {
        String value = config.getProperty("option." + option);
        return value;
    }

    /**
     * 
     * Oprerations for the general options, which aren't organized in the option tree.
     * 
     * @return the current port.
     */
    public int getServerPort() {
        return config_serverPort;
    }

    public void setServerPort(int port) {
        config_serverPort = port;
    }

    public boolean startAutomatically() {
        return config_autoStart;
    }

    public void setAutoStart(boolean flag) {
        config_autoStart = flag;
    }

    public boolean startBrowser() {
        return config_browserStart;
    }

    public void setBrowserStart(boolean flag) {
        config_browserStart = flag;
    }

    public String getBrowserPath() {
        return config_browserPath;
    }

    public void setBrowserPath(String path) {
        config_browserPath = path;
    }

    public String getLocale() {
        return config_locale;
    }

    public void setLocale(String locale) {
        config_locale = locale;
    }

    public String getPluginUrl() {
        return config_pluginUrl;
    }
    
    public String getUpdateUrl() {
        return config_updateUrl;
    }

    public void setUpdateUrl(String url) {
        config_updateUrl = url;
    }

    public void setUpdate(boolean flag) {
        config_update = flag;
    }

    public boolean getUpdate() {
        return config_update;
    }

    public String getTaskPath() {
        return config_taskPath;
    }

    public void setTaskPath(String taskPath) {
        config_taskPath = taskPath;
    }

    public String getFullTaskPath() {
        String path = config_taskPath;
        if ( config_taskPath.contains("%HOME%")) {
            // Check if HOMESHARE is defined. Required in windows if the user 
            // uses a network directory as home.
            String home = System.getenv("HOMESHARE");
            if ( home == null ) {
                path = config_taskPath.replace( "%HOME%", System.getProperty("user.home") );
            } else {
                path = config_taskPath.replace( "%HOME%", path );                
            }
        }
        return path;
    }
    
    public void setTasksEditable(boolean selected) {
        config_tasksEditable = selected;
    }

    public boolean areTasksEditable() {
        return config_tasksEditable;
    }
    
}
