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
 * @fileoverview
 *
 * This class implements the hnadler for /abbozza/load requests.
 *
 * If the request has no query, an "Open File Dialog" is shown and the user
 * is asked to select a sketch to beloaded.
 *
 * If the request comes with a query, its contents is interpreted as a path
 * to a sketch.
 *
 * Depending on the form of the path, the requested URL is constructed.
 *
 * If the path has the form !&lt;path&gt;, then the sketch isloaded from
 * the URL &lt;server_root&gt;/&lt;path&gt;. Ie.e an internal sketch is
 * loaded.
 *
 * If the path ends with 'abj' or 'jar', the sketch start.abz inside it is
 * loaded. Furthermore, the task context is set to the jar.
 *
 * If the path starts with '/' it is loaded from the corresponding file with
 * the URL 'file://&lt;path&gt;'. The task context is changed to the parent
 * directory.
 *
 * In all other cases the path is treated relative to the task context. The
 * task context is *NOT* changed!
 *
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael
 * Brinkmeier)
 */
package de.uos.inf.did.abbozza.handler;

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import java.awt.Component;
import java.awt.HeadlessException;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.net.ssl.HttpsURLConnection;
import javax.swing.JDialog;
import javax.swing.JFileChooser;
import javax.swing.JOptionPane;
import javax.swing.filechooser.FileNameExtensionFilter;

/**
 *
 * @author mbrinkmeier
 */
public class LoadHandler extends AbstractHandler {

    private String contentLocation;

    /**
     *
     * @param abbozza The AbbozzaServer.
     */
    public LoadHandler(AbbozzaServer abbozza) {
        super(abbozza);
    }

    /**
     *
     * @param exchg The HTTPExchange Object representing the request.
     * @throws IOException Thrown if an IO Error occured during request handling
     */
    @Override
    protected void handleRequest(HttpExchange exchg) throws IOException {
        contentLocation = null;
        try {
            String query = exchg.getRequestURI().getQuery();
            if (query == null) {
                // If the request has no query, open the "Open File" dialog
                String sketch = loadSketch();
                if (sketch != null) {
                    if (contentLocation != null) {
                        exchg.getResponseHeaders().add("Content-Location", contentLocation);
                    }
                    this.sendResponse(exchg, 200, "text/xml; charset=utf-8", sketch);
                } else {
                    this.sendResponse(exchg, 404, "", "");
                }
            } else {
                // Otherwise try to load the sketch from the given path
                AbbozzaLogger.debug("LoadHandler: load " + query);
                String sketch = loadSketch(query);
                if ((contentLocation != null) && (sketch != null)) {
                    exchg.getResponseHeaders().add("Content-Location", contentLocation);
                    this.sendResponse(exchg, 200, "text/xml; charset=utf-8", sketch);
                } else {
                    // If the sketch or content loaction was not set, an error occured
                    this.sendResponse(exchg, 404, "text/text; charset=utf-8", "Error accessing " + query);
                }
            }
        } catch (IOException ioe) {
            this.sendResponse(exchg, 404, "text/text; charset=utf-8", ioe.getLocalizedMessage());
        }
    }

