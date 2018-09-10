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

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.core.AbbozzaServer;
import de.uos.inf.did.abbozza.handler.SerialHandler;
import de.uos.inf.did.abbozza.plugin.Plugin;
import de.uos.inf.did.abbozza.tools.GUITool;
import java.awt.Font;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.IOException;
import java.io.PipedOutputStream;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import javax.swing.DefaultComboBoxModel;
import javax.swing.ImageIcon;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.Timer;
import javax.swing.text.DefaultCaret;
import jssc.SerialPort;
import jssc.SerialPortList;

/**
 *
 * @author mbrinkmeier
 */
public final class AbbozzaMonitor extends JFrame implements ActionListener {

    private String boardPort;
    private int baudRate = SerialPort.BAUDRATE_115200;
    private boolean monitorEnabled;
    private boolean closed;
    private StringBuffer updateBuffer = null;
    private Timer updateTimer = null;
    private StringBuffer unprocessedMsg;
    private HashMap<String, MonitorPanel> panels;
    private HashMap<String, MonitorListener> listeners;
    protected HashMap<String, Message> _waitingMsg;
    private ClacksPortHandler _portHandler;

    private PipedOutputStream _byteStream;
    private MonitorPanel _activePanel;

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
    public AbbozzaMonitor(String port, int rate) {
        init();
        setBoardPort(port, rate);
    }

