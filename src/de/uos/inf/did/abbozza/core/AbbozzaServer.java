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
 * @fileoverview This class is an abstract abbozza! server
 *
 * The server requires sevejbral directories and files:
 * - jarPath: the path of the jar, containing all required files
 * -
 *
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.core;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import de.uos.inf.did.abbozza.handler.CheckHandler;
import de.uos.inf.did.abbozza.handler.ConfigDialogHandler;
import de.uos.inf.did.abbozza.handler.ConfigHandler;
import de.uos.inf.did.abbozza.handler.FeatureHandler;
import de.uos.inf.did.abbozza.handler.JarDirHandler;
import de.uos.inf.did.abbozza.handler.LoadHandler;
import de.uos.inf.did.abbozza.handler.LocaleHandler;
import de.uos.inf.did.abbozza.handler.MonitorHandler;
import de.uos.inf.did.abbozza.handler.SaveHandler;
import de.uos.inf.did.abbozza.handler.TaskHandler;
import de.uos.inf.did.abbozza.handler.UploadHandler;
import de.uos.inf.did.abbozza.handler.VersionHandler;
import de.uos.inf.did.abbozza.install.InstallTool;
import de.uos.inf.did.abbozza.plugin.PluginManager;
import de.uos.inf.did.abbozza.plugin.Plugin;
import de.uos.inf.did.abbozza.tools.GUITool;
import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringWriter;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.util.Enumeration;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import jssc.SerialPort;
import jssc.SerialPortList;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 *
 * @author michael
 */
public abstract class AbbozzaServer implements HttpHandler {

    // Version
    public static final int VER_MAJOR = 1;     // Major version of common core
    public static final int VER_MINOR = 0;    // Minor version of common core
    public static final int VER_HOTFIX = 0;    // Minor version of common core

    // Instance
    protected static AbbozzaServer instance;

    // The paths
    // Paths determined by the installation
    protected String abbozzaPath;       // The parent directory of jarPath, containig lib, plugins, bin ...
    protected String jarPath;           // The parent directory of the jar
    protected String userPath;          // The path to the user directory
    protected String configPath;        // The path to the config file

    // Configurable paths
    protected String globalJarPath;     // The directory containing the global jar
    protected String localJarPath;      // The directory containig the local jar
    protected String sketchbookPath;    // The default path fpr local Sketches
    protected String globalPluginPath;
    protected String localPluginPath;

    // several attributes
    protected String system;                // the name of the system (used for paths)
    protected JarDirHandler jarHandler;

    protected AbbozzaConfig config = null;
    protected boolean isStarted = false;      // true if the server was started
    // public ByteArrayOutputStream logger;
    private DuplexPrintStream errStream;
    private DuplexPrintStream outStream;
    protected HttpServer httpServer;
    private int serverPort;
    public MonitorHandler monitorHandler;
    private URL _lastSketchFile = null;
    private URL _taskContext;
    protected PluginManager pluginManager;

    protected JFrame mainFrame = null;     // The main frame
    protected boolean dialogOpen = false;  // Used to prevent multiple open windows
    private int oldState = 0;              // Stores the original state of the mainFrame

    protected String _boardName;

    protected String compileMsg;
    protected String compileErrorMsg;

    protected boolean denyRemoteAccess = false;
    protected String allowedHosts = "";

    protected InetAddress ip4Address = null;
    protected InetAddress ip6Address = null;