    /**
     * Load sketch, chosen by user. An "Open File" dialog is opened. The user
     * has to select the file to be opened.
     *
     * @return The loaded sketch as a string.
     */
    public String loadSketch() {
        if (_abbozzaServer.isDialogOpen()) {
            return null;
        }

        // Set the path for the dialog. Use the path of a previously opened file,
        // is possible. Otherwise go to the sketchbook directory.
        String result = null;
        File lastSketchFile = null;
        URI last = _abbozzaServer.getLastSketchFile();
        if (last == null) {
            lastSketchFile = new File(_abbozzaServer.getSketchbookPath());
        } else {
            try {
                lastSketchFile = new File(last);
            } catch (Exception ex) {
                lastSketchFile = new File(_abbozzaServer.getSketchbookPath());
            }
        }
        try {
            AbbozzaLogger.debug("LoadHandler: last sketch " + lastSketchFile.getCanonicalPath());
        } catch (IOException ex) {
            AbbozzaLogger.err("LoadHandler: no last sketch known");
        }

        JFileChooser chooser = new JFileChooser(lastSketchFile) {
            protected JDialog createDialog(Component parent) throws HeadlessException {
                JDialog dialog = super.createDialog(parent);
                dialog.setLocationByPlatform(true);
                dialog.setAlwaysOnTop(true);
                return dialog;
            }
        };

        // Prepare accessory-panel
        LoadHandlerPanel panel = new LoadHandlerPanel(chooser);
        chooser.setAccessory(panel);
        chooser.addPropertyChangeListener(panel);

        chooser.setFileFilter(new FileNameExtensionFilter("abbozza! Sketches und Aufgabenarchive (*.abz, *.abj, *.jar, *.zip)", "abz", "abj", "jar", "zip"));
        if (lastSketchFile.isDirectory()) {
            chooser.setCurrentDirectory(lastSketchFile);
        } else {
            chooser.setSelectedFile(lastSketchFile);
        }

        _abbozzaServer.bringFrameToFront();
        _abbozzaServer.setDialogOpen(true);

        int choice = chooser.showOpenDialog(null);
        if ((choice == JFileChooser.APPROVE_OPTION) || (panel.getUrl() != null)) {
            URI uri;
            if (panel.getUrl() != null) {
                try {
                    uri = new URI(URLEncoder.encode(panel.getUrl().toString(), "UTF-8"));
                } catch (UnsupportedEncodingException ex) {
                    AbbozzaLogger.err("LoadHandler: " + ex.getLocalizedMessage());
                    AbbozzaLogger.err("LoadHandler: " + panel.getUrl());
                    File file = chooser.getSelectedFile();
                    uri = file.toURI();
                } catch (URISyntaxException ex) {
                    AbbozzaLogger.err("LoadHandler: " + ex.getLocalizedMessage());
                    AbbozzaLogger.err("LoadHandler: " + panel.getUrl());
                    File file = chooser.getSelectedFile();
                    uri = file.toURI();
                }
            } else {
                File file = chooser.getSelectedFile();
                uri = file.toURI();
            }

            // Check the type of file
            contentLocation = null;
            uri = _abbozzaServer.expandSketchURI(uri.toString());
            try {
                result = getSketchFromFile(uri);
                _abbozzaServer.setTaskContext(uri);
                _abbozzaServer.setLastSketchFile(uri);

                if ((!panel.getSystem().equals(this._abbozzaServer.getSystem())) && (!panel.getSystem().equals(""))) {
                    int option = JOptionPane.showConfirmDialog(null, AbbozzaLocale.entry("err.WRONG_SYSTEM", AbbozzaLocale.entry(panel.getSystem())),
                            AbbozzaLocale.entry("err.WRONG_SYSTEM_TITLE"), JOptionPane.YES_NO_OPTION);
                    if (option == JOptionPane.NO_OPTION) {
                        _abbozzaServer.setDialogOpen(false);
                        _abbozzaServer.resetFrame();
                        _abbozzaServer.toolIconify();
                    }
                }

                if (contentLocation == null) {
                    // try {
                    //     URI con = _abbozzaServer.getTaskContext();
                    //     URL absolute = new URL(con.toURL(), uri.toString());
                    //     URI conUri;
                    //     URI abs = absolute.toURI();
                        // contentLocation = con.relativize(abs).toString();
                        contentLocation = uri.toString();
                    // } catch (URISyntaxException | MalformedURLException ex) {
                    //     contentLocation = uri.toString();
                    // }
                }

                if (panel.applyOptions()) {
                    AbbozzaServer.getConfig().apply(panel.getOptions());
                }
                
                if ( result != null ) {
                    _abbozzaServer.setLastSketchFile(uri);
                }
                
            } catch (IOException ex) {
                    String msg = ex.getLocalizedMessage();
                    AbbozzaLogger.err("LoadHandler: Error reading " + uri.toString());            
                    AbbozzaLogger.err("LoadHandler: " + ex.getLocalizedMessage());
                    JOptionPane.showMessageDialog(null, AbbozzaLocale.entry("err.ERROR_LOADING_SKETCH") + "\n"
                        + uri.toString() + "\n" 
                        + ex.getLocalizedMessage() , AbbozzaLocale.entry("err.ERROR") , JOptionPane.ERROR_MESSAGE);
                    result = null;
            }
        }
        _abbozzaServer.setDialogOpen(false);
        _abbozzaServer.resetFrame();
        _abbozzaServer.toolIconify();
        return result;
    }

