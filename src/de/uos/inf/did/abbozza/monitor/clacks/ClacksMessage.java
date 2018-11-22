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
package de.uos.inf.did.abbozza.monitor.clacks;

import de.uos.inf.did.abbozza.monitor.AbbozzaMonitor;
import jssc.SerialPortException;

/**
 *
 * @author michael
 */


public class ClacksMessage implements ClacksPacket {
    
    private String prefix;
    private String msg;
    
    
    public ClacksMessage(String p, String m) {
        prefix = p;
        msg = m;
    }
    
    public String getPrefix() {
        return prefix;
    }
    
    
    public String getMsg() {
        return msg;
    }
    
    
    @Override
    public void process(AbbozzaMonitor monitor) {
        // send the packet to the receiving panel
        monitor.process(this);
    }

    @Override
    public void process(ClacksSerialPort serialPort) {
        ClacksStatus status;
        try {
            serialPort.writeBytes(msg.getBytes());
            status = new ClacksStatus("-> " + msg,"output");
        } catch (SerialPortException ex) {
            status = new ClacksStatus("Error writing to port","error");
        }
        serialPort.incoming.add(status);
    }

    @Override
    public void process(ClacksSubscriber subscriber) {
        // Do nothing
    }

    @Override
    public void processFromPort(ClacksService service) {
        // This message was parsed from the invcoming bytes and should be published
        // Check if the prefix is an id
        if ( prefix.startsWith("_") ) {
            service.sendResponse(this);   
        } else {
            service.publishPacket(this);
        }
    }

    @Override
    public void processToPort(ClacksService service) {
        service.outgoing.add(this);
    }
    
}
