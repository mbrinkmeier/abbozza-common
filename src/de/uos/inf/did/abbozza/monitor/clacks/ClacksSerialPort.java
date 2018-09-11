/*
 * Copyright 2018 mbrinkmeier.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package de.uos.inf.did.abbozza.monitor.clacks;

import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import java.util.concurrent.ConcurrentLinkedQueue;
import javax.swing.JOptionPane;
import jssc.SerialPort;
import jssc.SerialPortEvent;
import jssc.SerialPortEventListener;
import jssc.SerialPortException;

/**
 *
 * @author mbrinkmeier
 */
public class ClacksSerialPort implements Runnable, SerialPortEventListener {

    // The serialPort
    private SerialPort serialPort;
    private boolean stopped;
    private String port;
    private int rate;
    
    // The queue for the bytes received froim the serial port
    protected ConcurrentLinkedQueue<ClacksBytes> incoming;
    
    // The queue for messages to be send via the serial port
    protected ConcurrentLinkedQueue<ClacksBytes> outgoing;
    
    
    public ClacksSerialPort(ConcurrentLinkedQueue<ClacksBytes> in, 
                            ConcurrentLinkedQueue<ClacksBytes> out) {
        incoming = in;
        outgoing = out;
    }
    
    
    public void stopIt() {
        stopped = true;
    }
    
    /**
     * Open the given port.
     * 
     * @param p The name of the port
     * @param r The baud rate
     * 
     * @return true if successful
     */
    public boolean open(String p, int r) {        
        port = p;
        rate  = r;
        
        AbbozzaLogger.debug("ClacksSerialPort: Opening " + port + " at " + rate + " baud");
        
        try {
            serialPort = new SerialPort(port);
            boolean retry = true;
            int MAX_RETRIES = 50;
            int retries = MAX_RETRIES;
            while ((retry) && (retries > 0)) {
                try {
                    serialPort.openPort();
                    serialPort.addEventListener(this, SerialPort.MASK_RXCHAR);
                    serialPort.setParams(rate,
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
                    AbbozzaLogger.err("ClacksSerialPort: Opening of port " + port + " failed");
                    AbbozzaLogger.err(ex.getLocalizedMessage());
                }
            }
            if (retries == 0) {
                AbbozzaLogger.err("ClacksSerialPort: Giving up on trying to open serial port " + port + " after " + MAX_RETRIES + " tries");
                return false;
            }
        } catch (Exception ex) {
            ex.printStackTrace(System.err);
            AbbozzaLogger.out(ex.getLocalizedMessage(), AbbozzaLogger.INFO);
            return false;
        }
        return true;        
    }
    
    /**
     * Close the port
     */
    public void close() {
        try {
            // Close the serial port
            serialPort.closePort();            
        } catch (SerialPortException ex) {
            ex.printStackTrace(System.out);
            AbbozzaLogger.err("ClacksSerialPort: Could not close port");
        }
    }
    
    
        /**
     * Temporarily close the port, but keep the thread running
     */
    public void suspend() {
        /*
        AbbozzaLogger.err("ClacksSerialPort: suspend port");
        try {
            serialPort.closePort();
        } catch (SerialPortException ex) {
            AbbozzaLogger.err("ClacksSerialPort: Could not close port");
        }
        */
    }
    
    /**
     * Reopens the port
     */
    public void resume() {
        /*
        if ( serialPort.isOpened() ) { 
            return; 
        }
        */
        
        AbbozzaLogger.debug("ClacksSerialPort: resume port");
        /*
        // Open the port, but do not start the thread again.
        open(port,rate);
        */
    }


    public boolean isOpen() {
        if ( serialPort == null ) return false;
        return serialPort.isOpened();
    }
    
    
    /**
     * Set the rate of the port
     * 
     * @param r 
     */
    public void setRate(int r) {
        rate = r;
        if ( serialPort.isOpened() ) {
            try {
                serialPort.setParams(rate,
                        SerialPort.DATABITS_8,
                        SerialPort.STOPBITS_1,        
                        SerialPort.PARITY_NONE);
            } catch (SerialPortException ex) {
                AbbozzaLogger.err("ClacksSerialPort: Could not change rate");
            }
        }
    }
    
    
    @Override
    public void run() {
        stopped = false;
        
        while ( !stopped ) {
            if ( !outgoing.isEmpty() ) {
                // If there is a message in the outgoing queue, send it
                ClacksBytes bytes = outgoing.poll();
                try {
                    AbbozzaLogger.err("ClacksSerialPort: Sending bytes " + new String(bytes.getBytes()) + " to port");
                    serialPort.writeBytes(bytes.getBytes());
                } catch (SerialPortException ex) {
                    AbbozzaLogger.err("ClacksSerialPort: Could not send bytes to port");
                }
            }            
        }
    }

    
    
    @Override
    public void serialEvent(SerialPortEvent event) {
        if (event.isRXCHAR() && event.getEventValue() > 0) {
            try {
                byte receivedBytes[] = serialPort.readBytes(event.getEventValue());
                ClacksBytes bytes = new ClacksBytes(System.currentTimeMillis(),receivedBytes);
                incoming.add(bytes);
            } catch (SerialPortException ex) {
                AbbozzaLogger.err("ClacksSerialPort: Error whiles receiving data from serial port: " + ex);
            }
        } else if (event.isBREAK()) {
                AbbozzaLogger.err("ClacksSerialPort: serial connection broken");
        }
    }

}
