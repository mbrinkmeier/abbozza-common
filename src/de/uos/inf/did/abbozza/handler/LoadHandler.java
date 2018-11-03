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
import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.logging.Level;
import java.util.logging.Logger;
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
                AbbozzaLogger.out("LoadHandler: load " + query, AbbozzaLogger.DEBUG);
                String sketch = loadSketch(query);
                if (contentLocation != null) {
                    exchg.getResponseHeaders().add("Content-Location", contentLocation);
                }
                this.sendResponse(exchg, 200, "text/xml; charset=utf-8", sketch);
            }
        } catch (IOException ioe) {
            this.sendResponse(exchg, 404, "", "");
        } catch (URISyntaxException ex) {
            AbbozzaLogger.err("LoadHandler: Wrong URI Syntax");
        }
    }

    /**
     * Load sketch chosen by user.
     *
     * @return The loaded sketch as a string.
     * @throws IOException thrown if an IO error occured.
     * @throws java.net.URISyntaxException
     */
    public String loadSketch() throws IOException, URISyntaxException {
        if (_abbozzaServer.isDialogOpen()) {
            return null;
        }

        String result = "";
        File lastSketchFile = null;
        URI last = _abbozzaServer.getLastSketchFile();
        if (last == null) {
            lastSketchFile = new File(".");
        } else {
            try {
                lastSketchFile = new File(last);
            } catch (Exception ex) {
                lastSketchFile = new File(".");
            }
        }
        AbbozzaLogger.out("LoadHandler: last sketch " + lastSketchFile.getCanonicalPath(), AbbozzaLogger.DEBUG);
        
        String path = ((lastSketchFile != null) ? lastSketchFile.getCanonicalPath() : _abbozzaServer.getSketchbookPath());
        JFileChooser chooser = new JFileChooser(path) {
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
                uri = new URI(URLEncoder.encode(panel.getUrl().toString(),"UTF-8"));
            } else {
                File file = chooser.getSelectedFile();
                uri = file.toURI();
            }

            this._abbozzaServer.setLastSketchFile(uri);

            contentLocation = null;
            if (uri.toString().endsWith("abj") || uri.toString().endsWith("jar") || uri.toString().endsWith("zip")) {
                result = getStartFromAbj(uri);
                // _abbozzaServer.setTaskContext(url);
            } else {
                result = getSketchFromFile(uri);
                _abbozzaServer.setTaskContext(uri);
            }

            if ((!panel.getSystem().equals(this._abbozzaServer.getSystem())) && (!panel.getSystem().equals(""))) {
                // JOptionPane.showMessageDialog(null, AbbozzaLocale.entry("err.WRONG_SYSTEM",AbbozzaLocale.entry(panel.getSystem())), AbbozzaLocale.entry("err.WRONG_SYSTEM_TITLE"),JOptionPane.ERROR_MESSAGE);
                int option = JOptionPane.showConfirmDialog(null, AbbozzaLocale.entry("err.WRONG_SYSTEM", AbbozzaLocale.entry(panel.getSystem())),
                        AbbozzaLocale.entry("err.WRONG_SYSTEM_TITLE"), JOptionPane.YES_NO_OPTION);
                if (option == JOptionPane.NO_OPTION) {
                    _abbozzaServer.setDialogOpen(false);
                    _abbozzaServer.resetFrame();
                    _abbozzaServer.toolIconify();
                    throw new IOException();
                }
            }

            if (contentLocation == null) {
                try {
                    URI con = _abbozzaServer.getTaskContext();
                    URL absolute = new URL(con.toURL(), uri.toString());
                    URI conUri;
                    URI abs = absolute.toURI();
                    contentLocation = con.relativize(abs).toString();
                } catch (URISyntaxException ex) {
                    contentLocation = uri.toString();
                }
            }

//            contentLocation = url.toString();
            if (panel.applyOptions()) {
                AbbozzaServer.getConfig().apply(panel.getOptions());
            }
        } else {
            _abbozzaServer.setDialogOpen(false);
            _abbozzaServer.resetFrame();
            _abbozzaServer.toolIconify();
            throw new IOException();
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
     *
     *
     * @param path The URL/Path of the sjetch to be loaded.
     * @return The sketch as a String.
     * @throws IOException Thrown if an IO Error occured during
     */
    public String loadSketch(String path) throws IOException {
        String result = "";
        URI uri = null;
        contentLocation = null;

        uri = _abbozzaServer.expandSketchURI(path);
        result = getSketchFromFile(uri);
        
        
        // AbbozzaLogger.out("LoadHandler: load " + url.toString(), AbbozzaLogger.DEBUG);
        // AbbozzaLogger.out("LoadHandler: load anchor " + url.toString(), AbbozzaLogger.DEBUG);
        _abbozzaServer.setLastSketchFile(uri);

        if (contentLocation == null) {
            try {
                URI con = _abbozzaServer.getTaskContext();
                URL absolute = new URL(con.toURL(), uri.toString());
                URI conUri;
                URI abs = absolute.toURI();
                contentLocation = con.relativize(abs).toString();
            } catch (URISyntaxException ex) {
                contentLocation = uri.toString();
            }
        }

        return result;
    }

    
    
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

    
    private String getSketchFromFile(URI abz) throws FileNotFoundException, IOException {
        String result = "";
        BufferedReader reader = new BufferedReader(new InputStreamReader(abz.toURL().openStream(), "utf-8"));
        while (reader.ready()) {
            result = result + reader.readLine() + '\n';
        }
        reader.close();
        // _abbozzaServer.setLastSketchFile(abz);
        _abbozzaServer.setTaskContext(abz);
        contentLocation = abz.toString();
        return result;
    }


    private String getSketchFromFile(File file) throws FileNotFoundException, IOException {
        return getSketchFromFile(file.toURI());
    }

}
