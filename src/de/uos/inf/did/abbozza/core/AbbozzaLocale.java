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
package de.uos.inf.did.abbozza.core;

import org.w3c.dom.*;
import javax.xml.parsers.*;
import java.io.*;
import java.util.Locale;
import java.util.jar.JarFile;
import java.util.zip.ZipEntry;
import javax.xml.XMLConstants;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;

/**
 *
 * @author michael
 */
public class AbbozzaLocale {

    private static String locale;
    private static Document localeXml;

    /**
     * Set the current locale and reads it from the xml-files
     * 
     * @param loc The locale to be used.
     */
    public static void setLocale(String loc) {
        locale = loc;
        localeXml = buildLocale();
        
        NodeList nodes = localeXml.getElementsByTagName("msg");
        for (int i = 0; i < nodes.getLength(); i++ ) {
            Element node = (Element) nodes.item(i);
            String id = node.getAttribute("id").toLowerCase();
            node.setAttribute("id", id);
            node.setIdAttribute("id", true);
        }        
    }

    /**
     * Build the locale from the given directory
     * 
     * @param loc The locale
     * @param path The directory in which the locale files are located.
     * @param jar The jar file in which the files are stored.
     */
    public static void setLocale(String loc, JarFile jar, String path) {
        locale = loc;
        localeXml = buildLocale(jar,path);
        
        NodeList nodes = localeXml.getElementsByTagName("msg");
        for (int i = 0; i < nodes.getLength(); i++ ) {
            Element node = (Element) nodes.item(i);
            String id = node.getAttribute("id").toLowerCase();
            node.setAttribute("id", id);
            node.setIdAttribute("id", true);
        }        
    }
    
    
    /**
     * Builds the locale from common, system specific and plugin locales
     * 
     * @return The XML-document containig the locale entries.
     */
    private static Document buildLocale() {
        try {
            // Prepare internal locale
            SchemaFactory schemaFactory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
            Schema schema = schemaFactory.newSchema();
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setSchema(schema);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document localeXml = builder.newDocument();
            Element root = localeXml.createElement("languages");
            localeXml.appendChild(root);            
            String locale = AbbozzaLocale.locale;
            
            Document globalLocale = fetchLocale("/js/languages/" + locale + ".xml");
                    
            Element foundElement = null;
            if ( globalLocale != null ) {
                NodeList languages = globalLocale.getElementsByTagName("language");
                for ( int i = 0; i < languages.getLength(); i++ ) {
                    Element element = (Element) languages.item(i);
                    if ( (foundElement == null) || (locale.equals(element.getAttribute("id"))) ) {
                        foundElement = element;
                    }
                }
                if ( foundElement != null ) {
                    Element child = (Element) foundElement.cloneNode(true);
                    localeXml.adoptNode(child);
                    root.appendChild(child);
                    child.setAttribute("id","global_" + locale);
                }
            }
            
            Document systemLocale = fetchLocale("/js/abbozza/" + AbbozzaServer.getInstance().getSystem() + "/languages/" + locale + ".xml");
            
            foundElement = null;
            if ( (globalLocale != null) && (systemLocale != null) ) {
                NodeList languages = systemLocale.getElementsByTagName("language");
                for ( int i = 0; i < languages.getLength(); i++ ) {
                    Element element = (Element) languages.item(i);
                    if ( (foundElement == null) || (locale.equals(element.getAttribute("id"))) ) {
                        foundElement = element;
                    }
                }
                if ( foundElement != null ) {
                    Element child = (Element) foundElement.cloneNode(true);
                    localeXml.adoptNode(child);
                    root.appendChild(child);
                    child.setAttribute("id",AbbozzaServer.getInstance().getSystem() + "_" + locale);
                }
            }

            // Add server specific locales
            AbbozzaServer.getInstance().addAdditionalLocale(locale,root);
            
            // Add locales from Plugins
            if ( AbbozzaServer.getPluginManager() != null )
                AbbozzaServer.getPluginManager().addLocales(locale,root);
            
            return localeXml;
        } catch (Exception ex) {
            AbbozzaLogger.stackTrace(ex);
            return null;
        }
    }