    /**
     * The system independent initialization of the server
     *
     * @param system The id of the system.
     */
    public void init(String system) {
        // If there is already an Abbozza instance, silently die
        if (instance != null) {
            return;
        }
        // Set static instance
        instance = this;

        // Set the system name
        this.system = system;

        // Initialize the logger
        AbbozzaLogger.init();
        AbbozzaLogger.setLevel(AbbozzaLogger.DEBUG);
        AbbozzaLogger.registerStream(System.out);

        // Find IP address
        try {
            Enumeration<NetworkInterface> ifaces = NetworkInterface.getNetworkInterfaces();
            while (ifaces.hasMoreElements()) {
                NetworkInterface iface = ifaces.nextElement();
                if (!iface.isLoopback()) {
                    Enumeration<InetAddress> iAddrs = iface.getInetAddresses();
                    while (iAddrs.hasMoreElements()) {
                        InetAddress iAddr = iAddrs.nextElement();
                        if (iAddr.getAddress().length == 4) {
                            AbbozzaLogger.info("Abbozza: IP4 address " + iAddr.getHostAddress());
                            ip4Address = iAddr;
                        } else {
                            AbbozzaLogger.info("Abbozza: IP6 address " + iAddr.getHostAddress());
                            ip6Address = iAddr;
                        }
                    }
                }
            }
        } catch (SocketException ex) {
            Logger.getLogger(AbbozzaServer.class.getName()).log(Level.SEVERE, null, ex);
        }

        // Setting paths
        setPaths();

        // Find Jars
        jarHandler = new JarDirHandler();
        findJarsAndDirs(jarHandler);

        // Load plugins
        pluginManager = new PluginManager(this);

        /**
         * Read the configuration from
         * <user.home>/.abbozza/<system>/abbozza.cfg
         */
        config = new AbbozzaConfig(configPath);

        // Check "ndocumented" options
        denyRemoteAccess = "true".equals(config.getProperty("remote.denyAccess"));
        allowedHosts = config.getProperty("remote.allowedHosts");

        // Load the locale
        AbbozzaLocale.setLocale(config.getLocale());

        AbbozzaLogger.info("Version " + getVersion());

        // Check for Update
        if (this.getConfiguration().getUpdate()) {
            checkForUpdate(false);
        }

        // Set the initial taskContext, if a task path is given
        try {
            this._taskContext = new File(this.getConfiguration().getFullTaskPath()).toURI().toURL();
        } catch (MalformedURLException ex) {
            this._taskContext = null;
        }

        AbbozzaLogger.info(AbbozzaLocale.entry("msg.loaded"));

        // Call the initialization hooks for subclasses
        setAdditionalPaths();
        additionalInitialization();
    }

    /**
     * This default operation sets the main paths
     */
    public void setPaths() {
        // Set user Path to $HOME/.abbozza/<system>
        userPath = System.getProperty("user.home") + "/.abbozza/" + system;

        // Check if the user directory exists
        File userDir = new File(userPath);
        if (!userDir.exists()) {
            // Create user dir if it oesn't exist
            try {
                Files.createDirectories(userDir.toPath());
            } catch (IOException ex) {
                // If creatiuon  of user ir not possible, terminate
                AbbozzaLogger.err("[Fatal] Could not create: " + userPath);
                System.exit(1);
            }
        }

        // Set config path and read configuration
        configPath = userPath + "/abbozza.cfg";

        // Register log file to AbbozzaLogger
        try {
            AbbozzaLogger.registerStream(new FileOutputStream(userPath + "/abbozza.log", false));
        } catch (FileNotFoundException ex) {
            AbbozzaLogger.err("Can't log to " + userPath + "/abbozza.log");
        }

        // Determine the executed jar
        URI uri = null;
        File installFile = new File("/");
        try {
            uri = AbbozzaServer.class.getProtectionDomain().getCodeSource().getLocation().toURI();
            installFile = new File(uri);
        } catch (URISyntaxException ex) {
            JOptionPane.showMessageDialog(null, "Unexpected error: Malformed URL " + uri.toString()
                    + "Start installer from jar!", "abbozza! installation error", JOptionPane.ERROR_MESSAGE);
        }
        jarPath = installFile.getParentFile().getAbsolutePath();
        abbozzaPath = installFile.getParentFile().getParent();

        // These paths have to be set in the subclass
        globalJarPath = "";
        localJarPath = "";
        sketchbookPath = "";
        globalPluginPath = "";
        localPluginPath = "";
    }

    ;
    
    
    
    /**
     * Some getters for basic configuration details.
     */

     /**
      * Get the configured and expanded sketchbook path.
      * @return The sketchbook path
      */
    public String getSketchbookPath() {
        return sketchbookPath;
    }

