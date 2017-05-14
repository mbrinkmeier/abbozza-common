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
import de.uos.inf.did.abbozza.plugin.PluginManager;
import de.uos.inf.did.abbozza.plugin.Plugin;
import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringWriter;
import java.net.InetSocketAddress;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Enumeration;
import java.util.Properties;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;
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
    public static final int VER_MAJOR = 0;
    public static final int VER_MINOR = 8;
    public static final int VER_REV = 4;
    public static final int VER_HOTFIX = 0;
    public static final String VER_REM = "";
    public static final String VERSION = "" + VER_MAJOR + "." + VER_MINOR + "." + VER_REV + "." + VER_HOTFIX + " " + VER_REM;

    // Instance
    private static AbbozzaServer instance;

    // The paths
    protected String globalJarPath;      // The directory containing the global jar
    protected String localJarPath;       // The directory containig the local jar
    protected String sketchbookPath;    // The default path fpr local Sketches
    protected String configPath;        // The path to the config file

    // several attributes
    protected String system;                // the name of the system (used for paths)
    protected JarDirHandler jarHandler;

    protected AbbozzaConfig config = null;
    private boolean isStarted = false;      // true if the server was started
    // public ByteArrayOutputStream logger;
    private DuplexPrintStream errStream;
    private DuplexPrintStream outStream;
    protected HttpServer httpServer;
    private int serverPort;
    public MonitorHandler monitorHandler;
    private URL _lastSketchFile = null;
    private URL _taskContext;
    protected String globalPluginPath;
    protected String localPluginPath;
    private PluginManager pluginManager;

    protected String _boardName;
    
    /**
     * The system independent initialization of the server
     *
     * @param system
     */
    public void init(String system) {
        // If there is already an Abbozza instance, silently die
        if (instance != null) {
            return;
        }

        // Set the system name
        this.system = system;

        // Initialize the logger
        AbbozzaLogger.init();
        AbbozzaLogger.setLevel(AbbozzaLogger.DEBUG);

        // Set static instance
        instance = this;

        AbbozzaLogger.out("Setting paths");
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
        configPath = System.getProperty("user.home") + "/.abbozza/" + this.system + "/abbozza.cfg";
        System.out.println("Reading config from " + configPath);
        config = new AbbozzaConfig(configPath);

        AbbozzaLocale.setLocale(config.getLocale());

        AbbozzaLogger.out("Version " + VERSION, AbbozzaLogger.INFO);

        if (this.getConfiguration().getUpdate()) {
            checkForUpdate(false);
        }

        try {
            this._taskContext = new File(this.getConfiguration().getTaskPath()).toURI().toURL();
        } catch (MalformedURLException ex) {
            this._taskContext = null;
        }

        // AbbozzaLocale.setLocale("de_DE");
        AbbozzaLogger.out(AbbozzaLocale.entry("msg.loaded"), AbbozzaLogger.INFO);

        // taskHandler = new TaskHandler(this);
        // AbbozzaLogger.out("Path to tasks : " + config.getTaskPath(),AbbozzaLogger.ALL);
        if (config.startAutomatically()) {
            this.startServer();
            if (config.startBrowser()) {
                this.startBrowser(system + ".html");
            }
        }

    }

    public abstract void setPaths();
    public abstract void registerSystemHandlers();

    
    public String getSketchbookPath() {
        return sketchbookPath;
    }

    public String getConfigPath() {
        return configPath;
    }

    public String getGlobalJarPath() {
        return globalJarPath;
    }

    public String getLocalJarPath() {
        return localJarPath;
    }

    public String getGlobalPluginPath() {
        return globalPluginPath;
    }

    public String getLocalPluginPath() {
        return localPluginPath;
    }

    public String getSystem() {
        return this.system;
    }

    public void findJarsAndDirs(JarDirHandler jarHandler) {
        jarHandler.clear();
        jarHandler.addDir(localJarPath, "Local directory");
        jarHandler.addJar(localJarPath + "/Abbozza.jar", "Local jar");
        jarHandler.addDir(globalJarPath, "Global directory");
        jarHandler.addJar(globalJarPath + "/Abbozza.jar", "Global jar");
    }


    public void registerHandlers() {
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
        httpServer.createContext("/abbozza/version", new VersionHandler(this));
        httpServer.createContext("/abbozza/plugins", this.pluginManager);
        httpServer.createContext("/abbozza/", this /* handler */);
        httpServer.createContext("/task/", new TaskHandler(this, jarHandler));
        httpServer.createContext("/", jarHandler);

        this.pluginManager.registerPluginHandlers(httpServer);
    }

    /**
     * Request handling
     *
     * @param exchg
     * @throws java.io.IOException
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
            /*
            String line;
            BufferedReader in = new BufferedReader(new InputStreamReader(exchg.getRequestBody()));
            while (in.ready()) {
                line = in.readLine();
            }
             */

            Headers responseHeaders = exchg.getResponseHeaders();
            responseHeaders.set("Content-Type", "text/plain");
            exchg.sendResponseHeaders(200, 0);
            os.close();
        }
    }

    // Tool handling
    // Moves a tool to the back
    public abstract void toolToBack();

    public abstract void toolSetCode(String code);

    public abstract void toolIconify();

    public abstract String compileCode(String code);

    public abstract String uploadCode(String code);

    public void checkForUpdate(boolean reportNoUpdate) {
        // TODO !!!
        String updateUrl = AbbozzaServer.getConfig().getUpdateUrl();
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
            AbbozzaLogger.out("Update version " + major + "." + minor + "." + rev, AbbozzaLogger.INFO);

            // Checking version of update
            if ((major > VER_MAJOR)
                    || ((major == VER_MAJOR) && (minor > VER_MINOR))
                    || ((major == VER_MAJOR) && (minor == VER_MINOR) && (rev > VER_REV))
                    || ((major == VER_MAJOR) && (minor == VER_MINOR) && (rev > VER_REV) && (hotfix > VER_HOTFIX))) {
                AbbozzaLogger.out("New version found", AbbozzaLogger.INFO);
                int res = JOptionPane.showOptionDialog(null, AbbozzaLocale.entry("gui.new_version", version), AbbozzaLocale.entry("gui.new_version_title"), JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE, null, null, null);
                if (res == JOptionPane.NO_OPTION) {
                    return;
                }
                try {
                    // Rename current jar
                    // AbbozzaLogger.out(this.getSketchbookPath(),AbbozzaLogger.ALL);
                    URL curUrl = AbbozzaServer.class.getProtectionDomain().getCodeSource().getLocation();
                    File cur = new File(curUrl.toURI());
                    AbbozzaLogger.out("Current jar found at " + cur.getAbsolutePath(), AbbozzaLogger.INFO);
                    SimpleDateFormat format = new SimpleDateFormat("yyyyMMdd");
                    String today = format.format(new Date());
                    File dir = new File(cur.getParentFile().getAbsolutePath());
                    if (!dir.exists()) {
                        AbbozzaLogger.out("Creating directory " + dir.getPath(), AbbozzaLogger.INFO);
                        dir.mkdir();
                    }
                    AbbozzaLogger.out("Moving old version to " + dir.getPath() + "/Abbozza." + today + ".jar", AbbozzaLogger.INFO);
                    cur.renameTo(new File(dir.getPath() + "/Abbozza." + today + ".jar"));
                    AbbozzaLogger.out("Downloading version " + version, AbbozzaLogger.INFO);
                    url = new URL(updateUrl + "Abbozza.jar");
                    URLConnection conn = url.openConnection();
                    byte buffer[] = new byte[4096];
                    int n = -1;
                    InputStream ir = conn.getInputStream();
                    FileOutputStream ow = new FileOutputStream(new File(curUrl.toURI()));
                    while ((n = ir.read(buffer)) != -1) {
                        ow.write(buffer, 0, n);
                    }
                    ow.close();
                    ir.close();
                    AbbozzaLogger.out("Stopping arduino", AbbozzaLogger.INFO);
                    System.exit(0);
                } catch (Exception ex) {
                    Logger.getLogger(AbbozzaServer.class.getName()).log(Level.SEVERE, null, ex);
                }
            } else {
                AbbozzaLogger.out(AbbozzaLocale.entry("gui.no_update"), AbbozzaLogger.INFO);
                if (reportNoUpdate) {
                    JOptionPane.showMessageDialog(null, AbbozzaLocale.entry("gui.no_update"));
                }
            }
        } catch (MalformedURLException ex) {
            AbbozzaLogger.err("Malformed URL for update: " + updateUrl);
        } catch (IOException ex) {
            AbbozzaLogger.err("VERSION file not found");
        }
    }

    public void startServer() {

        if ((!isStarted) && (AbbozzaServer.getInstance() == this)) {

            this.isStarted = true;

            AbbozzaLogger.out("Duplexer Started ... ", AbbozzaLogger.INFO);
            AbbozzaLogger.out("Starting ... ", AbbozzaLogger.INFO);

            serverPort = config.getServerPort();
            while (httpServer == null) {
                try {
                    httpServer = HttpServer.create(new InetSocketAddress(serverPort), 0);
                    registerHandlers();
                    httpServer.start();
                    AbbozzaLogger.out("Http-server started on port: " + serverPort, AbbozzaLogger.INFO);
                } catch (Exception e) {
                    AbbozzaLogger.stackTrace(e);
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

    public void startBrowser(String file) {
        Runtime runtime = Runtime.getRuntime();

        if ((config.getBrowserPath() != null) && (!config.getBrowserPath().equals(""))) {
            String cmd = config.getBrowserPath() + " http://localhost:" + serverPort + "/" + file;
            try {
                AbbozzaLogger.out("Starting browser " + cmd);
                runtime.exec(cmd);
                toolToBack();
            } catch (IOException e) {
                // TODO Browser could not be started
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
                                String url = "localhost:" + serverPort + "/abbozza.html";
                                Desktop.getDesktop().browse(new URI(url));
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
                        String cmd = config.getBrowserPath() + " http://localhost:" + serverPort + "/" + system + ".html";
                        try {
                            AbbozzaLogger.out("Starting browser " + cmd);
                            runtime.exec(cmd);
                            toolToBack();
                        } catch (IOException e) {
                            // TODO Browser could not be started
                        }
                        // sendResponse(exchg, 200, "text/plain", abbozza.getProperties().toString());
                    } else {
                        // sendResponse(exchg, 440, "text/plain", "");
                    }
                    break;
            }
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
        AbbozzaConfig config = this.getConfiguration();
        Properties props = config.get();
        AbbozzaConfigDialog dialog = new AbbozzaConfigDialog(props, null, false, true);
        dialog.setAlwaysOnTop(true);
        dialog.setModal(true);
        dialog.toFront();
        dialog.setVisible(true);
        toolIconify();
        if (dialog.getState() == 0) {
            config.set(dialog.getConfiguration());
            AbbozzaLocale.setLocale(config.getLocale());
            AbbozzaLogger.out("closed with " + config.getLocale());
            config.write();
            return 0;
            //sendResponse(exchg, 200, "text/plain", config.get().toString());
        } else {
            return 1;
            //sendResponse(exchg, 440, "text/plain", "");
        }

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

    /*
    public int getRunningServerPort() {
        return serverPort;
    }
     */
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
    
}
