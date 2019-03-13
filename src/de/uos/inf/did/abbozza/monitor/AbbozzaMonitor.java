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
 * @fileoverview The abbozza! varsion of the serial monitor.
 *
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.monitor;

import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.monitor.clacks.ByteRingBuffer;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksBytes;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksMessage;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksService;
import de.uos.inf.did.abbozza.monitor.clacks.ClacksSubscriber;
import de.uos.inf.did.abbozza.plugin.Plugin;
import de.uos.inf.did.abbozza.tools.GUITool;
import java.awt.Color;
import java.awt.Font;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.net.InetSocketAddress;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.DefaultComboBoxModel;
import javax.swing.ImageIcon;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.SwingUtilities;
import javax.swing.text.BadLocationException;
import javax.swing.text.DefaultCaret;
import javax.swing.text.DefaultStyledDocument;
import javax.swing.text.Style;
import javax.swing.text.StyleConstants;
import javax.swing.text.StyleContext;
import jssc.SerialPortList;

/**
 *
 * @author mbrinkmeier
 */
public final class AbbozzaMonitor extends JFrame {

    private final int MAXLEN = 1024 * 32;

    private String boardPort;
    private int baudRate = 115200;
    private boolean monitorEnabled;
    private boolean closed;
    private HashMap<String, MonitorPanel> panels;
    private HashMap<String, MonitorListener> listeners;
    private DefaultStyledDocument protocolDocument;
    protected ByteRingBuffer protocolUpdateBuffer;
    protected AbbozzaWebSocketServer webSocketServer = null;
    protected Thread webSocketServerThread = null;
    
    private ClacksService clacksService;
    private long lastUpdate;

    /**
     * Creates new AbbozzaMonitor and asks for port
     */
    public AbbozzaMonitor() {
        init();
    }

    /**
     * Creates new AbbozzaMonitor with given port
     *
     * @param port The port to which the board is connected.
     * @param rate The baud rate of the serial communication.
     */
    /*
    public AbbozzaMonitor(String port, int rate) {
        init();
        setBoardPort(port, rate);
    }
    */
    
