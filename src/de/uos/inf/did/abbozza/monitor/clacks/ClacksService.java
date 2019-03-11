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

import com.sun.net.httpserver.HttpExchange;
import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.handler.SerialHandler;
import de.uos.inf.did.abbozza.monitor.AbbozzaMonitor;
import de.uos.inf.did.abbozza.monitor.Message;
import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import javax.swing.SwingWorker;

/**
 * This Worker provides a service for the Monitzor GUI to subscribe to the byte
 * stream provided by a serial connection.
 *
 * @author mbrinkmeier
 */
public class ClacksService extends SwingWorker<List<ClacksPacket>, ClacksPacket> {

    // The queue for the bytes received froim the serial port
    protected ConcurrentLinkedQueue<ClacksPacket> incoming;

    // The queue for messages to be send via the serial port
    protected ConcurrentLinkedQueue<ClacksPacket> outgoing;

    // The queue for messages received from the monitor or the http handler
    protected ConcurrentLinkedQueue<ClacksPacket> messages;

    // The queue for waiting messages 
    protected HashMap<String, ClacksRequest> waitingMessages;

    protected ClacksSerialPort serialPort;
    protected AbbozzaMonitor monitor;
    protected Thread serialThread;
    protected ClacksPacketParser parser;

    private String portName = null;
    private int portRate = 0;

    private LinkedList<ClacksSubscriber> subscribers;

    /**
     * The constructor
     *
     * @param mon The monitor to which the service belongs
     */
    public ClacksService(AbbozzaMonitor mon) {
        monitor = mon;

        // Initialize the various queues
        incoming = new ConcurrentLinkedQueue<>();
        outgoing = new ConcurrentLinkedQueue<>();
        messages = new ConcurrentLinkedQueue<>();
        waitingMessages = new HashMap<>();

        // Add the monitor to the list of subscribers
        subscribers = new LinkedList<>();

        // Initialize and open the serial Port
        serialPort = new ClacksSerialPort(incoming, outgoing);

        parser = new ClacksPacketParser();
    }

    /**
     * The work done in the background.
     *
     * @return Null
     */
    @Override
    protected List<ClacksPacket> doInBackground() throws InterruptedException {

        AbbozzaLogger.err("ClacksService starting");

        // Get port and rate if not known already
        if (portName == null) {
            portName = serialPort.getSerialPort();
        }

        // No port found
        if (portName == null) {
            publish(new ClacksStatus("No serial port found", "error"));
            AbbozzaLogger.err("ClacksService : No serial port found");
            return null;
        }

        if (portRate == 0) {
            portRate = serialPort.getBaudRate();
        }

        monitor.setBoardPort(portName, portRate);

        // Open the port
        serialPort.open(portName, portRate);

        // Start the thread
        serialThread = new Thread(serialPort);
        serialThread.start();

        // Here the real work is done
        while ((serialPort != null) && !isCancelled()) {

            // Always treat at most ten packages
            // The byte chunks are published to the gui
            int count = 0;
            if ((!incoming.isEmpty()) && (count < 10)) {
                ClacksPacket packet = incoming.poll();
                packet.processFromPort(this);
                count++;
            }

            // Check the message queue and send them to the serial port
            while (!messages.isEmpty()) {
                // handleMessage(messages.poll());
                messages.poll().processToPort(this);
            }

            // Check waiting messages for timeouts
            if (!waitingMessages.isEmpty()) {
                for (ClacksRequest msg : waitingMessages.values()) {
                    // Remove timed out requests
                    if (msg.isTimedOut()) {
                        waitingMessages.remove(msg.getID());
                        ClacksStatus status = new ClacksStatus("Message " + msg.getID() + " timed out", "error");
                        publish(status);
                        AbbozzaLogger.out("AbbozzaMonitor: Message " + msg.getID() + " timed out");
                        msg.setResponse("timed out!");
                    }
                }
            }

            // Now sleep a bit, so that other get the chance to do their work
            Thread.sleep(0, 100);

        }
        AbbozzaLogger.err("ClacksService stopped");

        return null;
    }

    /**
     * Suspend the serial connection
     */
    public void suspendPort() {
        if (serialPort != null) {
            serialPort.suspend();
        }
    }

    /**
     * Resume the serial connection
     */
    public void resumePort() {
        if (serialPort != null) {
            serialPort.resume();
        }
    }

    public void setPort(String port) {
        portName = port;
        if (serialPort != null && serialPort.isOpen()) {
            serialPort.close();
        }
        if (serialPort != null) {
            serialPort.open(portName, portRate);
        }

    }

    /**
     * Set the baud rate of the connection
     *
     * @param rate The new baud rate
     */
    public void setRate(int rate) {
        if (rate != portRate) {
            portRate = rate;
            if (serialPort != null) {
                serialPort.setRate(rate);
            }
        }
    }

    /**
     * Distribute clacks packets to subscribers
     *
     * @param chunks The list of packets to be processed
     */
    @Override
    protected void process(List<ClacksPacket> chunks) {
        for (ClacksPacket packet : chunks) {
            packet.process(monitor);
            for (ClacksSubscriber subscriber : subscribers) {
                packet.process(subscriber);
            }
        }
    }