    /**
     * Get the global plugin path.
     *
     * @return The global plugin path
     */
    public String getGlobalPluginPath() {
        return globalPluginPath;
    }

    /**
     * Get the users plugin path.
     *
     * @return The users plugin path.
     */
    public String getLocalPluginPath() {
        return localPluginPath;
    }

    /**
     * Get the name of the system.
     *
     * @return The name of the system.
     */
    public String getSystem() {
        return this.system;
    }

    /**
     * Register the default, system independent handlers.
     */
    protected void registerHandlers() {
        registerSystemHandlers();
        httpServer.createContext("/abbozza/load", new LoadHandler(this));
        httpServer.createContext("/abbozza/save", new SaveHandler(this));
        httpServer.createContext("/abbozza/check", new CheckHandler(this));
        httpServer.createContext("/abbozza/upload", new UploadHandler(this));
        httpServer.createContext("/abbozza/config", new ConfigHandler(this));
        httpServer.createContext("/abbozza/frame", new ConfigDialogHandler(this));
        httpServer.createContext("/abbozza/features", new FeatureHandler(this));
        httpServer.createContext("/abbozza/locale", new LocaleHandler(this));

        this.monitorHandler = new MonitorHandler(this);
        httpServer.createContext("/abbozza/monitor", monitorHandler);
        httpServer.createContext("/abbozza/monitorresume", monitorHandler);
        VersionHandler vHandler = new VersionHandler(this);
        httpServer.createContext("/abbozza/version", vHandler);
        httpServer.createContext("/abbozza/ip", vHandler);
        httpServer.createContext("/abbozza/ip6", vHandler);
        
        if (this.pluginManager != null) {
            httpServer.createContext("/abbozza/plugins", this.pluginManager);
        }
        httpServer.createContext("/abbozza/", this /* handler */);
        httpServer.createContext("/task/", new TaskHandler(this, jarHandler));
        httpServer.createContext("/", jarHandler);

        if (this.pluginManager != null) {
            this.pluginManager.registerPluginHandlers(httpServer);
        }
    }

    /**
     * Starts the server.
     */
    protected void startServer() {

        if ((!isStarted) && (AbbozzaServer.getInstance() == this)) {
            this.isStarted = true;

            // AbbozzaLogger.out("Duplexer Started ... ", AbbozzaLogger.INFO);
            AbbozzaLogger.out("Starting server ... ", AbbozzaLogger.INFO);

            serverPort = config.getServerPort();
            while (httpServer == null) {
                try {
                    httpServer = HttpServer.create(new InetSocketAddress(serverPort), 0);
                    registerHandlers();
                    httpServer.setExecutor(Executors.newFixedThreadPool(20)); // ATTENTION
                    httpServer.start();
                    AbbozzaLogger.out("Http-server started on port: " + serverPort, AbbozzaLogger.INFO);
                } catch (Exception e) {
                    // AbbozzaLogger.stackTrace(e);
                    AbbozzaLogger.err(e.getLocalizedMessage());
                    e.printStackTrace(System.out);
                    AbbozzaLogger.out("Port " + serverPort + " failed", AbbozzaLogger.INFO);
                    serverPort++;
                    httpServer = null;
                }
            }

            AbbozzaLogger.out("abbozza: " + AbbozzaLocale.entry("msg.server_started", Integer.toString(config.getServerPort())), 4);

            String url = "http://localhost:" + config.getServerPort() + "/" + system + ".html";
            AbbozzaLogger.out("abbozza: " + AbbozzaLocale.entry("msg.server_reachable", url));
        }
    }

