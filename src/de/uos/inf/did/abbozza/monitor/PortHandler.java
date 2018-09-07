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
 * @fileoverview This class implements a thread which retreives entries from its
 * SerialManager's message queue and sens it via the given serial port.
 * 
 * @author michael.brinkmeier@uni-osnabrueck.de (Michael Brinkmeier)
 */
package de.uos.inf.did.abbozza.monitor;

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.handler.SerialHandler;
import java.io.IOException;
import java.io.PipedOutputStream;
import java.util.ArrayDeque;
import java.util.Queue;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.swing.JOptionPane;
import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;

/**
 * Ths class provides a thread for the handling of the serial communication.
 * It manages the serial port and the sending and receiving of data.
 * 
 * It monitors the message queu for messages to be send via the current port
 * and handles incoming data by relaying it to the monitor.
 * 
 * @author michael
 */
public class PortHandler extends Thread implements SerialPortEventListener {
   
    private boolean _stopped;
    private AbbozzaMonitor _monitor;    // The AbbozzaMonitor
    private SerialPort _serialPort;
    private String _port;
    private int _rate;
    private Thread _thread;
    protected Queue<Message> _msgQueue; // A queu for messages which have to be send to the serial port

    
    
    /**
     * Initialize the PortHandler
     * 
     * @param monitor 
     */
    public PortHandler(AbbozzaMonitor monitor) {
        this._monitor = monitor;
        _msgQueue = new ArrayDeque<Message>(100);        
    }
    
    
    
    /**
     * The thread watches the message queue and sends messages to the current
     * serial port.
     */
    public void run() {
        
        _stopped = false;
        while ( !_stopped ) {
            if ( _msgQueue.peek() != null ) {
                Message msg = _msgQueue.poll();
                sendMsg(msg);
            } else {
                // Sleep for 100 milliseconds if no message is enqueued
                try {
                    this.sleep(100);
                } catch (InterruptedException ex) {
                    _stopped = true;
                }
            }            
        }
    }

    
    /**
     * Stop the port handler thread
     */
    protected void stopIt() {
        _stopped = true;
    }
    
    
    /**
     * This operation handles incoming data
     * 
     * @param spe 
     */
    @Override
    public void serialEvent(SerialPortEvent event) {
        AbbozzaLogger.debug("AbbozzaMonitor: serialEvent received");
        if (event.isRXCHAR() && event.getEventValue() > 0) {
            try {
                PipedOutputStream byteStream = _monitor.getByteStream();
                if ( byteStream != null ) {
                    // If a byte stream is registered, send bytes there ...
                    try {
                        byte receivedBytes[] = _serialPort.readBytes(event.getEventValue());
                        byteStream.write(receivedBytes,0,receivedBytes.length);
                    } catch (IOException ex) {}
                } else {
                    // ... otherwise send bytes to protocol
                    String receivedData = _serialPort.readString(event.getEventValue());                    
                    _monitor.addToUpdateBuffer(receivedData);
                }
            } catch (SerialPortException ex) {
                AbbozzaLogger.err("AbbozzaMonitor: Error in receiving string from serial port: " + ex);
            }
        } else if (event.isBREAK()) {
                AbbozzaLogger.err("AbbozzaMonitor: serial connection broken");
        }
    }


    
    /**
     * Open the current serial port
     */
    public boolean openPort(boolean startThread) {
        if ( (_serialPort != null) && (_serialPort.isOpened()) ) { 
            return true; 
        }
        
        // Open the port
        _port = _monitor.getPort();
        _rate = _monitor.getRate();
        
        AbbozzaLogger.err("PortHandler: Opening " + _port + " at " + _rate + " baud");
        try {
            _serialPort = new SerialPort(_port);
            boolean retry = true;
            int MAX_RETRIES = 50;
            int retries = MAX_RETRIES;
            while ((retry) && (retries > 0)) {
                try {
                    _serialPort.openPort();
                    _serialPort.addEventListener(this, SerialPort.MASK_RXCHAR);
                    _serialPort.setParams(_rate,
                            SerialPort.DATABITS_8,
                            SerialPort.STOPBITS_1,
                            SerialPort.PARITY_NONE);
                    retry = false;
                } catch (SerialPortException ex) {
                    if (ex.getExceptionType() == null ? SerialPortException.TYPE_PORT_BUSY == null : ex.getExceptionType().equals(SerialPortException.TYPE_PORT_BUSY)) {
                        retry = true;
                        retries--;
                        if (retries == 0) {
                            int result = JOptionPane.showConfirmDialog(null,
                                    AbbozzaLocale.entry("gui.serial_busy"),
                                    AbbozzaLocale.entry("gui.serial_busy_title "),
                                    JOptionPane.YES_NO_OPTION,
                                    JOptionPane.QUESTION_MESSAGE);
                            if (result == JOptionPane.YES_OPTION) {
                                retries = MAX_RETRIES;
                            }
                        }
                    } else {
                        retry = false;
                    }
                    AbbozzaLogger.err("PortHandler: Opening of port " + _port + " failed");
                    AbbozzaLogger.err(ex.getLocalizedMessage());
                }
            }
            if (retries == 0) {
                AbbozzaLogger.err("PortHandler: Giving up on trying to open serial port " + _port + " after " + MAX_RETRIES + " tries");
                return false;
            }
        } catch (Exception ex) {
            ex.printStackTrace(System.err);
            AbbozzaLogger.out(ex.getLocalizedMessage(), AbbozzaLogger.INFO);
            return false;
        }
        
        if ( startThread) {
            // Start the thread
            _thread = new Thread(this);
            _thread.start();
        }        
        return true;
    }
    
    
    /**
     * Close the port
     */
    public void closePort() {
        try {
            // Close the serial port
            _serialPort.closePort();
            
            // Stop the thread
            _stopped = true;
        } catch (SerialPortException ex) {
            AbbozzaLogger.err("PortHandler: Could not close port");
        }
    }
    
    
    /**
     * Temporarily close the port, but keep the thread running
     */
    public void suspendPort() {
        AbbozzaLogger.err("PortHandler: suspend port");
        try {
            _serialPort.closePort();
        } catch (SerialPortException ex) {
            AbbozzaLogger.err("PortHandler: Could not close port");
        }
    }
    
