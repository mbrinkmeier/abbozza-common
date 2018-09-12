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
import jssc.SerialPortException;
import jssc.SerialPortList;
import jssc.SerialPortTimeoutException;

/**
 *
 * @author mbrinkmeier
 */
public class ClacksSerialPort implements Runnable {

    private final int TIMEOUT = 10;

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
        rate = r;

        AbbozzaLogger.debug("ClacksSerialPort: Opening " + port + " at " + rate + " baud");

        try {
            serialPort = new SerialPort(port);
            boolean retry = true;
            int MAX_RETRIES = 50;
            int retries = MAX_RETRIES;
            while ((retry) && (retries > 0)) {
                try {
                    serialPort.openPort();
                    // serialPort.addEventListener(this, SerialPort.MASK_RXCHAR);                   
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
            AbbozzaLogger.stackTrace(ex);
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
            if ( (serialPort != null) && serialPort.isOpened() ) {
                serialPort.closePort();
            }
        } catch (SerialPortException ex) {
            AbbozzaLogger.stackTrace(ex);
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
        if (serialPort == null) {
            return false;
        }
        return serialPort.isOpened();
    }

    /**
     * Set the rate of the port
     *
     * @param r
     */
    public void setRate(int r) {
        rate = r;
        if ((serialPort != null) && (serialPort.isOpened())) {
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
        long timeoutStart = System.currentTimeMillis();

        while (!stopped) {

            // Send bytes
            while (!outgoing.isEmpty()) {
                // If there is a message in the outgoing queue, send it
                ClacksBytes bytes = outgoing.poll();
                try {
                    serialPort.writeBytes(bytes.getBytes());
                } catch (SerialPortException ex) {
                    AbbozzaLogger.stackTrace(ex);
                    AbbozzaLogger.err("ClacksSerialPort: Could not send bytes to port");
                }
            }

            // Check for incoming bytes
            try {
                long currentTime = System.currentTimeMillis();
                int available = serialPort.getInputBufferBytesCount();
                if ((available >= 32) || (currentTime - timeoutStart > TIMEOUT)) {
                    Thread.sleep(0, 100);
                    if (serialPort.getInputBufferBytesCount() > 0) {
                        ClacksBytes bytes = new ClacksBytes(currentTime, serialPort.readBytes(serialPort.getInputBufferBytesCount(),10));
                        timeoutStart = currentTime;
                        incoming.add(bytes);
                    }
                } else {
                    Thread.sleep(0, 100);
                }
            } catch (SerialPortException ex) {
                AbbozzaLogger.stackTrace(ex);
                AbbozzaLogger.err("ClacksSerialPort: Error reading from port");
            } catch (SerialPortTimeoutException ex) {
                AbbozzaLogger.stackTrace(ex);
                AbbozzaLogger.err("ClacksSerialPort: Error reading from port");
            } catch (InterruptedException ex) {
            }
        }
    }
    
    
    public String getSerialPort() {
        AbbozzaLogger.out("ClacksService: Checking serial ports", AbbozzaLogger.INFO);

        String[] portNames = SerialPortList.getPortNames();

        AbbozzaLogger.out("ClacksService: Fetched serial ports", AbbozzaLogger.INFO);

        if (portNames.length == 0) {
            AbbozzaLogger.info("ClacksService: No serial ports found");
            return null;
        } else if (portNames.length == 1) {
            AbbozzaLogger.info("ClacksService: Unique port found: " + portNames[0]);
            return portNames[0];
        } else {
            AbbozzaLogger.info("ClacksService: Several ports found:");
            for (int i = 0; i < portNames.length; i++) {
                AbbozzaLogger.info("\t" + portNames[i]);
            }
        }
        return portNames[0];
    }

    
    public int getBaudRate() {
        return SerialPort.BAUDRATE_115200;
    }



    
}
