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
package de.uos.inf.did.abbozza;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
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
    private String config_updateUrl = "http://inf-didaktik.rz.uos.de/abbozza/current/";
    private boolean config_update = false;
    private String config_taskPath = configPath;
    private boolean config_tasksEditable = true;

    /**
     * Reads the configuration from the given path.
     */
    public AbbozzaConfig(String path) {
        configPath = path;
        read();
    }

    /**
     * Sets the default configuration
     */
    public AbbozzaConfig() {
        configPath = null;
        setDefault("");
    }

    /**
     * This method reads the configuration from the file. If the file does not
     * exist, set the default configuration and write it.
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
            config.load(new FileInputStream(prefFile));
            set(config);
        } catch (IOException ex) {
            // Create a new configuration file
            AbbozzaLogger.err("Configuration file " + configPath + " not found! Creating one!");
            setDefault("");
            write();
        }
    }

    /**
     * Prepare the default configuration
     */
    public void setDefault(String browserPath) {
        config = new Properties();

        AbbozzaLogger.out("Setting internal default configuration", AbbozzaLogger.INFO);
        config.remove("freshInstall");
        config_serverPort = 54242;
        config_autoStart = true;
        config_browserStart = true;
        config_browserPath = browserPath;
        config_locale = System.getProperty("user.language");
        config_updateUrl = "http://inf-didaktik.rz.uos.de/abbozza/current/";
        config_update = false;
        config_taskPath = System.getProperty("user.home");
        config_tasksEditable = true;
        storeProperties(config);
        setDefaultOptions();
        AbbozzaLogger.setLevel(AbbozzaLogger.NONE);
        AbbozzaLogger.out("Default configuration set", AbbozzaLogger.INFO);
        // }        
    }

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

    public void set(Properties properties) {

        if ("true".equals(properties.get("freshInstall"))) {
            AbbozzaLogger.out("Setting default configuration after fresh install", AbbozzaLogger.NONE);
            setDefault(properties.getProperty("browserPath"));
            write();
            return;
        }

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
        
        config_updateUrl = properties.getProperty("updateUrl", "http://inf-didaktik.rz.uos.de/abbozza/current/");
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
    }

    /**
     * Writes the current configuration to a file
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
            props.store(new FileOutputStream(prefFile), "abbozza! preferences (" + AbbozzaServer.getInstance().system + ")");

        } catch (IOException ex) {
            AbbozzaLogger.err("Could not write configuration file " + configPath);
        }
    }

    /**
     *
     */
    public Properties get() {
        Properties props = (Properties) config.clone();

        // Write General Configuration
        storeProperties(props);

        return props;
    }

    /*
     * Stores the current config_* values in the properties
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
    }
    
    /**
     * Apply the string of options.
     * The string contains a series of <key>=<value> pairs, seperated by
     * commata and enclosed in braces {,}
     * 
     * @param options
     * @throws IOException 
     */
    public void apply(String options) throws IOException {
        // Remove braces, replace commata by newlines and remove leading 
        // and trailing whitespaces
        options = options.replace('{', ' ');
        options = options.replace('}', ' ');
        options = options.replace(',', '\n');
        options = options.trim();
        config.load(new ByteArrayInputStream(options.getBytes()));
    }

    /**
     * 
     * Operations for setting and retreiving options from the option tree.
     * 
     */
    
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

    public void setTasksEditable(boolean selected) {
        config_tasksEditable = selected;
    }

    public boolean areTasksEditable() {
        return config_tasksEditable;
    }

}