    /**
     * Starts the Browser with the given URL.
     *
     * @param url The URL to be opened
     */
    public void startBrowser(String url) {
        AbbozzaLogger.out("Starting browser");
        Runtime runtime = Runtime.getRuntime();

        if ((config.getBrowserPath() != null) && (!config.getBrowserPath().equals(""))) {
            String[] cmd;
            String line;
            // cmd[0] =  "\"" + config.getBrowserPath().replace("\"", "\\\"") + "\"";
            String opts = config.getProperty("browserOptions");
            if (opts == null) {
                cmd = new String[2];
                cmd[0] = expandPath(config.getBrowserPath());
                cmd[1] = "http://localhost:" + serverPort + "/" + system + ".html";
                line = cmd[0] + " " + cmd[1];
            } else {
                cmd = new String[3];
                cmd[0] = expandPath(config.getBrowserPath());
                cmd[1] = opts;
                cmd[2] = "http://localhost:" + serverPort + "/" + system + ".html";
                line = cmd[0] + " " + cmd[1] + " " + cmd[2];
            }
            // String cmd = config.getBrowserPath() + " http://localhost:" + serverPort + "/" + file;
            try {
                AbbozzaLogger.out("Starting browser: " + line);
                runtime.exec(cmd);
                toolToBack();
            } catch (IOException e) {
                AbbozzaLogger.err("Browser could not be started: " + e.getMessage());
            }
        } else {
            Object[] options = {AbbozzaLocale.entry("msg.cancel"), AbbozzaLocale.entry("msg.open_standard_browser"), AbbozzaLocale.entry("msg.give_browser")};
            Object selected = JOptionPane.showOptionDialog(null, AbbozzaLocale.entry("msg.no_browser_given"),
                    AbbozzaLocale.entry("msg.no_browser_given"),
                    JOptionPane.DEFAULT_OPTION, JOptionPane.ERROR_MESSAGE,
                    null, options, options[0]);
            switch (selected.toString()) {
                case "0":
                    AbbozzaLogger.out("Aborted by user");
                    System.exit(0);
                    break;
                case "1":
                    boolean failed = false;
                    if (Desktop.isDesktopSupported()) {
                        try {
                            Desktop desktop = Desktop.getDesktop();
                            if (desktop.isSupported(Desktop.Action.BROWSE)) {
                                String xurl = "localhost:" + serverPort + "/abbozza.html";
                                // if (this.getSystem().equals("Mac")) {
                                //     Runtime runtimeMac = Runtime.getRuntime();
                                //     String[] args = { "osascript", "-e", "open location \"" + url + "\"" };
                                //     try {
                                //         Process process = runtimeMac.exec(args);
                                //     }
                                //     catch (IOException e) {
                                //         failed = true;
                                //      }                                    
                                // } else {
                                Desktop.getDesktop().browse(new URI(xurl));
                                // }
                            } else {
                                failed = true;
                            }
                        } catch (IOException | URISyntaxException e) {
                            failed = true;
                        }
                    } else {
                        failed = true;
                    }
                    if (failed) {
                        JOptionPane.showMessageDialog(null, AbbozzaLocale.entry("msg.cant_open_standard_browser"), "abbozza!", JOptionPane.ERROR_MESSAGE);
                        AbbozzaLogger.out("standard browser could not be started");
                        System.exit(0);
                    }
                    break;
                case "2":
                    AbbozzaConfigDialog dialog = new AbbozzaConfigDialog(config.get(), null, true, true);
                    dialog.setModal(true);
                    dialog.setVisible(true);
                    if (dialog.getState() == 0) {
                        config.set(dialog.getConfiguration());
                        AbbozzaLocale.setLocale(config.getLocale());
                        config.write();
                        String[] cmd = new String[2];
                        cmd[0] = expandPath(config.getBrowserPath());
                        cmd[1] = "http://localhost:" + serverPort + "/" + system + ".html";
                        try {
                            AbbozzaLogger.out("Starting browser: " + cmd[0] + " " + cmd[1]);
                            runtime.exec(cmd);
                            toolToBack();
                        } catch (IOException e) {
                            AbbozzaLogger.err("Browser could not be started: " + e.getMessage());
                        }
                        // sendResponse(exchg, 200, "text/plain", abbozza.getProperties().toString());
                    } else {
                        // sendResponse(exchg, 440, "text/plain", "");
                    }
                    break;
            }
        }
    }

