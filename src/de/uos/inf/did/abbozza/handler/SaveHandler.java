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
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import java.awt.Component;
import java.awt.HeadlessException;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import static java.lang.System.in;
import java.net.URI;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileNameExtensionFilter;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 *
 * @author mbrinkmeier
 */
public class SaveHandler extends AbstractHandler {

    public SaveHandler(AbbozzaServer abbozza) {
        super(abbozza);
    }

    /**
     * Handle a save request. The request may contain a query as a preset
     * path. The body of the request contains the xml-representation of the
     * sketch to be stored.
     * 
     * @param exchg The HttpExchange object representing the request
     * @throws IOException This is thrown if an error occurs.
     */
    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        String path;
        String contentLocation;
        URI uri = null;
        
        try {
            // Check if a query is given
            path = exchg.getRequestURI().getQuery();
            if ( path != null ) {
                // Expand the given path to the current, absolute path
                uri = _abbozzaServer.expandSketchURI(path);
                // We can only save to files
                if ( (uri == null) || (!"file".equals(uri.getScheme())) ) {
                    uri = null;
                }
            }
            
            contentLocation = saveSketch(exchg.getRequestBody(), uri);
            AbbozzaLogger.debug("SaveHandler: Setting sketch location to " + contentLocation);
            
            if ( contentLocation != null) {
               exchg.getResponseHeaders().add("Content-Location", contentLocation);
               this.sendResponse(exchg, 200, "text/xml", "saved");
            } else {
                this.sendResponse(exchg, 400, "", "");                
            }
        } catch (IOException ioe) {
            this.sendResponse(exchg, 404, "", "");
        }
    }

    /**
     * Save the sketch.
     * The xl is read from the body of the request.
     * 
     * @param stream A stream containing the sketch
     * @param uri The URI of a preset file, or null is none is given.
     * 
     * @return The location where the sketch is saved
     * 
     * @throws IOException 
     */
    private String saveSketch(InputStream stream, URI uri) throws IOException {
        File file;
        if ( _abbozzaServer.isDialogOpen() ) return null;
        
        String location = null;
        
        // Read the XML-Document
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder;

        try {
            builder = factory.newDocumentBuilder();

            // Read DOM from stream
            Document xml = builder.parse(stream);
            Node root = xml.getFirstChild();

            // Find description
            NodeList descriptions = xml.getElementsByTagName("description");
            Element desc;
            if (descriptions.getLength() == 0) {
                desc = xml.createElement("description");
                desc.setTextContent("abbozza! sketch");
                root.appendChild(desc);
            } else {
                desc = (Element) descriptions.item(0);
            }

            // Find options
            NodeList options = xml.getElementsByTagName("options");
            Element opts;
            if (options.getLength() == 0) {
                opts = xml.createElement("options");
                root.appendChild(opts);
            } else {
                opts = (Element) options.item(0);
            }
            
            // Find the system tag. Add one if missing.
            NodeList systems = xml.getElementsByTagName("system");
            Element sysXml;
            if (systems.getLength() == 0) {
                sysXml = xml.createElement("system");
                root.appendChild(sysXml);
            } else {
                sysXml = (Element) systems.item(0);
            }
            
            // Set the preset URI
            File lastSketchFile;
            // Take the given one
            URI lastUri = uri;
            // If none is given, use the one last accessed by the server
            if ( lastUri == null ) {
                lastUri = _abbozzaServer.getLastSketchFile();
            }
            
            // Set the file
            if (( lastUri != null ) && ( lastUri.getScheme() == "file" )) {
                lastSketchFile = new File(lastUri);
            } else {
                lastSketchFile = null;
            }
            String path = ((lastSketchFile != null) ? lastSketchFile.getAbsolutePath() : _abbozzaServer.getSketchbookPath());
            if ( lastSketchFile == null ) {
                lastSketchFile = new File(path);
            }
                        
            _abbozzaServer.bringFrameToFront();
            _abbozzaServer.setDialogOpen(true);
           
            JFileChooser chooser = new JFileChooser(path) {
                protected JDialog createDialog(Component parent)
                        throws HeadlessException {
                    JDialog dialog = super.createDialog(parent);
                    dialog.setLocationByPlatform(true);
                    dialog.setAlwaysOnTop(true);
                    return dialog;
                }
            };
            
            // Prepare accessory-panel
            SaveHandlerPanel panel = new SaveHandlerPanel();
            chooser.setAccessory(panel);
            chooser.addPropertyChangeListener(panel);            
            chooser.setFileSelectionMode(JFileChooser.FILES_ONLY);
            
            panel.setDescription(desc.getTextContent());
            panel.setOptionSelected(opts.getAttribute("apply").equals("yes") ? true : false);
            panel.setUndeletableSelected(opts.getAttribute("protected").equals("yes") ? true : false);

            // Prepare File filters
            chooser.setFileFilter(new FileNameExtensionFilter("abbozza! (*.abz)", "abz", "ABZ"));
            if ( uri != null ) {
                try {
                    chooser.setSelectedFile(new File(uri));
                } catch (IndexOutOfBoundsException iobex) {
                    AbbozzaLogger.err(iobex.getLocalizedMessage());
                    AbbozzaLogger.err(uri.toASCIIString());
                }
            } else {
                if ( lastSketchFile.isDirectory() ) {
                    chooser.setCurrentDirectory(lastSketchFile);
                } else {
                    chooser.setSelectedFile(lastSketchFile);
                }
            }

            // Show FileChooser
            if (chooser.showSaveDialog(null) == JFileChooser.APPROVE_OPTION) {
                file = chooser.getSelectedFile();
                if (!file.getName().endsWith(".abz") && !file.getName().endsWith(".ABZ")) {
                    file = new File(file.getPath() + ".abz");
                }
                
                AbbozzaLogger.debug("SaveHandler: Saving sketch to " + file.toURI());
                
                FileWriter writer;

                if (!file.equals(lastSketchFile) && file.exists()) {
                    int answer = JOptionPane.showConfirmDialog(null, AbbozzaLocale.entry("msg.file_overwrite", file.getName()), "", JOptionPane.YES_NO_OPTION);
                    if ( (answer != JOptionPane.YES_OPTION) && (answer != JOptionPane.OK_OPTION) ) {
                        _abbozzaServer.setDialogOpen(false);
                        _abbozzaServer.resetFrame();        
                        _abbozzaServer.toolIconify();
                        return null;
                    }
                }

                // Prepare output writer
                writer = new FileWriter(file);

                // 1st step: Update description
                desc.setTextContent(panel.getDescription());
                // 2nd step: Set attribute "apply"
                opts.setAttribute("apply", panel.isOptionSelected() ? "yes" : "no");
                // 3rd step: Set attribute "protected"
                opts.setAttribute("protected", panel.isUndeletableSelected() ? "yes" : "no");
                // 4th step: Set system MOVED INTO JS PART
                // sysXml.setTextContent(this._abbozzaServer.getSystem());

                
                // Write DOM to file via Transformer
                Transformer transformer = TransformerFactory.newInstance().newTransformer();
                // Do not add a surrounding xml tag
                transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
                transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");               
                transformer.setOutputProperty(OutputKeys.METHOD, "xml");
                transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                transformer.transform(new DOMSource(xml), new StreamResult(file));

                writer.close();
                in.close();
                _abbozzaServer.setLastSketchFile(file.toURI());
                location = file.toURI().toURL().toString();
                
                AbbozzaLogger.debug("SaveHandler: Successfully saved sketch to " + file.toURI());

            }
        } catch (Exception ex) {
            AbbozzaLogger.err("SaveHandler: Could not save sketch!");
            AbbozzaLogger.err(ex.getLocalizedMessage());
            AbbozzaLogger.err(uri.toASCIIString());
            AbbozzaLogger.stackTrace(ex);
            
            JOptionPane.showMessageDialog(null,
                    AbbozzaLocale.entry("err.ERROR_SAVING_SKETCH") + "\n" + ex.toString(),
                    AbbozzaLocale.entry("err.ERROR"),JOptionPane.ERROR_MESSAGE);
        }
        _abbozzaServer.setDialogOpen(false);
        _abbozzaServer.resetFrame();        
        _abbozzaServer.toolIconify();
        
        return location;
    }

}