    /**
     * Initialize the Monitor
     */
    private void init() {
        
        initProtocolDocument();

        SerialPortList.getPortNames();
        initComponents();
        
        // protocol = new StringBuffer();
        protocolUpdateBuffer = new ByteRingBuffer(1024 * 512);

        ImageIcon icon = new ImageIcon(AbbozzaMonitor.class.getResource("/img/abbozza_icon_monitor.png"));
        this.setIconImage(icon.getImage());

        DefaultCaret caret = (DefaultCaret) textArea.getCaret();
        caret.setUpdatePolicy(DefaultCaret.ALWAYS_UPDATE);

        this.sendText.getEditor().addActionListener(this::sendTextEditorActionPerformed);

        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent event) {
                try {
                    close();
                    closed = true;
                    AbbozzaServer.getInstance().monitorIsClosed();
                } catch (Exception e) {
                    // ignore
                }
            }
        });

        // Init ClacksService
        clacksService = new ClacksService(this);
        // clacksService.subscribe(this);

        panels = new HashMap<String, MonitorPanel>();
        TableMonitor tableMonitor = new TableMonitor();
        this.addMonitorPanel(tableMonitor, "table");
        this.addMonitorPanel(new GraphMonitor(tableMonitor.getTableModel()), "graph");
        this.addMonitorPanel(new LevelMonitor(tableMonitor.getTableModel()), "level");
        this.addMonitorPanel(new OscillographMonitor(), null);

        listeners = new HashMap<>();

        // Look for plugin panels and listeners
        AbbozzaLogger.info("AbbozzaMonitor: Checking plugins ...");
        Plugin plugin;
        Enumeration<Plugin> plugins = AbbozzaServer.getPluginManager().plugins();
        while (plugins.hasMoreElements()) {
            plugin = plugins.nextElement();
            AbbozzaLogger.info("AbbozzaMonitor: Checking plugin " + plugin.getId());
            this.addMonitorPanel(plugin.getMonitorPanel(), plugin.getMonitorPanelPrefix());
            this.addMonitorListener(plugin.getMonitorListener(), plugin.getMonitorListenerPrefix());
        }

        textArea.addMouseListener(new MouseAdapter() {
            @Override
            public void mousePressed(MouseEvent e) {
                maybeShowPopup(e);
            }

            @Override
            public void mouseReleased(MouseEvent e) {
                maybeShowPopup(e);
            }

            private void maybeShowPopup(MouseEvent e) {
                if (e.isPopupTrigger()) {
                    protocolPopUp.show(e.getComponent(), e.getX(), e.getY());
                }
            }
        });

        this.setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);
        GUITool.centerWindow(this);
        
        // Start WebSocketServer
        /*
        int port = AbbozzaServer.getConfig().getServerPort() + 1;
        try {
            webSocketServer = new AbbozzaWebSocketServer(this,port);
            webSocketServerThread = new Thread(webSocketServer);
            webSocketServerThread.start();
        } catch (Exception xe) {
            AbbozzaLogger.err(xe.getLocalizedMessage());
        }
        */
    }

    /**
     * Initialize styles for the protocol
     */
    private void initProtocolDocument() {
        protocolDocument = new DefaultStyledDocument();

        Style def = StyleContext.getDefaultStyleContext().
                getStyle(StyleContext.DEFAULT_STYLE);

        Style regular = protocolDocument.addStyle("input", def);
        StyleConstants.setFontFamily(def, "SansSerif");

        Style s = protocolDocument.addStyle("error", regular);
        StyleConstants.setItalic(s, true);
        StyleConstants.setForeground(s, Color.red);

        s = protocolDocument.addStyle("output", regular);
        StyleConstants.setBold(s, true);
        StyleConstants.setForeground(s, Color.blue);

        s = protocolDocument.addStyle("info", regular);
        StyleConstants.setBold(s, true);
        StyleConstants.setForeground(s, Color.green);

    }

    /**
     * Open the Monitor, start the ClacksPortHandler
     *
     * @throws Exception An exception is thrown if an error occurs
     */
    public void open() throws Exception {
        AbbozzaLogger.err("AbbozzaMonitor: Open Window");
        closed = false;

        // Set the port
        portBox.setModel(new DefaultComboBoxModel(SerialPortList.getPortNames()));

        this.setVisible(true);

        lastUpdate = System.currentTimeMillis();

        // Start clacks service
        clacksService.execute();

        GUITool.centerWindow(this);
    }

    
    /**
     * Close the monitor.
     *
     * @throws Exception An exception is thrown, if an error occurs
     */
    public void close() throws Exception {
        AbbozzaLogger.debug("AbbozzaMonitor: Closing monitor");
        
        if ( (webSocketServerThread != null) && webSocketServerThread.isAlive() ) {
            AbbozzaLogger.info("AbbozzaMonitor: Stopping WebSocket server");
            webSocketServerThread.interrupt();
        }
        if (clacksService != null) {
            clacksService.cancel(true);
        }

        closed = true;
        this.setVisible(false);
    }

    /**
     * Puts the window in suspend state, closing the serial port to allow other
     * entity (the programmer) to use it
     *
     * @throws Exception An exception is thrown if an error occurs
     */
    public void suspend() throws Exception {
        enableWindow(false);
        clacksService.suspendPort();
    }

    /**
     * Reopen the port
     *
     * @throws Exception An exception is thrown if an error occurs
     */
    public void resume() throws Exception {
        // Enable the window
        portBox.setModel(new DefaultComboBoxModel(SerialPortList.getPortNames()));
        enableWindow(true);

        clacksService.resumePort();
    }

    public void subscribeToClacks(ClacksSubscriber panel) {
        clacksService.subscribe(panel);
    }

    public void unsubscribeFromClacks(ClacksSubscriber panel) {
        clacksService.unsubscribe(panel);
    }

    /**
     * Process a byte packet.
     * 
     * This operation is called by a ClacksBytes object to process itself
     * 
     * @param bytes The byte package
     */
    public void process(ClacksBytes bytes) {
        // Fetch the new bytes from the protocol
        protocolUpdateBuffer.put(bytes.getBytes());
        long cur = System.currentTimeMillis();
        if (cur - lastUpdate > 250) {
            SwingUtilities.invokeLater(new Runnable() {
                public void run() {
                    String update = getProtocolUpdate();
                    if (update.length() > 1024 * 16) {
                        appendText("<< zu schnell für das Protokoll, " + update.length() + " Bytes überprungen>>\n", "error");
                    } else {
                        appendText(update, "input");
                    }
                }
            });
            lastUpdate = cur;
        }
    }
    
    public synchronized void process(ClacksMessage msg) {
        String prefix = msg.getPrefix();
        String cmd = msg.getMsg();

        MonitorPanel panel = panels.get(prefix);
        if (panel != null) {
            panel.processMessage(cmd);
        // } else {
        //     clacksService.sendResponse(cmd);
        }

        // Send message to registered listener
        MonitorListener listener = listeners.get(prefix);
        if (listener != null) {
            listener.processMessage(cmd);
        // } else {
        //    clacksService.sendResponse(cmd);
        }
    }

    /**
     * This method is called from within the constructor to initialize the form.
     * WARNING: Do NOT modify this code. The content of this method is always
     * regenerated by the Form Editor.
     */
    @SuppressWarnings("unchecked")
    // <editor-fold defaultstate="collapsed" desc="Generated Code">//GEN-BEGIN:initComponents
    private void initComponents() {
        java.awt.GridBagConstraints gridBagConstraints;

        protocolPopUp = new javax.swing.JPopupMenu();
        resetItem = new javax.swing.JMenuItem();
        jSeparator1 = new javax.swing.JPopupMenu.Separator();
        incFontSize = new javax.swing.JMenuItem();
        decFontSize = new javax.swing.JMenuItem();
        tabPanel = new javax.swing.JTabbedPane();
        jPanel1 = new javax.swing.JPanel();
        textPane = new javax.swing.JScrollPane();
        textArea = new javax.swing.JTextPane();
        sendButton = new javax.swing.JButton();
        sendText = new javax.swing.JComboBox();
        logoPanel = new javax.swing.JPanel();
        jLabel1 = new javax.swing.JLabel();
        jPanel2 = new javax.swing.JPanel();
        portBox = new javax.swing.JComboBox<>();
        rateBox = new javax.swing.JComboBox<>();

        protocolPopUp.setToolTipText("");

        resetItem.setText("Löschen");
        resetItem.setToolTipText("Löscht das Protokoll");
        resetItem.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                resetItemActionPerformed(evt);
            }
        });
        protocolPopUp.add(resetItem);
        protocolPopUp.add(jSeparator1);

        incFontSize.setText(AbbozzaLocale.entry("gui.inc_font_size"));
        incFontSize.setToolTipText("");
        incFontSize.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                incFontSizeActionPerformed(evt);
            }
        });
        protocolPopUp.add(incFontSize);

        decFontSize.setText(AbbozzaLocale.entry("gui.dec_font_size"));
        decFontSize.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                decFontSizeActionPerformed(evt);
            }
        });
        protocolPopUp.add(decFontSize);

        setDefaultCloseOperation(javax.swing.WindowConstants.DISPOSE_ON_CLOSE);
        setTitle("abbozza! Monitor");
        setMinimumSize(new java.awt.Dimension(640, 480));

        tabPanel.addChangeListener(new javax.swing.event.ChangeListener() {
            public void stateChanged(javax.swing.event.ChangeEvent evt) {
                tabPanelStateChanged(evt);
            }
        });

        java.awt.GridBagLayout jPanel1Layout = new java.awt.GridBagLayout();
        jPanel1Layout.columnWidths = new int[] {0};
        jPanel1Layout.rowHeights = new int[] {0, 17, 0};
        jPanel1Layout.columnWeights = new double[] {100.0};
        jPanel1Layout.rowWeights = new double[] {100.0};
        jPanel1.setLayout(jPanel1Layout);

        textArea.setDocument(protocolDocument);
        textPane.setViewportView(textArea);

        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 0;
        gridBagConstraints.gridy = 0;
        gridBagConstraints.fill = java.awt.GridBagConstraints.BOTH;
        jPanel1.add(textPane, gridBagConstraints);

        sendButton.setMnemonic(KeyEvent.VK_ENTER);
        sendButton.setText(AbbozzaLocale.entry("gui.send"));
        sendButton.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                sendButtonActionPerformed(evt);
            }
        });
        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 0;
        gridBagConstraints.gridy = 2;
        gridBagConstraints.gridwidth = java.awt.GridBagConstraints.REMAINDER;
        gridBagConstraints.fill = java.awt.GridBagConstraints.HORIZONTAL;
        jPanel1.add(sendButton, gridBagConstraints);

        sendText.setEditable(true);
        sendText.setFont(new java.awt.Font("Dialog", 0, 12)); // NOI18N
        gridBagConstraints = new java.awt.GridBagConstraints();
        gridBagConstraints.gridx = 0;
        gridBagConstraints.gridy = 1;
        gridBagConstraints.fill = java.awt.GridBagConstraints.HORIZONTAL;
        jPanel1.add(sendText, gridBagConstraints);

        tabPanel.addTab("Protokoll", jPanel1);

        getContentPane().add(tabPanel, java.awt.BorderLayout.CENTER);

        logoPanel.setLayout(new java.awt.BorderLayout());

        jLabel1.setHorizontalAlignment(javax.swing.SwingConstants.RIGHT);
        jLabel1.setIcon(new javax.swing.ImageIcon(getClass().getResource("/de/uos/inf/did/abbozza/img/abbozza200.png"))); // NOI18N
        jLabel1.setToolTipText("");
        jLabel1.setAlignmentX(1.0F);
        logoPanel.add(jLabel1, java.awt.BorderLayout.EAST);

        portBox.setModel(new DefaultComboBoxModel(SerialPortList.getPortNames()));
        portBox.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                portBoxActionPerformed(evt);
            }
        });
        jPanel2.add(portBox);

        rateBox.setModel(new javax.swing.DefaultComboBoxModel<>(new String[] { "300", "1200", "2400", "4800", "9600", "14400", "19200", "28800", "38400", "57600", "115200", "230400" }));
        rateBox.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                rateBoxActionPerformed(evt);
            }
        });
        jPanel2.add(rateBox);

        logoPanel.add(jPanel2, java.awt.BorderLayout.WEST);

        getContentPane().add(logoPanel, java.awt.BorderLayout.SOUTH);

        pack();
    }// </editor-fold>//GEN-END:initComponents

    /**
     * Delete the protocol.
     *
     * @param evt The evnt trioggerd by selecting the menu item
     */
    private void resetItemActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_resetItemActionPerformed
        try {
            protocolDocument.remove(0, protocolDocument.getLength());
        } catch (BadLocationException ex) {
        }
    }//GEN-LAST:event_resetItemActionPerformed

    /**
     * Send text from the input line to the serial port
     *
     * @param evt
     */
    private void sendButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_sendButtonActionPerformed
        String msg = (String) this.sendText.getEditor().getItem();
        if (msg != null && !msg.isEmpty()) {
            clacksService.sendPacket(new ClacksMessage("",msg + "\n"));
            this.sendText.insertItemAt(msg, 0);
            this.sendText.setSelectedItem(null);
        }
    }//GEN-LAST:event_sendButtonActionPerformed

    /**
     * Changing the serial port.
     *
     * @param evt
     */
    private void portBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_portBoxActionPerformed
        String port = (String) portBox.getSelectedItem();
        try {
            if (port == null) {
                return;
            }
            if ((boardPort != null) && (port.equals(boardPort))) {
                return;
            }
            boardPort = port;
            AbbozzaLogger.out("AbbozzaMonitor.portBoxActionPerformed: Switching to " + boardPort);
            if ( clacksService != null ) clacksService.setPort(boardPort);
        } catch (Exception ex) {
            AbbozzaLogger.err("AbbozzaMonitor.portBoxActionPerformed: Could not open " + port);
        }
    }//GEN-LAST:event_portBoxActionPerformed

    /**
     * Changing the baud rate of the selected serial port.
     *
     * @param evt
     */
    private void rateBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_rateBoxActionPerformed
        String rateString = (String) rateBox.getSelectedItem();
        if (rateString == null) {
            return;
        }
        baudRate = Integer.parseInt(rateString);
        AbbozzaLogger.debug("AbbozzaMonitor.portBoxActionPerformed: Setting rate to " + rateString);
        if (clacksService != null) {
            clacksService.setRate(baudRate);
        }
    }//GEN-LAST:event_rateBoxActionPerformed


    private void tabPanelStateChanged(javax.swing.event.ChangeEvent evt) {//GEN-FIRST:event_tabPanelStateChanged
    }//GEN-LAST:event_tabPanelStateChanged


    private void incFontSizeActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_incFontSizeActionPerformed
        Font oldfont = textArea.getFont();
        int size = (oldfont.getSize() + 1) % 80;
        Font newfont = new Font(oldfont.getFontName(), Font.PLAIN, size);
        textArea.setFont(newfont);
    }//GEN-LAST:event_incFontSizeActionPerformed

    private void decFontSizeActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_decFontSizeActionPerformed
        Font oldfont = textArea.getFont();
        int size = (oldfont.getSize() - 1) % 80;
        Font newfont = new Font(oldfont.getFontName(), Font.PLAIN, size);
        textArea.setFont(newfont);
    }//GEN-LAST:event_decFontSizeActionPerformed

    private void sendTextEditorActionPerformed(java.awt.event.ActionEvent evt) {
        String msg = evt.getActionCommand();
        if (msg != null && !msg.isEmpty()) {
            clacksService.sendPacket(new ClacksMessage("",msg + "\n"));
            // appendText(msg + "\n", "output");
            this.sendText.insertItemAt(msg, 0);    // new String(msg)
            this.sendText.setSelectedItem(null);
        }
    }


    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JMenuItem decFontSize;
    private javax.swing.JMenuItem incFontSize;
    private javax.swing.JLabel jLabel1;
    private javax.swing.JPanel jPanel1;
    private javax.swing.JPanel jPanel2;
    private javax.swing.JPopupMenu.Separator jSeparator1;
    private javax.swing.JPanel logoPanel;
    private javax.swing.JComboBox<String> portBox;
    private javax.swing.JPopupMenu protocolPopUp;
    private javax.swing.JComboBox<String> rateBox;
    private javax.swing.JMenuItem resetItem;
    private javax.swing.JButton sendButton;
    private javax.swing.JComboBox sendText;
    private javax.swing.JTabbedPane tabPanel;
    private javax.swing.JTextPane textArea;
    private javax.swing.JScrollPane textPane;
    // End of variables declaration//GEN-END:variables

    /**
     * Returns the current port is a board is connected, null otherwise.
     *
     * @return The name of the port
     */
    public String getPort() {
        return (String) this.portBox.getSelectedItem();
    }

    /**
     * Returns the current baud rate.
     *
     * @return The name of the port
     */
    public int getRate() {
        int rate = Integer.parseInt((String) rateBox.getSelectedItem());
        return rate;
    }

    /**
     * Enque a message from a HTTP-request for sending. Assign an ID to it and
     * wait for a response, if the timeout is positive.
     *
     * @param msg The message to be send
     * @param exchg The HttpExchange object representing the request
     * @param handler The Handler handling the request
     * @param timeout The timeout for the response (if greater than zero)
     *
     * @return The enqued message object
     */
    /*
    public Message sendMessage(String msg, HttpExchange exchg, SerialHandler handler, long timeout) {
        Message mesg;
        if (this.boardPort == null) {
            return null;
        }
        if (timeout > 0) {
            String id = "_" + Long.toHexString(System.currentTimeMillis());
            // return _portHandler.sendMessage(id, msg, exchg, handler, timeout);
            return clacksService.sendMessage(id, msg, exchg, handler, timeout);
        } else {
            // mesg = _portHandler.sendMessage(msg);
            mesg = clacksService.sendMessage(msg);
            try {
                handler.sendResponse(exchg, 200, "text/plain", "ok");
            } catch (IOException ex) {
                AbbozzaLogger.stackTrace(ex);
            }
        }
        return mesg;
    }
    */

    /**
     * Append a text to the textfield showing the communication.
     *
     * @param update The text to be appended
     * @param style The style of the text
     */
    public synchronized void appendText(String update, String style) {

        try {
            protocolDocument.insertString(
                    protocolDocument.getLength(),
                    update,
                    protocolDocument.getStyle(style)
            );

            int len = protocolDocument.getLength();
            if (len > 2 * MAXLEN) {
                protocolDocument.remove(0, MAXLEN);
            }
        } catch (BadLocationException ex) {
            Logger.getLogger(AbbozzaMonitor.class.getName()).log(Level.SEVERE, null, ex);
        }

    }


    /**
     * Add a Panel to the Monitor. Messages enclosed in double brackets of the
     * form [[ <prefix> <msg> ]] are send to the panel.
     *
     * @param panel The panel to be added
     * @param prefix The prefix of messages handled by the panel
     */
    private void addMonitorPanel(MonitorPanel panel, String prefix) {
        if (panel != null) {
            tabPanel.add(panel, 0);
            if (prefix != null) {
                panels.put(prefix, panel);
                AbbozzaLogger.info("AbbozzaMonitor: Panel for prefix " + prefix + " added");
            } else {
                AbbozzaLogger.info("AbbozzaMonitor: Panel added");
            }
            panel.connect(this);
        }
    }

    /**
     * Add a Listener to the Monitor. Messages enclosed in double brackets of
     * the form [[ <prefix> <msg> ]] are send to the panel.
     *
     * @param panel The panel to be added
     * @param prefix The prefix of messages handled by the panel
     */
    private void addMonitorListener(MonitorListener listener, String prefix) {
        if (listener != null) {
            AbbozzaLogger.info("AbbozzaMonitor: Listener for prefix " + prefix + " added");
            listeners.put(prefix, listener);
        }
    }

    public void setBoardPort(String boardPort, int rate) {
        setBoardPort(boardPort);
        setRate(rate);
    }

    /**
     * Set the board port
     * 
     * @param port The selected port
     */
    public void setBoardPort(String port) {
        this.boardPort = port;
        for (int i = 0; i < portBox.getItemCount(); i++) {
            String p = portBox.getItemAt(i);
            if (p.equals(port)) {
                portBox.setSelectedIndex(i);
                return;
            }
        }
        portBox.addItem(boardPort);
        portBox.setSelectedItem(boardPort);
    }
    
    
    /**
     * Set the rate selected in the rate box.
     * 
     * @param rate The rate to be set
     */
    public void setRate(int rate) {
        for (int i = 0; i < rateBox.getItemCount(); i++) {
            String baud = rateBox.getItemAt(i);
            int ra = Integer.parseInt(baud);
            if (ra == rate) {
                rateBox.setSelectedIndex(i);
            }
        }

    }
    
    
    /**
     * Enable the window
     * 
     * @param enable The flag inidcates wether the window should be enabled or disabled
     */
    public void enableWindow(boolean enable) {
        this.setVisible(true);

        monitorEnabled = enable;

        textArea.setEnabled(enable);
        panels.values().forEach((panel) -> {
            panel.setEnabled(enable);
        });
    }

    /**
     * Scanning all ports.
     */
    void scanPorts() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public String getProtocolUpdate() {
        String update = protocolUpdateBuffer.toString();
        protocolUpdateBuffer.clear();
        return update;
    }

    public ClacksService getClacksService() {
        return clacksService;
    }
    
    
    public InetSocketAddress getWebSocketAddress() {
        if ( this.webSocketServer != null ) {
            return this.webSocketServer.getAddress();
        }
        return null;
    }

}