    /**
     * Request handling
     *
     * @param exchg The {@link HttpExchange} to be handled.
     *
     * @throws java.io.IOException Thrown if an error occured.
     */
    @Override
    public void handle(HttpExchange exchg) throws IOException {
        String path = exchg.getRequestURI().getPath();
        OutputStream os = exchg.getResponseBody();

        AbbozzaLogger.out(path + " requested", AbbozzaLogger.DEBUG);

        if (!path.startsWith("/" + system)) {
            String result = AbbozzaLocale.entry("msg.not_found", path);
            exchg.sendResponseHeaders(400, result.length());
            os.write(result.getBytes());
            os.close();
        } else {
            Headers responseHeaders = exchg.getResponseHeaders();
            responseHeaders.set("Content-Type", "text/plain");
            exchg.sendResponseHeaders(200, 0);
            os.close();
        }
    }

    /**
     * Abstract system specific operations
     */
    /**
     * This operation registers additional, system specific handlers, like the
     * board handler.
     *
     */
    public abstract void registerSystemHandlers();

    /**
     * This operation finds the jars and directories to be used by the server
     * and adds them to the given jarHandler.
     *
     * @param jarHandler The jarHandler to which the jars and directories should
     * be added.
     */
    public abstract void findJarsAndDirs(JarDirHandler jarHandler);

    /**
     * Abstract operations for Tool handling, compilation etc.
     */
    /**
     * Moves the tool window to the back.
     */
    public abstract void toolToBack();

    /**
     * Sets the code in the tool window.
     *
     * @param code The generated code.
     */
    public abstract void toolSetCode(String code);

    /**
     * Iconifies the tool window.
     */
    public abstract void toolIconify();

    /**
     * Compiles the given code
     *
     * @param code The code to be compiled.
     * @return The output produced by the compilation process. The result is
     * empty, if the compilation was successful.
     */
    public abstract int compileCode(String code);

    /**
     * Compiles and uploads the code to the board.
     *
     * @param code The code to be compiled.
     * @return The output produced by the compilation process. The result is
     * empty, if the compilation was successful.
     */
    public abstract int uploadCode(String code);

    public String getCompileErrorMsg() {
        return compileErrorMsg;
    }

    public String getCompileMsg() {
        return compileMsg;
    }

    /**
     * Detects a connected board.
     *
     * @return The string indicating the path or name of the board. Empty if no
     * board was found
     */
    public abstract String findBoard();

    /**
     * This operation asks the user for to select a board/path.
     *
     * @param path The preset path/name.
     * @return The path/name selected by the user.
     */
    public abstract File queryPathToBoard(String path);

    /**
     * This operation checks for updates
     *
     * @param reportNoUpdate True if an update is available.
     */
    public void checkForUpdate(boolean reportNoUpdate) {
        checkForUpdate(reportNoUpdate, null);
    }

