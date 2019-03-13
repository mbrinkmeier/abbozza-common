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

import com.fazecast.jSerialComm.SerialPort;
import com.fazecast.jSerialComm.SerialPortIOException;
import de.uos.inf.did.abbozza.core.AbbozzaLocale;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import java.util.concurrent.ConcurrentLinkedQueue;
import javax.swing.JOptionPane;

/**
 *
 * @author mbrinkmeier
 */
public class ClacksSerialPort implements Runnable {

    private final int TIMEOUT = 10;

    // The serialPort
    private SerialPort serialPort;
    private boolean stopped;
    // private String port;
    private int rate;

    // The queue for the bytes received from the serial port
    protected ConcurrentLinkedQueue<ClacksPacket> incoming;

    // The queue for messages to be send via the serial port
    protected ConcurrentLinkedQueue<ClacksPacket> outgoing;

    public ClacksSerialPort(ConcurrentLinkedQueue<ClacksPacket> in,
            ConcurrentLinkedQueue<ClacksPacket> out) {
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
    public boolean open(SerialPort p, int r) {
        serialPort = p;
        String port = serialPort.getSystemPortName();
        rate = r;

        AbbozzaLogger.debug("ClacksSerialPort: Opening " + serialPort.getSystemPortName() + " at " + rate + " baud");

        try {
            // serialPort = SerialPort.getCommPort(port);
            boolean retry = true;
            int MAX_RETRIES = 50;
            int retries = MAX_RETRIES;
            while ((retry) && (retries > 0) && !serialPort.openPort()) {
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
                } else {
                    retry = false;
                }
                ClacksStatus status = new ClacksStatus("Could not open port " + port, "error");
                incoming.add(status);
                AbbozzaLogger.err("ClacksSerialPort: Opening of port " + port + " failed");
            }

            if (retries > 0) {
                // serialPort.addEventListener(this, SerialPort.MASK_RXCHAR);    
                serialPort.setNumDataBits(8);
                serialPort.setNumStopBits(1);
                serialPort.setParity(SerialPort.NO_PARITY);
                serialPort.setBaudRate(rate);
                retry = false;
            } else {
                AbbozzaLogger.err("ClacksSerialPort: Giving up on trying to open serial port " + port + " after " + MAX_RETRIES + " tries");
                return false;
            }
        } catch (Exception ex) {
            AbbozzaLogger.stackTrace(ex);
            return false;
        }
        ClacksStatus status = new ClacksStatus("Opened port " + port, "info");
        incoming.add(status);
        return true;
    }

    /**
     * Close the port
     */
    public void close() {
        // Close the serial port
        if ((serialPort != null) && serialPort.isOpen()) {
            if (!serialPort.closePort()) {
                ClacksStatus status = new ClacksStatus("Could not close port", "error");
                incoming.add(status);
                AbbozzaLogger.err("ClacksSerialPort: Could not close port");
            }
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
        return serialPort.isOpen();
    }

    /**
     * Set the rate of the port
     *
     * @param r The new baud rate
     */
    public void setRate(int r) {
        rate = r;
        if ((serialPort != null) && (serialPort.isOpen())) {
            serialPort.setNumDataBits(8);
            serialPort.setNumStopBits(1);
            serialPort.setParity(SerialPort.NO_PARITY);
            serialPort.setBaudRate(rate);
        }
    }

    @Override
    public void run() {
        byte[] buffer;
        
        stopped = false;
        long timeoutStart = System.currentTimeMillis();

        while (!stopped) {

            // First, check for incoming bytes, put them into a byte packet
            // and send them to the clacks service.
            try {
                long currentTime = System.currentTimeMillis();
                int available = serialPort.bytesAvailable();
                if ((available >= 32) || (currentTime - timeoutStart > TIMEOUT)) {
                    Thread.sleep(0, 100);
                    if (serialPort.bytesAvailable() > 0) {
                        int len = serialPort.bytesAvailable();
                        if ( len > 1024 ) len = 1024;
                        buffer = new byte[len];
                        serialPort.readBytes(buffer, len);
                        ClacksBytes bytes = new ClacksBytes(currentTime, buffer);
                        timeoutStart = currentTime;
                        incoming.add(bytes);
                    }
                } else if (available >= 0) {
                    Thread.sleep(0, 100);
                } else {
                    ClacksStatus status = new ClacksStatus("Serial port isn'T open", "error");
                    incoming.add(status);
                }
            }catch (InterruptedException ex) {
            }

                // Send bytes
                while (!outgoing.isEmpty()) {
                    // If there is a message in the outgoing queue, send it
                    ClacksPacket packet = outgoing.poll();
                    packet.process(this);
                }
            }
        }
    
    
    
    public SerialPort getSerialPort() {
        AbbozzaLogger.out("ClacksSerialPort: Checking serial ports", AbbozzaLogger.INFO);

        SerialPort[] ports = SerialPort.getCommPorts();

        AbbozzaLogger.out("ClacksSerialPort: Fetched serial ports", AbbozzaLogger.INFO);

        if (ports.length == 0) {
            AbbozzaLogger.info("ClacksSerialPort: No serial ports found");
            return null;
        } else if (ports.length == 1) {
            AbbozzaLogger.info("ClacksSerialPort: Unique port found: " + ports[0].getDescriptivePortName() + " ( " + ports[0].getSystemPortName() + " )");
            return ports[0];
        } else {
            AbbozzaLogger.info("ClacksSerialPort: Several ports found:");
            for (int i = 0; i < ports.length; i++) {
                AbbozzaLogger.info("\t" + ports[i].getSystemPortName());
            }
        }

        return ports[0];
    }

    
    public int getBaudRate() {
        return 115200;
    }

    /**
     * Write the bytes to the serial port.
     *
     * @param buffer The bytes to bewritten
     * @return Ture if the write was succesfull
     * @throws SerialPortException Thi exception is thrown if an error occured.
     */
    public int writeBytes(byte[] buffer) {
        return serialPort.writeBytes(buffer,buffer.length);
    }
    
}
