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
package de.uos.inf.did.abbozza;

import java.awt.Dimension;
import java.awt.Rectangle;
import java.awt.Toolkit;
import java.awt.Window;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import javax.swing.JDialog;
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
 * @author michael
 */
public class Tools {
    
    public static byte[] readBytes(URL url) throws IOException {
        URLConnection conn = url.openConnection();
        InputStream stream = conn.getInputStream();
        return Tools.readBytes(stream);
    }

    public static byte[] readBytes(File file) throws IOException {
        return Tools.readBytes(new FileInputStream(file));
    }
   
    public static byte[] readBytes(InputStream stream) throws IOException {
        byte[] buffer;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        int value = stream.read(); 
        while(value != -1){ 
            baos.write(value); 
            value = stream.read(); 
        } 
        buffer = baos.toByteArray();
        return buffer;
    }
    
    
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
   
    public static void copyDirectory(File source, File target, boolean onlyIfNewer) throws IOException {
        
        // AbbozzaLogger.out("InstallTool: Copying " + source.getAbsolutePath() + " to " + target.getAbsolutePath());
        // If the source is a directory, copy its content
        if (source.isDirectory()) {
            // create target if it doesn't exist
            if (!target.exists()) {
                target.mkdirs();
            }
            // Copy all children
            String files[] = source.list();
            for (String file : files) {
                File srcFile = new File(source, file);
                File destFile = new File(target, file);
                copyDirectory(srcFile, destFile,onlyIfNewer);
            }
        } else {
            // If it is a file, copy it directly
            if ( (!target.exists()) || (onlyIfNewer == false) || (source.lastModified() > target.lastModified()) ) {
                Files.copy(source.toPath(), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }
    
    public static void centerWindow(Window window) {
        Rectangle screen = window.getGraphicsConfiguration().getBounds();
        window.setLocation(
            screen.x + (screen.width - window.getWidth()) / 2,
            screen.y + (screen.height - window.getHeight()) / 2
        );        
    }
}
