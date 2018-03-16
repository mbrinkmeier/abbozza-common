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
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Queue;
import java.util.Set;
import javax.swing.DefaultComboBoxModel;
import javax.swing.ImageIcon;
import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.Timer;
import javax.swing.text.DefaultCaret;
import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;
import jssc.SerialPortList;

/**
 *
 * @author mbrinkmeier
 */
public final class AbbozzaMonitor extends JFrame implements ActionListener, SerialPortEventListener {

    private String boardPort;
    private int baudRate = SerialPort.BAUDRATE_115200;
    private boolean monitorEnabled;
    private boolean closed;
    private StringBuffer updateBuffer = null;
    private Timer updateTimer = null;
    // private Serial serial;
    private SerialPort serialPort;
    private StringBuffer unprocessedMsg;
    private HashMap<String, MonitorPanel> panels;
    private HashMap<String, MonitorListener> listeners;
    protected Queue<Message> _msgQueue;
    protected HashMap<String, Message> _waitingMsg;
    private Sender _sender;

    // private AbbozzaMonitorPanel monitor = null;
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

    
    private void init() {
        // _msgQueue = new ArrayBlockingQueue<Message>(100);
        _msgQueue = new ArrayDeque<Message>(100);
        _waitingMsg = new HashMap<String, Message>();

        if (_sender == null) {
            _sender = new Sender(this);
        }
        
        if ( !_sender.isAlive() ) {
            _sender.start();
        }

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
                    _sender.stopIt();
                    closed = true;
                    close();
                    AbbozzaServer.getInstance().monitorIsClosed();
                } catch (Exception e) {
                    // ignore
                }
            }
        });

        updateBuffer = new StringBuffer(1048576);
        updateTimer = new Timer(33, this);  // redraw serial monitor at 30 Hz
        updateTimer.start();
        unprocessedMsg = new StringBuffer();
      
        panels = new HashMap<String, MonitorPanel>();
        TableMonitor tableMonitor = new TableMonitor();
        this.addMonitorPanel(tableMonitor, "table");
        this.addMonitorPanel(new GraphMonitor(tableMonitor.getTableModel()), "graph");
        this.addMonitorPanel(new LevelMonitor(tableMonitor.getTableModel()), "level");

        listeners = new HashMap<>();

        // Look for plugin panels and listeners
        AbbozzaLogger.info("AbbozzaMonitor: Checking plugins ...");
        Plugin plugin;
        Enumeration<Plugin> plugins = AbbozzaServer.getPluginManager().plugins();
        while ( plugins.hasMoreElements() ) {
          plugin = plugins.nextElement();
          AbbozzaLogger.info("AbbozzaMonitor: Checking plugin " + plugin.getId());
          this.addMonitorPanel( plugin.getMonitorPanel(), plugin.getMonitorPanelPrefix() );
          this.addMonitorListener( plugin.getMonitorListener(), plugin.getMonitorListenerPrefix() );
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
        tabPanel = new javax.swing.JTabbedPane();
        jPanel1 = new javax.swing.JPanel();
        textPane = new javax.swing.JScrollPane();
        textArea = new javax.swing.JTextArea();
        sendButton = new javax.swing.JButton();
        sendText = new javax.swing.JComboBox();
        logoPanel = new javax.swing.JPanel();
        jLabel1 = new javax.swing.JLabel();
        jPanel2 = new javax.swing.JPanel();
        portBox = new javax.swing.JComboBox<String>();
        rateBox = new javax.swing.JComboBox<String>();

        protocolPopUp.setToolTipText("");

        resetItem.setText("Löschen");
        resetItem.setToolTipText("Löscht das Protokoll");
        resetItem.addActionListener(new java.awt.event.ActionListener() {
            public void actionPerformed(java.awt.event.ActionEvent evt) {
                resetItemActionPerformed(evt);
            }
        });
        protocolPopUp.add(resetItem);

        setDefaultCloseOperation(javax.swing.WindowConstants.DISPOSE_ON_CLOSE);
        setTitle("abbozza! Monitor");
        setMinimumSize(new java.awt.Dimension(640, 480));

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

        rateBox.setModel(new javax.swing.DefaultComboBoxModel(new String[] { "300", "1200", "2400", "4800", "9600", "14400", "19200", "28800", "38400", "57600", "115200", "230400" }));
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

    private void resetItemActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_resetItemActionPerformed
        textArea.setText("");
    }//GEN-LAST:event_resetItemActionPerformed

    private void sendButtonActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_sendButtonActionPerformed
        String msg = (String) this.sendText.getEditor().getItem();
        if (msg != null && !msg.isEmpty()) {            
            this.sendMessage(msg);
            this.sendText.insertItemAt(msg,0);  // new String(msg)
            this.sendText.setSelectedItem(null);
        }
    }//GEN-LAST:event_sendButtonActionPerformed

    private void portBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_portBoxActionPerformed
        String port = (String) portBox.getSelectedItem();
        try {
            if ( port == null ) return;
            if ( (boardPort != null) && (port.equals(boardPort)) ) return;
            boardPort = port;
            AbbozzaLogger.out("AbbozzaMonitor.portBoxActionPerformed: Switching to " + boardPort);
            this.close();
            this.open();
        } catch (Exception ex) {
            AbbozzaLogger.err("AbbozzaMonitor.portBoxActionPerformed: Could not open " + port);
        }
    }//GEN-LAST:event_portBoxActionPerformed

    private void rateBoxActionPerformed(java.awt.event.ActionEvent evt) {//GEN-FIRST:event_rateBoxActionPerformed
       String rateString = (String) rateBox.getSelectedItem();
       if ( rateString == null) return;
       baudRate = Integer.parseInt( rateString );
       AbbozzaLogger.out("AbbozzaMonitor.portBoxActionPerformed: Setting rate to " + rateString);
        try {
           this.close();
           this.open();
        } catch (Exception ex) {
            AbbozzaLogger.err("AbbozzaMonitor.rateBoxActionPerformed: Could not set " + boardPort + " to " + baudRate + " baud");
        }
    }//GEN-LAST:event_rateBoxActionPerformed

    private void sendTextEditorActionPerformed(java.awt.event.ActionEvent evt) {
        String msg = evt.getActionCommand();
        if (msg != null && !msg.isEmpty()) {
            this.sendMessage(msg);
            this.sendText.insertItemAt(msg,0);    // new String(msg)
            this.sendText.setSelectedItem(null);
        }
    }

    public synchronized void addToUpdateBuffer(char buff[], int n) {
        updateBuffer.append(buff, 0, n);
        AbbozzaLogger.out("buffer: " + updateBuffer.toString() + "\n<end of buffer>");
    }

    public synchronized void addToUpdateBuffer(String buf) {
        updateBuffer.append(buf.toCharArray(), 0, buf.length());
        AbbozzaLogger.out("buffer: " + updateBuffer.toString() + "\n<end of buffer>");
    }

    private synchronized String consumeUpdateBuffer() {
        String s = updateBuffer.toString();
        updateBuffer.setLength(0);
        return s;
    }

    // Variables declaration - do not modify//GEN-BEGIN:variables
    private javax.swing.JLabel jLabel1;
    private javax.swing.JPanel jPanel1;
    private javax.swing.JPanel jPanel2;
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
     * Write a message to the serial port
     *
     * @param msg The message
     */
    protected void writeMessage(String msg) {
        try {
            serialPort.writeString(msg + "\n");
            appendText("-> " + msg + "\n");
        } catch (SerialPortException ex) {
            AbbozzaLogger.err("AbbozzaMonitor: Error sending to serial port");
        }
    }

    /**
     * Enque a message for sending without timeout and without waiting for it.
     *
     * @param msg The message
     * 
     * @return The enqued message object
     */
    public Message sendMessage(String msg) {
        Message mesg = null;
        if (this.boardPort != null) {
            mesg = new Message("", msg, null, null, 0);
            _msgQueue.add(mesg);
        }
        return mesg;
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
            mesg = new Message(id, msg, exchg, handler, timeout);
            _msgQueue.add(mesg);
            return mesg;
        } else {
            mesg = sendMessage(msg);
            try {
                handler.sendResponse(exchg, 200, "text/plain", "ok");
            } catch (IOException ex) {
                AbbozzaLogger.stackTrace(ex);
            }
        }
        return mesg;
    }

    /**
     * Append a text to the textfield showing the communication.
     *
     * @param msg The text to be appended
     */
    protected void appendText(String msg) {
        this.textArea.append(msg);
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
            AbbozzaLogger.info("AbbozzaMonitor: Panel for prefix " + prefix + " added");
            tabPanel.add(panel, 0);
            panels.put(prefix, panel);
        }
    }

    /**
     * Add a Listener to the Monitor. Messages enclosed in double brackets of the
     * form [[ <prefix> <msg> ]] are send to the panel.
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

    /**
     * Returns the current port is a board is connected, null otherwise.
     *
     * @return The name of the port
     */
    public String getBoardPort() {
        return boardPort;
    }

    public void setBoardPort(String boardPort, int rate) {
        setBoardPort(boardPort);
        setRate(rate);
    }

    public void setBoardPort(String port) {
        this.boardPort = port;
        for (int i = 0; i < portBox.getItemCount(); i ++ ) {
            String p = portBox.getItemAt(i);
            if ( p.equals(port) ) {
                portBox.setSelectedIndex(i);
                return;
            }
        }
        
        portBox.addItem(boardPort);
        portBox.setSelectedItem(boardPort);
    }
    
    public void setRate(int rate) {
        for (int i = 0; i < rateBox.getItemCount(); i ++ ) {
            String baud = rateBox.getItemAt(i);
            int ra = Integer.parseInt(baud);
            if ( ra == rate ) {
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

    // Puts the window in suspend state, closing the serial port
    // to allow other entity (the programmer) to use it
    public void suspend() throws Exception {
        enableWindow(false);
        if (serialPort != null) {
            serialPort.closePort();
            serialPort = null;
        }
        // close();
    }

    public void resume() throws Exception {
        // Enable the window
        enableWindow(true);

        // If the window is visible, try to open the serial port
        if (serialPort != null) {
            if ( !serialPort.isOpened() ) {
                AbbozzaLogger.out("AbbozzaMonitor: Serial port " + serialPort.getPortName() + " not available!",AbbozzaLogger.INFO);
                serialPort = null;
            } else {
                return;
            }
        }

        if (boardPort != null) {
            /* serial = new Serial(boardPort, 9600) {
                @Override
                protected void message(char buff[], int n) {
                    addToUpdateBuffer(buff, n);
                }
            };*/
            AbbozzaLogger.out("AbbozzaMonitor: Opening serial port " + boardPort,AbbozzaLogger.INFO);
            serialPort = new SerialPort(boardPort);
            try {
                serialPort.openPort();
                serialPort.addEventListener(this, SerialPort.MASK_RXCHAR);
                serialPort.setParams(baudRate,
                        SerialPort.DATABITS_8,
                        SerialPort.STOPBITS_1,
                        SerialPort.PARITY_NONE);
                serialPort.purgePort(SerialPort.PURGE_RXCLEAR | SerialPort.PURGE_TXCLEAR);
            } catch (SerialPortException ex) {
                AbbozzaLogger.err(ex.getLocalizedMessage());

            }
        } else {
            String msg = AbbozzaLocale.entry("msg.no_board");
            addToUpdateBuffer(msg.toCharArray(), msg.length());
        }
    }

    public boolean isClosed() {
        return closed;
    }

    public void open() throws Exception {
        closed = false;
        if (serialPort != null) {
            return;
        }
        this.setVisible(true);

        if (boardPort != null) {
            AbbozzaLogger.out("AbbozzaMonitor: Open " + boardPort, AbbozzaLogger.INFO);
            try {
//                serial = new Serial(boardPort, 9600) {
//                    @Override
//                    protected void message(char buff[], int n) {
//                        addToUpdateBuffer(buff, n);
//                    }
//                };
                serialPort = new SerialPort(boardPort);
                try {
                    serialPort.openPort();
                    serialPort.addEventListener(this, SerialPort.MASK_RXCHAR);
                    serialPort.setParams(baudRate,
                            SerialPort.DATABITS_8,
                            SerialPort.STOPBITS_1,
                            SerialPort.PARITY_NONE);
                } catch (SerialPortException ex) {
                    AbbozzaLogger.err(ex.getLocalizedMessage());

                }
            } catch (Exception ex) {
                ex.printStackTrace(System.err);
                AbbozzaLogger.out(ex.getLocalizedMessage(), AbbozzaLogger.INFO);
            }
        } else {
            String msg = "No board connected!\n";
            addToUpdateBuffer(msg.toCharArray(), msg.length());
        }

        GUITool.centerWindow(this);
        /*Dimension screen = Toolkit.getDefaultToolkit().getScreenSize();
        int x = (screen.width - this.getWidth()) / 2;
        int y = (screen.height - this.getHeight()) / 2;
        this.setLocation(x, y); */
    }

    public void close() throws Exception {
        closed = true;
        this.setVisible(false);
        if (serialPort != null) {
            serialPort.closePort();
            serialPort = null;
        }
    }

    public void addWaitingMsg(Message msg) {
        _waitingMsg.put(msg.getID(), msg);
    }

    @Override
    public void serialEvent(SerialPortEvent event) {
        AbbozzaLogger.debug("AbbozzaMonitor: serialEvent");
        if (event.isRXCHAR() && event.getEventValue() > 0) {
            try {
                String receivedData = serialPort.readString(event.getEventValue());
                this.addToUpdateBuffer(receivedData);
            } catch (SerialPortException ex) {
                AbbozzaLogger.err("AbbozzaMonitor: Error in receiving string from serial port: " + ex);
            }
        }
    }

    void scanPorts() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

}
