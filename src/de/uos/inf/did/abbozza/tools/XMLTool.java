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
package de.uos.inf.did.abbozza.tools;

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 *
 * @author mbrinkmeier
 */
public class XMLTool {

    /**
     * This operation converts a XML-document to a string representation.
     * 
     * @param doc The XML-document
     * @return The string representation of the XML-document
     */
    public static String documentToString(Document doc) {
        try {
            StringWriter sw = new StringWriter();
            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
            transformer.setOutputProperty(OutputKeys.METHOD, "xml");
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
            transformer.transform(new DOMSource(doc), new StreamResult(sw));
            return sw.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Error converting to String", ex);
        }
    }

    /**
     * This operation converts a XML-node to a string representation.
     * @param doc The node
     * @return The String representation
     */
    public static String documentToString(Node doc) {
        try {
            StringWriter sw = new StringWriter();
            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
            transformer.setOutputProperty(OutputKeys.METHOD, "xml");
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
            transformer.transform(new DOMSource(doc), new StreamResult(sw));
            return sw.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Error converting to String", ex);
        }
    }

    /**
     * This operation reads an XML-ducument from the given URL
     * @param url The URL of the XML-document
     * @return The document
     */
    public static Document getXml(URL url) {
        Document xml = null;
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            xml = builder.parse(url.openStream());
        } catch (ParserConfigurationException ex) {
            xml = null;
            AbbozzaLogger.err("Tools: Could not parse " + url);
            AbbozzaLogger.stackTrace(ex);
        } catch (SAXException ex) {
            xml = null;
            AbbozzaLogger.err("Tools: Could not parse " + url);
            AbbozzaLogger.stackTrace(ex);
        } catch (IOException ex) {
            xml = null;
            AbbozzaLogger.err("Tools: Could not find " + url);
        }
        return xml;
    }
    
}