    /**
     * Directly send bytes to the serial port.
     *
     * @param buffer The bytes to be send
     */
    public synchronized void sendBytes(byte[] buffer) {
        outgoing.add(new ClacksBytes(0, buffer));
        // this.monitor.appendText(new String(buffer), "output");
    }

    /**
     * Close serial port if thread ends
     */
    @Override
    protected void done() {
        // close the serial port
        serialPort.close();
        serialPort.stopIt();
        AbbozzaLogger.info("ClacksService: Stopped");
    }

    public void subscribe(ClacksSubscriber subscriber) {
        if (subscribers.contains(subscriber)) {
            return;
        }

        subscribers.add(subscriber);
    }

    public void unsubscribe(ClacksSubscriber subscriber) {
        subscribers.remove(subscriber);
    }

    public void publishPacket(ClacksPacket packet) {
        publish(packet);
    }

    public ClacksPacketParser getParser() {
        return parser;
    }

    public void sendPacket(ClacksPacket packet) {
        messages.add(packet);
    }

    public ClacksRequest processRequest(String msg, HttpExchange exchg, SerialHandler handler, long timeout) {
        ClacksRequest request = null;
        ClacksStatus status = new ClacksStatus("Received request from " + exchg.getRemoteAddress() + " : " + exchg.getRequestURI().toString(), "info");
        publish(status);

        if (!serialPort.isOpen()) {
            if (handler != null) {
                try {
                    handler.sendResponse(exchg, 400, "text/plain", "No board connected!");
                } catch (IOException ex) {
                    AbbozzaLogger.err("ClacksService: Could not write to serial port");
                }
                return null;
            }
        }
        if (timeout > 0) {
            String id = "_" + Long.toHexString(System.currentTimeMillis());
            request = new ClacksRequest(id, msg, exchg, handler, timeout);
            request.startTimeOut();
            waitingMessages.put(request.getID(), request);
            outgoing.add(request);
        } else {
            ClacksMessage cmsg = new ClacksMessage("", msg +"\n");
            outgoing.add(cmsg);
            try {
                handler.sendResponse(exchg, 200, "text/plain", "ok");
            } catch (IOException ex) {
                AbbozzaLogger.stackTrace(ex);
            }
        }
        return request;
    }

    /**
     * Send the message to the serial port
     *
     * @param msg The message to be send
     */
    /*
    private void handleMessage(Message msg) {

        // Check if web message
        if (msg.getHandler() == null) {
            // If not, simply write it
            AbbozzaLogger.err("ClacksService: Sending message " + msg.toString() + " to board");
            // Append a newline
            ClacksMessage cmsg = new ClacksMessage("", msg.toString());
            outgoing.add(cmsg);
        } else {
            // Otherwise it is a message retreived from the http handler

            if (!serialPort.isOpen()) {
                // If the serial port is not open, send an error code
                SerialHandler handler = msg.getHandler();
                if (handler != null) {
                    try {
                        handler.sendResponse(msg.getHttpExchange(), 400, "text/plain", "No board connected!");
                    } catch (IOException ex) {
                        AbbozzaLogger.err("ClacksService: Could not write to serial port");
                    }
                }
            } else {
                // If the serial port is open,, send it
                AbbozzaLogger.out("ClacksService: Sending message " + msg.toString() + " to board", AbbozzaLogger.DEBUG);
                // Append a newline
                if (msg.getTimeout() > 0) {
                    outgoing.add(new ClacksMessage("", msg.toString()));
                    msg.startTimeOut();
                    waitingMessages.put(msg.getID(), msg);
                } else {
                    outgoing.add(new ClacksMessage("", msg.toString()));
                }
            }
        }
    }

    /**
     * Enque a message for sending without timeout and without waiting for it.
     *
     * @param msg The message
     *
     * @return The enqued message object
     */
 /*
    public synchronized Message sendMessage(String msg) {
        Message mesg = new Message("", msg, null, null, 0);
        messages.add(mesg);
        return mesg;
    }
     */
    /**
     * Enque a message for sending without timeout and without waiting for it.
     *
     * @param msg The message
     */
    /*
    public synchronized Message sendMessage(String id, String msg, HttpExchange exchg, SerialHandler handler, long timeout) {
        Message mesg = new Message(id, msg, exchg, handler, timeout);
        messages.add(mesg);
        return mesg;
    }
     */
    public synchronized void sendResponse(ClacksMessage msg) {
        int pos;
        if (msg.getPrefix().startsWith("_")) {
            AbbozzaLogger.out("ClacksService: sending response " + msg);
            String id = msg.getPrefix();
            AbbozzaLogger.out("ClacksService: Checking response for message id " + id);
            ClacksRequest request = waitingMessages.get(id);
            if (request != null) {
                try {
                    String mesg = msg.getMsg().trim();
                    AbbozzaLogger.out("AbbozzaMonitor: Try to send " + msg);
                    waitingMessages.remove(id);
                    // try {
                    request.setResponse(mesg);
                    request.setState(Message.RESPONSE_READY);
                    request.getHandler().sendResponse(request.getHttpExchange(), 200, "text/plain", mesg);
                    publish(new ClacksStatus("Answered " + mesg + "to request", "info"));
                } catch (IOException ex) {
                    AbbozzaLogger.err("ClacksService: Could not send response");
                }
            }
        }
    }

}
