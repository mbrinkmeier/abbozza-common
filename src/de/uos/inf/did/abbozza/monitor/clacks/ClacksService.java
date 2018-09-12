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
public class ClacksService extends SwingWorker<List<ClacksMessage>, ClacksMessage> {

    // The queue for the bytes received froim the serial port
    protected ConcurrentLinkedQueue<ClacksBytes> incoming;

    // The queue for messages to be send via the serial port
    protected ConcurrentLinkedQueue<ClacksBytes> outgoing;

    // The queue for messages received from the monitor or the http handler
    protected ConcurrentLinkedQueue<Message> messages;

    // The queue for waiting messages 
    protected HashMap<String, Message> waitingMessages;

    protected ClacksSerialPort serialPort;
    protected AbbozzaMonitor monitor;
    protected Thread serialThread;
    protected ClacksMsgParser parser;

    private String portName = null;
    private int portRate = 0;
    
    private LinkedList<ClacksSubscriber> subscribers;

    /**
     * The constructor
     * 
     * @param mon 
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
        
        parser = new ClacksMsgParser();
    }

    
    /**
     * The work done in the background.
     *
     * @return nothing
     * @throws Exception
     */
    @Override
    protected List<ClacksMessage> doInBackground() throws Exception {

        AbbozzaLogger.err("ClacksService starting");

        // Get port and rate if not known already
        if ( portName == null ) {
            portName = serialPort.getSerialPort();
        }
        
        // No port found
        if ( portName == null ) {
            AbbozzaLogger.err("ClacksService : No serial port found");
            return null;
        }
        
        if ( portRate == 0 ) {
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
            if ( (!incoming.isEmpty()) && ( count < 10) ) {
                ClacksBytes bytes = incoming.poll();
                
                parser.addBytes(bytes.getBytes());
                ClacksMessage cMsg;
                while ( (cMsg = parser.parse()) != null  ) {
                    publish(cMsg);
                }
                
                publish(new ClacksMessage(bytes));
                count++;
            }

            // Check the message queue and send them to the serial port
            while ( !messages.isEmpty() ) {                
                handleMessage(messages.poll());
            }

            // Check waiting messages for timeouts
            if (!waitingMessages.isEmpty()) {
                for (Message msg : waitingMessages.values() ) {
                    // Remove timed out requests
                    if (msg.isTimedOut()) {
                        waitingMessages.remove(msg.getID());
                        AbbozzaLogger.out("AbbozzaMonitor: Message " + msg.getID() + " timed out");
                        msg.setResponse("timed out!");
                    }
                }
            }
      
            // Now sleep a bit, so that other get the chance to do their work
            Thread.sleep(0,100);

        }
        AbbozzaLogger.err("ClacksService stopped");

        return null;
    }

    /**
     * Suspend the serial connection
     */
    public void suspendPort() {
        if ( serialPort != null ) serialPort.suspend();
    }

    /**
     * resume the serial connection
     */
    public void resumePort() {
        if ( serialPort != null ) serialPort.resume();
    }

    
    public void setPort(String port) {
        portName = port;
        if ( serialPort != null && serialPort.isOpen() ) {
            serialPort.close();
        }
        if ( serialPort != null ) {
            serialPort.open(portName,portRate);
        }
        
    }
    
    
    /**
     * Set the baud rate of the connection
     *
     * @param rate
     */
    public void setRate(int rate) {
        if ( rate != portRate ) {
            portRate = rate;           
            if ( serialPort != null ) serialPort.setRate(rate);
        }
    }

    /**
     * Distribute ClacksBytes to subscribers
     *
     * @param chunks
     */
    @Override
    protected void process(List<ClacksMessage> chunks) {  
        for (ClacksMessage msg : chunks) {

            if ( msg.getPrefix() == null ) {
                for (ClacksSubscriber subscriber : subscribers) {
                    subscriber.process(msg.getBytes());
                }
            } else {
                // Messages with prefix are only send to the monitor
                monitor.process(msg);
            }
        }
    }

    /**
     * Send the message to the serial port
     *
     * @param msg The message to be send
     */
    private void handleMessage(Message msg) {

        // Check if web message
        if (msg.getHandler() == null) {
            // If not, simply write it
            AbbozzaLogger.err("ClacksService: Sending message " + msg.toString() + " to board");
            // Append a newline
            outgoing.add(new ClacksBytes(msg.toString()));
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
                    outgoing.add(new ClacksBytes(msg.toString()));
                    msg.startTimeOut();
                    waitingMessages.put(msg.getID(),msg);
                } else {
                    outgoing.add(new ClacksBytes(msg.toString()));
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
    public synchronized Message sendMessage(String msg) {
        Message mesg = new Message("", msg, null, null, 0);
        messages.add(mesg);
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
        messages.add(mesg);
        return mesg;
    }

    
    public synchronized void sendResponse(String msg) {
        int pos;
        Message _msg;
        msg = msg.trim();
        if (msg.startsWith("_")) {
            AbbozzaLogger.out("ClacksService: sending response " + msg);
            pos = msg.indexOf(' ');
            String id = msg.substring(0, pos);
            AbbozzaLogger.out("ClacksService: Checking response for message id " + id);
            _msg = waitingMessages.get(id);
            if (_msg != null) {
                try {
                    msg = "[[" + _msg.getIdPostfix() + " " + msg.substring(pos).trim() + "]]";
                    AbbozzaLogger.out("AbbozzaMonitor: Try to send " + msg);
                    waitingMessages.remove(id);
                    // try {
                    _msg.setResponse(msg);
                    _msg.setState(Message.RESPONSE_READY);
                    _msg.getHandler().sendResponse(_msg.getHttpExchange(), 200, "text/plain", msg);
                } catch (IOException ex) {
                    AbbozzaLogger.err("ClacksService: Could not send response");
                }
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
        
}
