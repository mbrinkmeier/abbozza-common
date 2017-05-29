/**
 * @license abbozza!
 *
 * Copyright 2015 Michael Brinkmeier ( michael.brinkmeier@uni-osnabrueck.de )
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the Licenseo. You may obtain a copy
 * of the License at
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
 * @fileoverview The main class for the abbozza! server
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.arduino;

import cc.arduino.packages.BoardPort;
import de.uos.inf.did.abbozza.handler.JarDirHandler;
import java.awt.Color;

import processing.app.Editor;
import processing.app.PreferencesData;
import processing.app.tools.Tool;

import com.sun.net.httpserver.*;
import de.uos.inf.did.abbozza.AbbozzaConfigDialog;
import de.uos.inf.did.abbozza.AbbozzaLocale;
import de.uos.inf.did.abbozza.AbbozzaLogger;
import de.uos.inf.did.abbozza.AbbozzaServer;
import de.uos.inf.did.abbozza.arduino.handler.BoardHandler;
import de.uos.inf.did.abbozza.handler.SerialHandler;
import de.uos.inf.did.abbozza.plugin.PluginConfigPanel;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JFrame;
import javax.swing.SwingUtilities;
import jssc.SerialPort;
import processing.app.Base;
import processing.app.BaseNoGui;
import processing.app.packages.UserLibrary;

public class Abbozza extends AbbozzaServer implements Tool, HttpHandler {

    public static Color COLOR = new Color(91, 103, 165);
    private static int counter;

    private int arduino_major;
    private int arduino_minor;
    private int arduino_rev;

    private Editor editor;

    public String runtimePath;

    public static URI jarUri;
    
    public static boolean isGlobal;
    public static boolean localExists;
    public static String name;
    
    // During class load check is this calss is loaded from the global tool jar
    static {
        isGlobal = true;
        localExists = false;
        jarUri = null;
        try {
            // Get jar file
            jarUri = Abbozza.class.getProtectionDomain().getCodeSource().getLocation().toURI();
            System.out.println("abbozza!: Initializing " + jarUri.getPath());
            
            // Get 
            File sketchbookFolder = BaseNoGui.getSketchbookFolder();
            System.out.println("abbozza!: Checking sketchbook folder: " + sketchbookFolder.toURI().toString());
            File localJar = new File(sketchbookFolder,"/tools/Abbozza/tool/abbozza-arduino.jar");
            if ( localJar.exists() ) {
                System.out.println("abbozza!: LOCAL jar found at " + localJar.toURI().toString());
                localExists = true;
                if ( localJar.toURI().toString().startsWith(jarUri.toString())) {
                    isGlobal = false;
                } else {
                    isGlobal = true;
                    System.out.println("abbozza!: GLOBAL jar found at " + jarUri.toString());
                }
            } else {
                isGlobal = true;
                System.out.println("abbozza!: GLOBAL jar found at " + jarUri.toString());
            }
        } catch (URISyntaxException ex) {
        }

        if ( jarUri == null ) {
            System.out.println("abbozza! in panic! Cannot find abbozza-arduino.jar!");
            System.exit(1);
        }        
    }
    
    
    
    @Override
    public void init(Editor editor) {        
        
        if ( isGlobal && localExists ) {
            System.out.println("Suppressing global abbozza! tool, since local version exists!");
            return;
        }
        
        String version = BaseNoGui.VERSION_NAME;
        int pos = version.indexOf('.');
        arduino_major = Integer.parseInt(version.substring(0, pos));
        int pos2 = version.indexOf('.', pos + 1);
        arduino_minor = Integer.parseInt(version.substring(pos + 1, pos2));
        arduino_rev = Integer.parseInt(version.substring(pos2 + 1));
        AbbozzaLogger.out("Found arduino version " + arduino_major + "." +arduino_minor + "." + arduino_rev,AbbozzaLogger.INFO);
        
        this.editor = editor;
        super.init("arduino");
    }

    @Override
    public void run() {
        if ( isGlobal && localExists ) {
            System.out.println("Suppressing global abbozza! tool, since local version exists!");
            return;
        }

        // Do not start a second Abbozza instance!
        if (Abbozza.getInstance() != this) {
            return;
        }        

        startServer();
        startBrowser("arduino.html");

        
    }

    @Override
    public void setPaths() {
        super.setPaths();
        
        sketchbookPath = PreferencesData.get("sketchbook.path");
        // configPath = sketchbookPath + "/tools/Abbozza/Abbozza.cfg";
        localJarPath = sketchbookPath + "/tools/Abbozza/tool/";
        globalJarPath = PreferencesData.get("runtime.ide.path") + "/";
        runtimePath = globalJarPath;
        
        localPluginPath = sketchbookPath + "/tools/Abbozza/plugins";
        globalPluginPath = globalJarPath + "/tools/Abbozza/plugins";
    }
 
    
    @Override
    public void registerSystemHandlers() {
        httpServer.createContext("/abbozza/board", new BoardHandler(this, false));
        httpServer.createContext("/abbozza/queryboard", new BoardHandler(this, true));
        httpServer.createContext("/abbozza/serial", new SerialHandler(this));
    }

    
    public void serialMonitor() {
        this.editor.handleSerial();
    }


    public void findJarsAndDirs(JarDirHandler jarHandler) {
        jarHandler.clear();
        jarHandler.addDir(sketchbookPath + "/tools/Abbozza/web", "Local directory");
        // jarHandler.addJar(sketchbookPath + "/tools/Abbozza/tool/abbozza-arduino.jar", "Local jar");
        jarHandler.addDir(runtimePath + "tools/Abbozza/web", "Global directory");
        // jarHandler.addJar(runtimePath + "tools/Abbozza/tool/abbozza-arduino.jar", "Global jar");
        jarHandler.addJar(jarUri, "Jar");
    }

    public void adaptConfigDialog(AbbozzaConfigDialog dialog) {
        dialog.addPanel(new PluginConfigPanel());
    }
    
    
    public void print(String message) {
        AbbozzaLogger.out(message);
    }

    public void processMessage(String message) {
        this.editor.getCurrentTab().setText(message);
        // this.editor.setText(message);
    }

    @Override
    public String getMenuTitle() {
        if ( isGlobal && localExists ) {
            System.out.println("Suppressing global abbozza! tool, since local version exists!");
            return "abbozza! (deactivated)";
        }        
        return "abbozza!";
    }

    public Editor getEditor() {
        return editor;
    }
    
    
    // Moves the arduino IDE window to the back
    @Override
    public void toolToBack() {
        editor.toBack();
    }

    @Override
    public void toolIconify() {
        editor.setState(JFrame.ICONIFIED);
        editor.setExtendedState(JFrame.ICONIFIED);
    }

    @Override
    public void toolSetCode(String code) {
        setEditorText(code);
    }

    private void setEditorText(final String code) {
        try {
            SwingUtilities.invokeAndWait(new Runnable() {
                public void run() {
                    editor.getCurrentTab().setText(code);
                }
            });
        } catch (InterruptedException ex) {
            Logger.getLogger(Abbozza.class.getName()).log(Level.SEVERE, null, ex);
        } catch (InvocationTargetException ex) {
            Logger.getLogger(Abbozza.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    
    @Override
    public String compileCode(String code) {
        
        toolSetCode(code);        

        // Redirect error stream
        PrintStream origErr = System.err;
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        PrintStream newErr = new PrintStream(buffer);
        System.setErr(newErr);
            
        // Compile sketch                
        try {            
            AbbozzaLogger.out(AbbozzaLocale.entry("msg.compiling"), AbbozzaLogger.INFO);
            editor.statusNotice("abbozza!: " + AbbozzaLocale.entry("msg.compiling"));
            editor.getSketchController().build(false, false);
            editor.statusNotice("abbozza!: " + AbbozzaLocale.entry("msg.done_compiling"));
            AbbozzaLogger.out(AbbozzaLocale.entry("msg.done_compiling"), AbbozzaLogger.INFO);
        } catch (Exception e) {
            // e.printStackTrace(System.out);
            editor.statusError(e);
            editor.statusNotice("abbozza!: " + AbbozzaLocale.entry("msg.error_compiling"));
            AbbozzaLogger.out(AbbozzaLocale.entry("msg.error_compiling"), AbbozzaLogger.INFO);
        }
        

        // Reset error stream
        newErr.flush();            
        System.setErr(origErr);
  
        // Fetch response
        String errMsg = buffer.toString();
        System.err.println(errMsg);
                
        return errMsg;
    }

    @Override
    public String uploadCode(String code) {

        boolean flag = PreferencesData.getBoolean("editor.save_on_verify");
        PreferencesData.setBoolean("editor.save_on_verify", false);

        ThreadGroup group = Thread.currentThread().getThreadGroup();
        Thread[] threads = new Thread[group.activeCount()];
        group.enumerate(threads, false);

        monitorHandler.suspend();
        
        toolSetCode(code);        

        // Redirect error stream
        PrintStream origErr = System.err;
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        PrintStream newErr = new PrintStream(buffer);
        System.setErr(newErr);
        
        try {
            AbbozzaLogger.out(AbbozzaLocale.entry("msg.compiling"),AbbozzaLogger.INFO);
            editor.handleExport(false);
            AbbozzaLogger.out(AbbozzaLocale.entry("msg.done_compiling"),AbbozzaLogger.INFO);
        } catch (Exception e) {
            editor.statusError(e);
            AbbozzaLogger.out(AbbozzaLocale.entry("msg.error_compiling"), AbbozzaLogger.INFO);
        }
    
        Thread[] threads2 = new Thread[group.activeCount()];
        group.enumerate(threads2, false);

        // Find the exporting thread
        Thread last = null;
        int j;

        int i = threads2.length - 1;
        while ((i >= 0) && (last == null)) {

            j = threads.length - 1;
            while ((j >= 0) && (threads[j] != threads2[i])) {
                j--;
            }

            if (j < 0) {
                last = threads2[i];
            }
            i--;
        }
        
        // Wait for the termination of the export thread
        AbbozzaLogger.out("Waiting for upload",AbbozzaLogger.INFO);
        while ((last != null) && (last.isAlive())) {
        }
        AbbozzaLogger.out("Upload ended",AbbozzaLogger.INFO);
        
        PreferencesData.setBoolean("editor.save_on_verify", flag);

        // Reset error stream
        newErr.flush();            
        System.setErr(origErr);
  
        // Fetch response
        String errMsg = buffer.toString();
        AbbozzaLogger.out(errMsg,AbbozzaLogger.INFO);
                
        return errMsg;
    }

    public boolean checkLibrary(String name) {
        UserLibrary lib = Base.getLibraries().getByName(name);
        if ( lib != null ) return true;
        return false;
    }
    
    public String getSerialPort() {
        BoardPort port = Base.getDiscoveryManager().find(PreferencesData.get("serial.port"));
        if ( port != null )
            return port.getAddress();
        
        return null;
    }

    public int getBaudRate() {
        return SerialPort.BAUDRATE_9600;
    }
}