    /**
     * This operation checks for updates
     *
     * @param reportNoUpdate True if an update is available.
     * @param confurl An url overriding the config value
     */
    public void checkForUpdate(boolean reportNoUpdate, String confurl) {
        String updateUrl = AbbozzaServer.getConfig().getUpdateUrl() + this.system + "/";
        if (confurl != null) {
            updateUrl = confurl + this.system + "/";
        }
        String version = "";

        int major = 0;
        int minor = 0;
        int rev = 0;
        int hotfix = 0;

        // Retrieve the update version from <updateUrl>/VERSION
        URL url;
        try {
            url = new URL(updateUrl + "VERSION");
            BufferedReader br = new BufferedReader(new InputStreamReader(url.openStream()));
            version = br.readLine();
            br.close();
            int pos = version.indexOf('.');
            try {
                major = Integer.parseInt(version.substring(0, pos));
                int pos2 = version.indexOf('.', pos + 1);
                minor = Integer.parseInt(version.substring(pos + 1, pos2));
                pos = version.indexOf('.', pos2 + 1);
                rev = Integer.parseInt(version.substring(pos2 + 1, pos));
                hotfix = Integer.parseInt(version.substring(pos + 1));
            } catch (NumberFormatException ex) {
            }
            AbbozzaLogger.out("Checking for update at " + updateUrl, AbbozzaLogger.INFO);
            AbbozzaLogger.out("Update version " + major + "." + minor + "." + rev + "." + hotfix, AbbozzaLogger.INFO);

            String[] sysver = getSystemVersion().split("[\\ \\.]");
            int sys_major = Integer.parseInt(sysver[0]);
            int sys_minor = Integer.parseInt(sysver[1]);
            int sys_rev = Integer.parseInt(sysver[2]);
            int sys_hotfix = Integer.parseInt(sysver[3]);

            // Checking version of update
            if ((major > sys_major)
                    || ((major == sys_major) && (minor > sys_minor))
                    || ((major == sys_major) && (minor == sys_minor) && (rev > sys_rev))
                    || ((major == sys_major) && (minor == sys_minor) && (rev == sys_rev) && (hotfix > sys_hotfix))) {
                AbbozzaLogger.out("New version found", AbbozzaLogger.INFO);
                int res = JOptionPane.showOptionDialog(null, AbbozzaLocale.entry("gui.new_version", version), AbbozzaLocale.entry("gui.new_version_title"), JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE, null, null, null);
                if (res == JOptionPane.NO_OPTION) {
                    return;
                }

                installUpdate(version, updateUrl);

            } else {
                AbbozzaLogger.out("No VERSION found at " + updateUrl, AbbozzaLogger.INFO);
                if (reportNoUpdate) {
                    JOptionPane.showMessageDialog(null, AbbozzaLocale.entry("gui.no_update"));
                }
            }
        } catch (MalformedURLException ex) {
            AbbozzaLogger.err("Malformed URL for update: " + updateUrl);
        } catch (IOException ex) {
            AbbozzaLogger.err("VERSION file not found at " + updateUrl);
        }
    }

    // @TODO Change the path
    /*
    public byte[] getLocaleBytes(String locale) throws IOException {
        AbbozzaLogger.out("Loading locale " + locale);
        if (jarHandler != null) {
            byte[] bytes = jarHandler.getBytes("/js/languages/" + locale + ".xml");
            if (bytes != null) {
                AbbozzaLogger.out("Loaded locale " + locale);
                return bytes;
            }
        }
        AbbozzaLogger.out("Could not find /js/languages/" + locale + ".xml", AbbozzaLogger.ERROR);
        return null;
    }
     */
    // @TODO change path
    public Vector getLocales() {
        Vector locales = new Vector();
        if (jarHandler != null) {
            try {
                byte[] bytes = jarHandler.getBytes("/js/languages/locales.xml");
                if (bytes != null) {
                    Document localeXml;

                    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                    DocumentBuilder builder;
                    builder = factory.newDocumentBuilder();
                    StringBuilder xmlStringBuilder = new StringBuilder();
                    ByteArrayInputStream input = new ByteArrayInputStream(bytes);
                    localeXml = builder.parse(input);

                    NodeList nodes = localeXml.getElementsByTagName("locale");
                    for (int i = 0; i < nodes.getLength(); i++) {
                        Node node = nodes.item(i);
                        String id = node.getAttributes().getNamedItem("id").getNodeValue();
                        String name = node.getTextContent();
                        locales.add(new LocaleEntry(name, id));
                    }

                    AbbozzaLogger.out("Loaded list of locales");
                }
            } catch (IOException | SAXException | ParserConfigurationException ex) {
                AbbozzaLogger.out("Could not find /js/languages/locales.xml", AbbozzaLogger.ERROR);
            }
        }
        return locales;
    }