    /**
     * Reopens the port
     */
    public void resumePort() {
        if ( _serialPort.isOpened() ) { 
            return; 
        }

        AbbozzaLogger.err("PortHandler: resume port");
        // Open the port, but do not start the thread again.
        openPort(false);
    }
    
    /**
     * Check if serial connection is closed.
     * 
     * @return 
     */
    public boolean isPortClosed() {
        return !_serialPort.isOpened();
    }

    
    
    
    
    /**
     * 
     */
    public void portChanged() {
        this._port = this._monitor.getPort();        
    }
    
    
    private void sendMsg(Message msg) {
        
        // Check if web message
        if ( msg.getHandler() == null ) {
            // If not, simply write it
            AbbozzaLogger.out("PortHandler: Sending " + msg.toString() + " to board",AbbozzaLogger.DEBUG);            
            this.writeMessage(msg.toString());  
        } else {
            // Otherwise        
            if (_monitor.getPort() == null ) {
                SerialHandler handler = msg.getHandler();
                if (handler != null) {
                    try {
                        handler.sendResponse(msg.getHttpExchange(), 400, "text/plain", "No board connected!");
                    } catch (IOException ex) {
                        Logger.getLogger(PortHandler.class.getName()).log(Level.SEVERE, null, ex);
                    }
                }
            } else {        
                AbbozzaLogger.out("PortHandler: Sending " + msg.toString() + " to board",AbbozzaLogger.DEBUG);            
                if (msg.getTimeout() == 0) {
                    this.writeMessage(msg.toString());  
                } else {
                    this.writeMessage(msg.toString());  
                    msg.startTimeOut();
                    _monitor.addWaitingMsg(msg);
                }
            }
        }
    }
 

    
    /**
     * Write a message to the serial port
     *
     * @param msg The message
     */
    private void writeMessage(String msg) {
        try {
            _serialPort.writeString(msg + "\n");
            _monitor.appendText("-> " + msg + "\n");
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
    public synchronized Message sendMessage(String msg) {
        Message mesg = new Message("", msg, null, null, 0);
        _msgQueue.add(mesg);
        return mesg;
    }

   /**
     * Enque a message for sending without timeout and without waiting for it.
     *
     * @param msg The message
     * 
     * @return The enqued message object
     */
    public synchronized Message sendMessage(String id, String msg, HttpExchange exchg, SerialHandler handler, long timeout) {
        Message mesg = new Message(id, msg, exchg, handler, timeout);
        _msgQueue.add(mesg);
        return mesg;
    }

    /**
     * Set the baud rate of the current port.
     * 
     * @param baudRate 
     */
    public void setBaudRate(int baudRate) {
        try {
            _serialPort.setParams(baudRate,
                                SerialPort.DATABITS_8,
                                SerialPort.STOPBITS_1,
                                SerialPort.PARITY_NONE);
        } catch (Exception ex) {
            AbbozzaLogger.err("PortHandler: Could not set " + _port + " to " + baudRate + " baud");
        }
        
    }
}
