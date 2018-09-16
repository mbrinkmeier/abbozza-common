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

import de.uos.inf.did.abbozza.core.AbbozzaLogger;
import de.uos.inf.did.abbozza.monitor.AbbozzaMonitor;
import java.util.Arrays;
import jssc.SerialPortException;


/**
 * This object contains a sequence of bytes and a timestamp indicating the time 
 * it was received.
 * 
 * @author mbrinkmeier
 */
public class ClacksBytes implements ClacksPacket {
   
    private long timestamp; // The time the bytes were received
    private byte[] buffer;  // The received bytes
    
    public ClacksBytes(long ts, byte[] buf) {
        timestamp = ts;
        buffer = buf;
    }
    
    public ClacksBytes(String msg) {
        timestamp = System.currentTimeMillis();
        buffer = msg.getBytes();
    }
    
    public long getTimestamp() { return timestamp; }
    
    public byte[] getBytes() { return buffer; }
 
    public ClacksBytes clone() {
        ClacksBytes c = new ClacksBytes(this.timestamp, Arrays.copyOf(this.buffer,this.buffer.length));
        return c;
    }
    
    
    public String toString() {
        String rep = "";
        for ( int i = 0; i < buffer.length; i++ ) {
            rep = rep + buffer[i] + " ";
        }
        return rep;
    }
    
    public int getLength() {
        return buffer.length;
    }
    
    /**
     * The serial port simply writes the bytes without echo
     * 
     * @param serialPort The Clacks serial port that should process this packet
     */
    @Override
    public void process(ClacksSerialPort serialPort) {
        // Send the bytes
        try {
            serialPort.writeBytes(this.buffer);
        } catch (SerialPortException ex) {
            AbbozzaLogger.stackTrace(ex);
            AbbozzaLogger.err("ClacksSerialPort: Could not send bytes to port");
        }
    }

    
    @Override
    public void process(ClacksSubscriber subscriber) {
        // Clone yourself and let the subscriber handle it
        ClacksBytes clone = this.clone();
        subscriber.process(clone);
    }
    
    /**
     * The monitor handles the packet itself
     * 
     * @param monitor The Monitor that should procvess this packet
     */
    @Override
    public void process(AbbozzaMonitor monitor) {
        monitor.process(this);
    }

    @Override
    public void processFromPort(ClacksService service) {
        // First publish the byte packet
        service.publishPacket(this);
        
        // Then parse them an publish the resulting packets
        // Then run them through the parser
        ClacksPacketParser parser = service.getParser();
        parser.addBytes(buffer);
        
        // The parser parses clacks packets from the byte sequence
        ClacksPacket packet;
        while ( ( packet = parser.parse() ) != null  ) {
            packet.processFromPort(service);
        }               
    }

    
    @Override
    public void processToPort(ClacksService service) {
        service.outgoing.add(this);
    }

}