    /**
     * This operation constructs the option tree from the global options.xml and
     * the option tag inside all plugins.
     *
     * @return The XML-document containing the option tree
     */
    public Document getOptionTree() {
        Document optionsXml = null;

        if (jarHandler != null) {

            // Retreive the global option tree
            try {
                byte[] bytes = jarHandler.getBytes("/js/abbozza/" + system + "/options.xml");
                if (bytes != null) {
                    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                    DocumentBuilder builder;
                    builder = factory.newDocumentBuilder();
                    StringBuilder xmlStringBuilder = new StringBuilder();
                    ByteArrayInputStream input = new ByteArrayInputStream(bytes);
                    optionsXml = builder.parse(input);
                } else {
                    // options.xml not found
                    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                    DocumentBuilder builder;
                    builder = factory.newDocumentBuilder();
                    optionsXml = builder.newDocument();
                    optionsXml.createElement("options");
                }

                // If successful, add the plugin trees
                Node root = optionsXml.getElementsByTagName("options").item(0);
                Enumeration<Plugin> plugins = this.pluginManager.plugins();
                while (plugins.hasMoreElements()) {
                    Plugin plugin = plugins.nextElement();
                    Node pluginOpts = plugin.getOptions();

                    ((Element) pluginOpts).setAttribute("plugin", plugin.getId());

                    Node parent = null;
                    String parentName = plugin.getParentOption();
                    NodeList nodes = optionsXml.getElementsByTagName("item");
                    for (int i = 0; i < nodes.getLength(); i++) {
                        String name = null;
                        Node node = (Node) nodes.item(i);
                        if (node.getAttributes().getNamedItem("option") != null) {
                            name = node.getAttributes().getNamedItem("option").getTextContent();
                            if (name.equals(parentName)) {
                                parent = node;
                            }
                        }
                    }
                    optionsXml.adoptNode(pluginOpts);

                    if (parent != null) {
                        parent.appendChild(pluginOpts);
                    } else {
                        root.appendChild(pluginOpts);
                    }
                }

            } catch (Exception ex) {
                ex.printStackTrace(System.out);
            }
        }
        return optionsXml;
    }

    public int openConfigDialog() {
        // Prevent opening another dialog
        if (this.isDialogOpen()) {
            return 1;
        }

        AbbozzaConfig config = this.getConfiguration();
        Properties props = config.get();

        this.bringFrameToFront();
        toolIconify();

        AbbozzaConfigDialog dialog = new AbbozzaConfigDialog(props, null, false, true);

        adaptConfigDialog(dialog);
        GUITool.centerWindow(dialog);
        dialog.setModal(true);
        dialog.toFront();
        dialog.setVisible(true);

        if (dialog.getState() == 0) {
            config.set(dialog.getConfiguration());
            AbbozzaLocale.setLocale(config.getLocale());
            AbbozzaLogger.out("closed with " + config.getLocale());
            config.write();
            return 0;
        } else {
            return 1;
        }

    }

    public void adaptConfigDialog(AbbozzaConfigDialog dialog) {
    }

    public void monitorIsClosed() {
        this.monitorHandler.close();
    }

    public AbbozzaConfig getConfiguration() {
        return config;
    }

    public URL getLastSketchFile() {
        if (_lastSketchFile == null) {
            try {
                _lastSketchFile = new File(this.sketchbookPath).toURI().toURL();
            } catch (MalformedURLException ex) {
                _lastSketchFile = null;
            }
        }
        return _lastSketchFile;
    }

    public void setLastSketchFile(URL lastSketchFile) {
        this._lastSketchFile = lastSketchFile;
    }

    public void setTaskContext(URL context) {
        _taskContext = context;
        AbbozzaLogger.out("Task context set to " + _taskContext, AbbozzaLogger.DEBUG);
    }

    public URL getTaskContext() {
        return _taskContext;
    }

    public JarDirHandler getJarHandler() {
        return jarHandler;
    }

    public String getSerialPort() {
        AbbozzaLogger.out("Checking serial ports", AbbozzaLogger.INFO);

        String[] portNames = SerialPortList.getPortNames();

        AbbozzaLogger.out("Fetched serial ports", AbbozzaLogger.INFO);

        if (portNames.length == 0) {
            System.out.println("No serial ports found");
            return null;
        } else if (portNames.length == 1) {
            System.out.println("Unique port found: " + portNames[0]);
            return portNames[0];
        } else {
            System.out.println("Several ports found:");
            for (int i = 0; i < portNames.length; i++) {
                System.out.println("\t" + portNames[i]);
            }
        }

        return portNames[0];
    }

    public int getBaudRate() {
        return SerialPort.BAUDRATE_115200;
    }

    public static PluginManager getPluginManager() {
        return instance.pluginManager;
    }