    /**
     * Load sketch from path.
     *
     * Depending on the form of the path, the requested URL is constructed.
     *
     * If the path has the form !&lt;path&gt;, then the sketch isloaded from the
     * URL &lt;server_root&gt;/&lt;path&gt;. Ie.e an internal sketch is loaded.
     *
     * If the path ends with 'abj' or 'jar', the sketch start.abz inside it is
     * loaded. Furthermore, the task context is set to the jar.
     *
     * If the path starts with '/' it is loaded from the corresponding file with
     * the URL 'file://&lt;path&gt;'. The task context is changed to the parent
     * directory.
     *
     * In all other cases the path is treated relative to the task context. The
     * task context is *NOT* changed!
     *
     * @param path The URL/Path of the sjetch to be loaded.
     * @return The sketch as a String.
     */
    public String loadSketch(String path) {
        String result = "";
        contentLocation = null;

        URI uri = _abbozzaServer.expandSketchURI(path);
        try {
            result = getSketchFromFile(uri);
            _abbozzaServer.setLastSketchFile(uri);

            if (contentLocation == null) {
                // try {
                    // URI con = _abbozzaServer.getTaskContext();
                    // URL absolute = new URL(con.toURL(), uri.toString());
                    // URI conUri;
                    // URI abs = absolute.toURI();
                    // contentLocation = con.relativize(abs).toString();
                    contentLocation = uri.toString();
                // } catch (URISyntaxException ex) {
                //     contentLocation = uri.toString();
                // }
            }

            if ( result != null ) {
                _abbozzaServer.setLastSketchFile(uri);
            }
            
        } catch (IOException ex) {
            String msg = ex.getLocalizedMessage();
            AbbozzaLogger.err("LoadHandler: Error reading " + path);            
            AbbozzaLogger.err("LoadHandler: Expanded to " + uri.toString() );            
            AbbozzaLogger.err("LoadHandler: " + ex.getLocalizedMessage());
            JOptionPane.showMessageDialog(null, AbbozzaLocale.entry("err.ERROR_LOADING_SKETCH") + "\n"
                        + path + "\n" 
                        + ex.getLocalizedMessage() , AbbozzaLocale.entry("err.ERROR") , JOptionPane.ERROR_MESSAGE);
            result = null;
        }

        return result;
    }
    
    /**
     * Read a Sketch from an URI.
     *
     * @param uri The URI of the file
     * @return
     * @throws FileNotFoundException
     * @throws IOException
     */
    private String getSketchFromFile(URI uri) throws FileNotFoundException, IOException {
        String result = "";
        BufferedReader reader;
        URLConnection conn = uri.toURL().openConnection();
        reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));        
        String line;
        while ( (line = reader.readLine()) != null ) {
            result = result + line + '\n';
        }
        reader.close();
        return result;
    }

    /**
     * Read a Sketch from a file.
     *
     * @param file The file from which the sketch should be read.
     *
     * @return The contents of the file.
     *
     * @throws FileNotFoundException
     * @throws IOException
     */
    private String getSketchFromFile(File file) throws FileNotFoundException, IOException {
        return getSketchFromFile(file.toURI());
    }

    
    /*
    private String getStartFromAbj(URI abj) {
        String result = "";
        try {
            URI uri = new URI("jar:" + abj.toString() + "!/start.abz");
            AbbozzaLogger.out("LoadHandler: Open abj " + uri.toString(), AbbozzaLogger.DEBUG);
            URLConnection conn = uri.toURL().openConnection();
            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
            while (reader.ready()) {
                result = result + reader.readLine() + '\n';
            }
            reader.close();
            contentLocation = uri.toString();
            _abbozzaServer.setTaskContext(uri);
        } catch (Exception ex) {
            ex.printStackTrace(System.err);
            AbbozzaLogger.err("LoadHandler: Could not open " + abj.toString());
            return null;
        }
        return result;
    }

    private String getStartFromAbj(File file) {
        return getStartFromAbj(file.toURI());
    }
    */

    
}