    /**
     * Builds the locale from the specified path
     * 
     * @param jar The jar containing the locale files.
     * @param path The path inside the jar to the locale file.
     * 
     * @return 
     */
    private static Document buildLocale(JarFile jar, String path) {
        try {
            // Prepare internal locale
            SchemaFactory schemaFactory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
            Schema schema = schemaFactory.newSchema();
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setSchema(schema);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document localeXml = builder.newDocument();
            Element root = localeXml.createElement("languages");
            localeXml.appendChild(root);            
            String locale = AbbozzaLocale.locale;
            
            Document globalLocale = fetchLocale(jar, path + locale + ".xml");
            
            Element foundElement = null;
            if ( globalLocale != null ) {
                NodeList languages = globalLocale.getElementsByTagName("language");
                for ( int i = 0; i < languages.getLength(); i++ ) {
                    Element element = (Element) languages.item(i);
                    if ( (foundElement == null) || (locale.equals(element.getAttribute("id"))) ) {
                        foundElement = element;
                    }
                }
                if ( foundElement != null ) {
                    Element child = (Element) foundElement.cloneNode(true);
                    localeXml.adoptNode(child);
                    root.appendChild(child);
                    child.setAttribute("id","global_" + locale);
                }
            }
                        
            return localeXml;
        } catch (Exception ex) {
            AbbozzaLogger.stackTrace(ex);
            return null;
        }
    }



    /**
     * Loads the locale xml from the given path.
     * 
     * @param path
     * @return 
     */
    private static Document fetchLocale(String path) {
        Document localeXml = null;

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;
        
        try {
            AbbozzaLogger.out("LocaleHandler: Loading locale from " + path,AbbozzaLogger.INFO);
            InputStream stream = AbbozzaServer.getInstance().getJarHandler().getInputStream(path);
            
            builder = factory.newDocumentBuilder();
            localeXml = builder.parse(stream);            
        } catch (Exception ex) {
            AbbozzaLogger.out("LocaleHandler: " + path + " not found");
            localeXml = null;
        }
       
        return localeXml;
    }

        /**
     * Loads the locale xml from the given path.
     * 
     * @param path
     * @return 
     */
    private static Document fetchLocale(JarFile jar, String path) {
        Document localeXml = null;

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;
        
        try {
            AbbozzaLogger.out("LocaleHandler: Loading locale from " + path,AbbozzaLogger.INFO);
            ZipEntry entry = jar.getEntry(path);
            InputStream stream = jar.getInputStream(entry);
            
            builder = factory.newDocumentBuilder();
            localeXml = builder.parse(stream);            
        } catch (Exception ex) {
            AbbozzaLogger.out("LocaleHandler: " + path + " not found");
            localeXml = null;
        }
       
        return localeXml;
    }
        
    /**
     * gets the current locale
     * 
     * @return The current locale.
     */
    public static String getLocale() {
        return locale;
    }

    public static Document getLocaleXml() {
        return AbbozzaLocale.localeXml;
    }
    
    /**
     * Returns an entry of the current locale
     * 
     * @param key The key of the requested entry.
     * @return The value of the requested entry.
     */
    public static String entry(String key) {
        key = key.toLowerCase();
        if ( localeXml == null ) return key;
        Element el = localeXml.getElementById(key);
        if ( el == null ) return key;
        return el.getTextContent();
    }

    /**
     * Returns an entry of the current locale and replaces a '#' by the
     * given string.
     * 
     * @param key The key of the entry
     * @param value The replacement for '#' in the found string
     * @return The changed entry.
     */
    public static String entry(String key, String value) {   
        String res = entry(key);
        res = res.replace("#", value);
        return res;
    }

}
