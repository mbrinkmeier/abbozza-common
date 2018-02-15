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
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.core.Tools;
import de.uos.inf.did.abbozza.tools.XMLTool;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
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
 *
 * @author michael
 */
public class LocaleHandler extends AbstractHandler {
    
    public LocaleHandler(AbbozzaServer abbozza) {
        super(abbozza);
    }

    @Override
    protected void myHandle(HttpExchange exchg) throws IOException {
        String resp = XMLTool.documentToString(AbbozzaLocale.getLocaleXml());
        resp = resp.trim();
        sendResponse(exchg, 200, "text/xml; charset=utf-8", resp);
    }

    /*
    private Document getLocales() {
        try {
            // Read the xml file for the global feature
            
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document localeXml = builder.newDocument();
            Element root = localeXml.createElement("languages");
            localeXml.appendChild(root);
            
            String locale = this._abbozzaServer.getConfiguration().getLocale();
            Document globalLocale = getLocale("/js/languages/" + locale + ".xml");
                    
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
            
            Document systemLocale = getLocale("/js/abbozza/" + this._abbozzaServer.getSystem() + "/languages/" + locale + ".xml");
            
            foundElement = null;
            if ( globalLocale != null ) {
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
                    child.setAttribute("id",this._abbozzaServer.getSystem() + "_" + locale);
                }
            }
            
            // Add locales from Plugins
            AbbozzaServer.getPluginManager().addLocales(locale,root);
            
            return localeXml;
        } catch (Exception ex) {
            AbbozzaLogger.stackTrace(ex);
            return null;
        }
    }

    private Document getLocale(String path) {
        Document localeXml = null;

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;
        
        try {
            AbbozzaLogger.out("LocaleHandler: Loading locale from " + path,AbbozzaLogger.INFO);
            InputStream stream = this._abbozzaServer.getJarHandler().getInputStream(path);
            
            builder = factory.newDocumentBuilder();
            localeXml = builder.parse(stream);            
        } catch (Exception ex) {
            AbbozzaLogger.out("LocaleHandler: " + path + " not found");
            localeXml = null;
        }
       
        return localeXml;
    }
   */
}