    public static Plugin getPlugin(String id) {
        return instance.pluginManager.getPlugin(id);
    }

    public static AbbozzaServer getInstance() {
        return instance;
    }

    public static AbbozzaConfig getConfig() {
        return getInstance().config;
    }

    public static void printXML(Node node) {
        StringWriter sw = new StringWriter();
        try {
            Transformer t = TransformerFactory.newInstance().newTransformer();
            t.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            t.transform(new DOMSource(node.cloneNode(true)), new StreamResult(sw));
        } catch (Exception te) {
            System.out.println("nodeToString Transformer Exception");
        }
        System.out.println(sw.toString());
    }

    public static void printXML(Document doc) {
        try {
            Transformer transformer = TransformerFactory.newInstance().newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
            //initialize StreamResult with File object to save to file
            StreamResult result = new StreamResult(new StringWriter());
            DOMSource source = new DOMSource(doc);
            transformer.transform(source, result);
            String xmlString = result.getWriter().toString();
            System.out.println(xmlString);
        } catch (TransformerConfigurationException ex) {
            ex.printStackTrace(System.out);
        } catch (TransformerException ex) {
            ex.printStackTrace(System.out);
        }
    }

    public boolean checkLibrary(String name) {
        return false;
    }

    public void setBoardName(String name) {
        this._boardName = name;
    }

    public String getBoardName() {
        return this._boardName;
    }

    public void additionalInitialization() {
    }

    public void setAdditionalPaths() {
    }

    public boolean isDialogOpen() {
        return dialogOpen;
    }

    public void setDialogOpen(boolean dialogOpen) {
        this.dialogOpen = dialogOpen;
    }

    public void bringFrameToFront() {
        if (mainFrame == null) {
            return;
        }
        oldState = mainFrame.getExtendedState();
        AbbozzaLogger.err("oldState gets " + oldState);
        GUITool.bringToFront(mainFrame);
    }

    public void resetFrame() {
        if (mainFrame == null) {
            return;
        }
        if ((oldState & JFrame.ICONIFIED) > 0) {
            AbbozzaLogger.err("oldState was " + oldState);
            AbbozzaLogger.err("was iconified");
            int state = mainFrame.getExtendedState() | JFrame.ICONIFIED;
            mainFrame.setExtendedState(state);
            String osName = System.getProperty("os.name");
            if (osName.contains("Mac")) {
                // To minimize the mainFrame in Mac OS this seems to be required
                mainFrame.setVisible(false);
                mainFrame.setVisible(true);
            }
        } else {
            AbbozzaLogger.err("wasn't iconified");
            mainFrame.setExtendedState(oldState);
        }
        // mainFrame.setVisible(true);
    }

    protected String expandPath(String path) {
        if (path == null) {
            return null;
        }

        String xPath = InstallTool.expandPath(path);

        // if (path.contains("%HOME%")) {
        //     xPath = xPath.replace("%HOME%", System.getProperty("user.home"));
        // }
        if (xPath.contains("%ABBOZZA%")) {
            xPath = xPath.replace("%ABBOZZA%", abbozzaPath);
        }
        return xPath;
    }

    public String getVersion() {
        return getSystemVersion();
    }

    public String getCommonVersion() {
        return "" + VER_MAJOR + "." + VER_MINOR + "." + VER_HOTFIX;
    }

    public String getSystemVersion() {
        return "-1.-1 (common)";
    }

    ;

    public abstract boolean installPluginFile(InputStream stream, String name);

    public abstract void installUpdate(String version, String updateUrl);

    public boolean isRemoteAccessDenied() {
        return denyRemoteAccess;
    }

    public boolean isHostAllowed(String host) {
        if (allowedHosts == null) {
            allowedHosts = "";
        }
        return allowedHosts.contains(host);
    }
    
    public String getIp4Address() {
        if ( this.ip4Address == null ) {
            return "???";
        }
        return this.ip4Address.getHostAddress();
    }

    public String getIp6Address() {
        if ( this.ip6Address == null ) {
            return "???";
        }
        return this.ip6Address.getHostAddress();
    }
    
}
