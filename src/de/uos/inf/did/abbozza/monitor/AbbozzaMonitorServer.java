/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.uos.inf.did.abbozza.monitor;

import com.fazecast.jSerialComm.SerialPort;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.core.AbbozzaServerException;
import de.uos.inf.did.abbozza.handler.JarDirHandler;
import de.uos.inf.did.abbozza.handler.SerialHandler;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JDialog;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;

/**
 *
 * @author michael
 */
public class AbbozzaMonitorServer extends AbbozzaServer implements ActionListener {

    private String jarFile;   // The file used to start the monitor
    private AbbozzaMonitor monitor;

    public static void main(String args[]) {
        AbbozzaMonitorServer server = new AbbozzaMonitorServer();
        server.init("monitor", args);
    }

    /**
     * The system independent initialization of the server.
     *
     * @param system The id of the system type
     */
    public void init(String system, String args[]) {
        
        try {
            
            super.init(system,args);
            
            // Try to start server on given port
            int serverPort = config.getServerPort();
            try {
                this.startServer(serverPort);
            } catch (AbbozzaServerException ex) {
                AbbozzaLogger.err(ex.getLocalizedMessage());
                JOptionPane.showMessageDialog(null, AbbozzaLocale.entry("msg.already_running"),"",JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }
            
            monitor = new AbbozzaMonitor();
            monitor.setDefaultCloseOperation(JDialog.EXIT_ON_CLOSE);
            
            initMenu();
            
            monitor.open();
            monitor.setVisible(true);
            
            // String[] ports = SerialPortList.getPortNames();
            
            // if ((ports != null) && (ports.length>0)) {
            //     monitor.setBoardPort(ports[0],115200);
            // } else {
            //     monitor.setRate(115200);
            // }
        } catch (Exception ex) {
            AbbozzaLogger.err(ex.getLocalizedMessage());
            System.exit(1);
        }
    }

    private void initMenu() {
        JMenuBar menuBar = new JMenuBar();
        
        JMenu fileMenu = new JMenu(AbbozzaLocale.entry("gui.file_menu"));
        
        JMenuItem rescanItem = new JMenuItem(AbbozzaLocale.entry("gui.menu_rescan"));
        rescanItem.addActionListener(this);
        rescanItem.setActionCommand("RESCAN");
        fileMenu.add(rescanItem);
        
        fileMenu.addSeparator();
        
        JMenuItem quitItem = new JMenuItem(AbbozzaLocale.entry("gui.menu_quit"));
        quitItem.addActionListener(this);
        quitItem.setActionCommand("QUIT");
        fileMenu.add(quitItem);
        
        menuBar.add(fileMenu);
        monitor.setJMenuBar(menuBar);
    }
    
    
    public void setPaths() {
        userPath = System.getProperty("user.home") + "/.abbozza/" + getSystem();
        configPath = userPath + "/abbozza.cfg";

        URI uri = null;
        File installFile = new File("/");
        try {
            uri = AbbozzaServer.class.getProtectionDomain().getCodeSource().getLocation().toURI();
            installFile = new File(uri);
        } catch (URISyntaxException ex) {
            JOptionPane.showMessageDialog(null, "Unexpected error: Malformed URL " + uri.toString()
                    + "Start installer from jar!", "abbozza! installation error", JOptionPane.ERROR_MESSAGE);
        }
        jarFile = installFile.getAbsolutePath();
        jarPath = installFile.getParentFile().getAbsolutePath();

        globalJarPath = jarPath;
        localJarPath = jarPath;
        sketchbookPath = "";
        globalPluginPath = jarPath + "/plugins/";
        localPluginPath = userPath + "/plugins/";
    }

    ;

    @Override
    public void findJarsAndDirs(JarDirHandler jarHandler) {
        jarHandler.addJar(jarFile, "Jar");
    }

    @Override
    public void registerSystemHandlers() {
        httpServer.createContext("/abbozza/serial", new SerialHandler(this));
    }

    @Override
    public void toolToBack() {
    }

    @Override
    public void toolSetCode(String code) {
    }

    @Override
    public void toolIconify() {
    }

    @Override
    public int compileCode(String code) {
        return 0;
    }

    @Override
    public int uploadCode(String code) {
        return 0;
    }

    public boolean open() {

        AbbozzaLogger.out("Open monitor", AbbozzaLogger.INFO);
        if (monitor != null) {
            if (resume()) {
                monitor.toFront();
                return true;
            } else {
                return false;
            }
        }

        SerialPort port = this.getSerialPort();
        int rate = this.getBaudRate();

        if (port != null) {
            AbbozzaLogger.out("Port discovered: " + port, AbbozzaLogger.INFO);
            AbbozzaLogger.out("Initializing ... ", AbbozzaLogger.INFO);
            try {
                monitor = new AbbozzaMonitor();
            } catch (Exception ex) {
                AbbozzaLogger.err(ex.getLocalizedMessage());
            }
            AbbozzaLogger.out("Monitor initialized", AbbozzaLogger.INFO);
        } else {
            AbbozzaLogger.out("No board discovered", AbbozzaLogger.INFO);
            monitor = new AbbozzaMonitor();
        }

        try {
            monitor.open();
            monitor.setVisible(true);
            monitor.toFront();
            monitor.setAlwaysOnTop(true);
        } catch (Exception ex) {
            AbbozzaLogger.err(ex.getLocalizedMessage());
            return false;
        }
        return true;
    }

    public boolean resume() {
        AbbozzaLogger.out("Resume monitor", AbbozzaLogger.INFO);
        if (monitor == null) {
            return false;
        }
        try {
            monitor.resume();
        } catch (Exception ex) {
            return false;
        }
        return true;
    }

    public void suspend() {
        try {
            if (monitor != null) {
                monitor.suspend();
            }
        } catch (Exception ex) {
        }
    }

    public void close() {
        monitor = null;
    }

    public AbbozzaMonitor getMonitor() {
        return monitor;
    }

    private void rescanPorts() {
    }
    
    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getActionCommand().equals("QUIT")) {
            try {
                monitor.close();
                System.exit(0);
            } catch (Exception ex) {
                Logger.getLogger(AbbozzaMonitorServer.class.getName()).log(Level.SEVERE, null, ex);
            }
        } else if (e.getActionCommand().equals("RESCAN")) {
            monitor.scanPorts();
        }
    }

    @Override
    public String findBoard() {
        return "";
    }

    @Override
    public File queryPathToBoard(String path) {
        return null;
    }

    @Override
    public boolean installPluginFile(InputStream stream, String name) {
        return true;
    }

    @Override
    public void installUpdate(String version, String updateUrl) {
    }

    @Override
    public boolean canChangeSketchbookPath() {
        return false;
    }
    
}