    /**
     * Initialize the Monitor
     */
    private void init() {
        _waitingMsg = new HashMap<String, Message>();

        if (_portHandler == null) {
            _portHandler = new ClacksPortHandler(this);
        }

        /*
        if (!_portHandler.isAlive()) {
            _portHandler.start();
        }
        */
        
        _byteStream = null;

        initComponents();

        ImageIcon icon = new ImageIcon(AbbozzaMonitor.class.getResource("/img/abbozza_icon_monitor.png"));
        this.setIconImage(icon.getImage());

        DefaultCaret caret = (DefaultCaret) textArea.getCaret();
        caret.setUpdatePolicy(DefaultCaret.ALWAYS_UPDATE);

        this.sendText.getEditor().addActionListener(this::sendTextEditorActionPerformed);

        addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent event) {
                try {
                    closeByteStream();
                    close();
                    closed = true;
                    AbbozzaServer.getInstance().monitorIsClosed();
                } catch (Exception e) {
                    // ignore
                }
            }
        });

        updateBuffer = new StringBuffer(1048576);
        updateTimer = new Timer(33, this);
        updateTimer.start();
        unprocessedMsg = new StringBuffer();

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
    }

    /**
     * Open the Monitor, start the ClacksPortHandler
     *
     * @throws Exception
     */
    public void open() throws Exception {
        AbbozzaLogger.err("AbbozzaMonitor: Opening Window");
        closed = false;

        // Set the port
        portBox.setModel(new DefaultComboBoxModel(SerialPortList.getPortNames()));

        this.setVisible(true);

        if (!_portHandler.openPort(true)) {
            String msg = "No board connected!\n";
            addToUpdateBuffer(msg.toCharArray(), msg.length());
        }

        GUITool.centerWindow(this);
    }

    /**
     * Close the monitor.
     *
     * @throws Exception
     */
    public void close() throws Exception {
        AbbozzaLogger.debug("AbbozzaMonitor: Closing monitor");
        _portHandler.closePort();

        closed = true;
        this.setVisible(false);
    }

    /**
     * Puts the window in suspend state, closing the serial port to allow other
     * entity (the programmer) to use it
     *
     */
    public void suspend() throws Exception {
        enableWindow(false);
        _portHandler.suspendPort();
    }

    /**
     * Reopen the port
     *
     * @throws Exception
     */
    public void resume() throws Exception {
        // Enable the window
        portBox.setModel(new DefaultComboBoxModel(SerialPortList.getPortNames()));
        enableWindow(true);

        _portHandler.resumePort();
    }

    /**
     * Adding Strings to the update buffer. The update buffer is checked for
     * complete incoming messages of the form [[<msg>]]
     *
     * @param buff
     * @param n
     */
    public synchronized void addToUpdateBuffer(char buff[], int n) {
        updateBuffer.append(buff, 0, n);
        AbbozzaLogger.debug("buffer: " + updateBuffer.toString() + "\n<end of buffer>");
    }

    /**
     * Adding Strings to the update buffer. The update buffer is checked for
     * complete incoming messages of the form [[<msg>]]
     *
     * @param buff
     * @param n
     */
    public synchronized void addToUpdateBuffer(String buf) {
        updateBuffer.append(buf.toCharArray(), 0, buf.length());
        AbbozzaLogger.debug("buffer: " + updateBuffer.toString() + "\n<end of buffer>");
    }

    /**
     * Purge the update buffer.
     *
     * @return
     */
    private synchronized String consumeUpdateBuffer() {
        String s = updateBuffer.toString();
        updateBuffer.setLength(0);
        return s;
    }

    /**
     * This operation checks the queu for waiting message
     *
     * @param e
     */
    @Override
    public void actionPerformed(ActionEvent e) {
        // Check waiting messages for timed out requests
        if (!_waitingMsg.isEmpty()) {
            Set<String> keys = _waitingMsg.keySet();
            Iterator<String> it = keys.iterator();
            while (it.hasNext()) {
                String key = it.next();
                Message msg = _waitingMsg.get(key);
                // Remove timed out requests
                if (msg.isTimedOut()) {
                    _waitingMsg.remove(key);
                    AbbozzaLogger.out("AbbozzaMonitor: Message " + key + " timed out");
                    msg.setResponse("timed out!");
                }
            }
        }

        // Check update buffer
        String s = consumeUpdateBuffer();

        if (!s.isEmpty()) {
            // Default handling
            appendText(s);
        }

        // Send to all monitor panels
        processMessage(s);
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
        textArea = new javax.swing.JTextArea();
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

        textArea.setEditable(false);
        textArea.setColumns(20);
        textArea.setRows(5);
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
        sendButton.getAccessibleContext().setAccessibleName("sendButton");
        sendButton.getAccessibleContext().setAccessibleDescription("");

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
        textArea.setText("");
    }//GEN-LAST:event_resetItemActionPerformed

    /**
     * Send text from the input line to the serial port
     *
     * @param evt
     */
    private void sendButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_sendButtonActionPerformed
        String msg = (String) this.sendText.getEditor().getItem();
        if (msg != null && !msg.isEmpty()) {
            _portHandler.sendMessage(msg);
            this.sendText.insertItemAt(msg, 0);  // new String(msg)
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
            this.close();  // Close an reopen the monitor
            this.open();
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
        _portHandler.setBaudRate(baudRate);
    }//GEN-LAST:event_rateBoxActionPerformed


    private void tabPanelStateChanged(javax.swing.event.ChangeEvent evt) {//GEN-FIRST:event_tabPanelStateChanged
        try {
            // Check if selected component is an instance of MonitorPanel
            MonitorPanel panel = (MonitorPanel) this.tabPanel.getSelectedComponent();
            // If it is an instance of MonitorPanel ...
            if (panel != _activePanel) {
                // ... and if it differs from the active one ...
                if (_activePanel != null) {
                    // ... disconnect the active one ...
                    _activePanel.disconnect();
                    closeByteStream();
                }
                // ... set active panel ...
                _activePanel = panel;
                if (_activePanel != null) {
                    _activePanel.connect(this);
                }
            }
        } catch (ClassCastException ex) {
            // If its not an instance of Monitor Panel, ...
            if (_activePanel != null) {
                // ... disconnect the active panel
                _activePanel.disconnect();
            }
            // ... disconnect the stream
            closeByteStream();
            // ... and do not set the active panel
            _activePanel = null;
        }
    }//GEN-LAST:event_tabPanelStateChanged


    private void incFontSizeActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_incFontSizeActionPerformed
        Font oldfont = textArea.getFont();
        int size = (oldfont.getSize() + 1) % 80;
        Font newfont = new Font(oldfont.getFontName(), Font.PLAIN, size);
        // Font newfont = new Font("Courier New",Font.PLAIN,size);
        // if ( !newfont.getFontName().equals("Courier New") ) {
        //    newfont = new Font("DejaVu Sans Mono",Font.PLAIN,size);
        // }
        textArea.setFont(newfont);
    }//GEN-LAST:event_incFontSizeActionPerformed

    private void decFontSizeActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_decFontSizeActionPerformed
        Font oldfont = textArea.getFont();
        int size = (oldfont.getSize() - 1) % 80;
        Font newfont = new Font(oldfont.getFontName(), Font.PLAIN, size);
        // if ( !newfont.getFontName().equals("Courier New") ) {
        //    newfont = new Font("DejaVu Sans Mono",Font.PLAIN,size);
        // }
        textArea.setFont(newfont);
    }//GEN-LAST:event_decFontSizeActionPerformed

    private void sendTextEditorActionPerformed(java.awt.event.ActionEvent evt) {
        String msg = evt.getActionCommand();
        if (msg != null && !msg.isEmpty()) {
            _portHandler.sendMessage(msg);
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
    private javax.swing.JTextArea textArea;
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
    public Message sendMessage(String msg, HttpExchange exchg, SerialHandler handler, long timeout) {
        Message mesg;
        if (this.boardPort == null) {
            return null;
        }
        if (timeout > 0) {
            String id = "_" + Long.toHexString(System.currentTimeMillis());
            return _portHandler.sendMessage(id, msg, exchg, handler, timeout);
        } else {
            mesg = _portHandler.sendMessage(msg);
            try {
                handler.sendResponse(exchg, 200, "text/plain", "ok");
            } catch (IOException ex) {
                AbbozzaLogger.stackTrace(ex);
            }
        }
        return mesg;
    }

    /**
     * Add message to message queue.
     *
     * @param msg The message to be added
     */
    public void addWaitingMsg(Message msg) {
        _waitingMsg.put(msg.getID(), msg);
    }

    /**
     * Append a text to the textfield showing the communication.
     *
     * @param msg The text to be appended
     */
    protected void appendText(String msg) {
        for (int i = 0; i < msg.length(); i++) {
            char c = msg.charAt(i);
            if (Character.isISOControl(c) && (c != '\n')) {
                msg = msg.replace(c, (char) (c + 0x2400));
            }
        }
        this.textArea.append(msg);
        int length = this.textArea.getText().length();
        if (length > 1024 * 512) {
            // cut of last first characters
            this.textArea.setText(this.textArea.getText().substring(length - 1024 * 512));
        }
    }

    public PipedOutputStream getByteStream() {
        return _byteStream;
    }

    /**
     * Open a new byte stream
     *
     * @return The newly opened byte stream
     */
    public PipedOutputStream openByteStream() {
        // Close old stream
        closeByteStream();

        // open new stream
        _byteStream = new PipedOutputStream();
        return _byteStream;
    }

    /**
     * Close the current byte stream
     */
    public void closeByteStream() {
        if (_byteStream != null) {
            try {
                _byteStream.close();
            } catch (IOException ex) {
                AbbozzaLogger.err("AbbozzaMonitor: Cannot close byte stream");
            }
            _byteStream = null;
        }
    }


    /**
     * Process a message received from the board. If it is enclose double
     * brackets [[ <prefix> <msg> ]]. Check the <prefix> and send it to the
     * appropriate Panel. If <prefix> is of the form _.* it is processed by the
     * Monitor itself, since it is an answer to a request.
     *
     * @param s The string received
     */
    private void processMessage(String s) {
        unprocessedMsg.append(s);

        String cmd;
        String prefix;

        int end = -1;
        int start;

        do {
            start = unprocessedMsg.indexOf("[[");
            if (start >= 0) {
                end = unprocessedMsg.indexOf("]]", start + 2);
                if (end >= 0) {
                    cmd = unprocessedMsg.substring(start + 2, end);
                    unprocessedMsg.delete(0, end + 2);
                    int space = cmd.indexOf(' ');
                    if (space >= 0) {
                        prefix = cmd.substring(0, space);

                        // Send message to registered panel
                        MonitorPanel panel = panels.get(prefix);
                        if (panel != null) {
                            cmd = cmd.substring(space + 1, cmd.length());
                            panel.processMessage(cmd);
                        } else {
                            respondTo(cmd);
                        }

                        // Send message to registered listener
                        MonitorListener listener = listeners.get(prefix);
                        if (listener != null) {
                            cmd = cmd.substring(space + 1, cmd.length());
                            listener.processMessage(cmd);
                        } else {
                            respondTo(cmd);
                        }

                    }
                }
            }
        } while ((start != -1) && (end != -1));

        // No [[ and ]] in buffer, remove everything
        unprocessedMsg.setLength(0);
    }


    /**
     * This method responds to a received message wih leading id.
     *
     * @param msg The message
     */
    private void respondTo(String msg) {
        int pos;
        Message _msg;
        msg = msg.trim();
        AbbozzaLogger.out("AbbozzaMonitor: respond to " + msg);
        if (msg.startsWith("_")) {
            pos = msg.indexOf(' ');
            String id = msg.substring(0, pos);
            AbbozzaLogger.out("AbbozzaMonitor: Checking for message id " + id);
            _msg = _waitingMsg.get(id);
            if (_msg != null) {
                msg = "[[" + _msg.getIdPostfix() + " " + msg.substring(pos).trim() + "]]";
                AbbozzaLogger.out("AbbozzaMonitor: Try to send " + msg);
                _waitingMsg.remove(id);
                // try {
                _msg.setResponse(msg);
                _msg.setState(Message.RESPONSE_READY);
                // _msg.getHandler().sendResponse(_msg.getHttpExchange(), 200, "text/plain", msg);
                // } catch (IOException ex) {
                //     AbbozzaLogger.out("Could not send response.");
                //     AbbozzaLogger.stackTrace(ex);
                // }
            }
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

    public void setRate(int rate) {
        for (int i = 0; i < rateBox.getItemCount(); i++) {
            String baud = rateBox.getItemAt(i);
            int ra = Integer.parseInt(baud);
            if (ra == rate) {
                rateBox.setSelectedIndex(i);
            }
        }

    }

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

    
    /******
     * TO BE CHECKED 
     ****/
    
    


    /**
     * ************
     * DEPRECATED
 *************
     */
    /*
    public void openPort() {
             AbbozzaLogger.err("AbbozzaMonitor: Open " + boardPort);
            try {
                serialPort = new SerialPort(boardPort);
                boolean retry = true;
                int MAX_RETRIES = 50;
                int retries = MAX_RETRIES;
                while ( (retry) && ( retries > 0) ) {
                    try {
                        serialPort.openPort();
                        serialPort.addEventListener(this, SerialPort.MASK_RXCHAR);
                        baudRate = getRate();
                        serialPort.setParams(baudRate,
                                SerialPort.DATABITS_8,
                                SerialPort.STOPBITS_1,
                                SerialPort.PARITY_NONE);
                        retry = false;
                    } catch (SerialPortException ex) {
                        if ( ex.getExceptionType() == SerialPortException.TYPE_PORT_BUSY ) {
                            retry = true;
                            retries --;
                            if ( retries == 0 ) {
                                int result = JOptionPane.showConfirmDialog(this,
                                        AbbozzaLocale.entry("gui.serial_busy"),
                                        AbbozzaLocale.entry("gui.serial_busy_title "),
                                        JOptionPane.YES_NO_OPTION,
                                        JOptionPane.QUESTION_MESSAGE);
                                if ( result == JOptionPane.YES_OPTION ) {
                                    retries = MAX_RETRIES;
                                }
                            }
                        } else {
                            retry = false;
                        }
                        AbbozzaLogger.err("AbbozzaMonitor: Opening of port failed");
                        AbbozzaLogger.err(ex.getLocalizedMessage());
                    }
                }
                if ( retries == 0 ) {
                    AbbozzaLogger.err("AbbozzaMonitor: Giving up on trying to open serial port after " + MAX_RETRIES + " tries");
                }
            } catch (Exception ex) {
                ex.printStackTrace(System.err);
                AbbozzaLogger.out(ex.getLocalizedMessage(), AbbozzaLogger.INFO);
            }
    }
     */
    /**
     * This handler is called if bytes are received on the serial port.
     *
     * @param event The received event
     * @Override public void serialEvent(SerialPortEvent event) {
     * AbbozzaLogger.debug("AbbozzaMonitor: serialEvent received"); if
     * (event.isRXCHAR() && event.getEventValue() > 0) { try { if ( _byteStream
     * != null ) { // If a byte stream is registered, send bytes there ... try {
     * byte receivedBytes[] = serialPort.readBytes(event.getEventValue());
     * _byteStream.write(receivedBytes,0,receivedBytes.length); } catch
     * (IOException ex) {} } else { // ... otherwise send bytes to protocol
     * String receivedData = serialPort.readString(event.getEventValue());
     * this.addToUpdateBuffer(receivedData); } } catch (SerialPortException ex)
     * { AbbozzaLogger.err("AbbozzaMonitor: Error in receiving string from
     * serial port: " + ex); } } else if (event.isBREAK()) {
     * AbbozzaLogger.err("AbbozzaMonitor: serial connection broken"); } }
     */
}

